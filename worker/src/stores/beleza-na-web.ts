/**
 * AG-007 (connector) — BelezaNaWebConnector
 *
 * Implementa StoreConnector para belezanaweb.com.br.
 *
 * Estratégia de extração (validada em DECISÃO-02):
 *   1. HTTP GET da URL de produto com fetch nativo (Node.js 20)
 *   2. Extração do bloco <script type="application/ld+json">
 *   3. O site usa @type:ProductGroup com hasVariant[] contendo @type:Product
 *   4. Seleciona o variant cuja url corresponde à URL da página atual
 *   5. Extrai price, availability, title, sku, gtin13/gtin
 *
 * Campos confirmados na validação real (dois produtos testados):
 *   ✅ price         — número float direto (ex: 482.31)
 *   ✅ priceCurrency — "BRL"
 *   ✅ availability  — URI schema.org (ex: "https://schema.org/InStock")
 *   ✅ name/title    — string
 *   ✅ sku           — SKU interno da loja
 *   ❌ gtin13/gtin   — ausente na maioria dos produtos (campo existe mas vazio)
 *   ❌ shippingPrice — não exposto no JSON-LD → sempre 0
 *
 * Regra de campos opcionais (DECISÃO-02 / PO):
 *   Ausência de sku, ean, mpn, shippingPrice é comportamento normal.
 *   Somente ausência de price utilizável justifica retornar null.
 */

import { parse } from 'node-html-parser';
import type { ScrapedOffer, StoreConnector } from './types.ts';

const DOMAIN = 'belezanaweb.com.br';

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const REQUEST_TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Normalização de availability (DECISÃO-04 + ajuste DECISÃO-02)
// O site retorna URIs schema.org, não strings simples.
// ---------------------------------------------------------------------------
const AVAILABILITY_MAP: Record<
  string,
  'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown'
> = {
  'https://schema.org/instock':    'in_stock',
  'https://schema.org/outofstock': 'out_of_stock',
  'https://schema.org/preorder':   'pre_order',
  // Alias curtos, por segurança
  'instock':    'in_stock',
  'outofstock': 'out_of_stock',
  'preorder':   'pre_order',
  'in_stock':   'in_stock',
  'out_of_stock': 'out_of_stock',
  'pre_order':  'pre_order',
};

function normalizeAvailability(
  raw: unknown,
): 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown' {
  if (typeof raw !== 'string') return 'unknown';
  return AVAILABILITY_MAP[raw.toLowerCase()] ?? 'unknown';
}

// ---------------------------------------------------------------------------
// Extração de preço
// O JSON-LD da Beleza na Web já retorna número float — não há formatação BRL.
// Mantemos a conversão defensiva caso algum variant retorne string.
// ---------------------------------------------------------------------------
function parsePrice(raw: unknown): number | null {
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) return raw;
  if (typeof raw === 'string') {
    const s = raw.replace(/R\$\s*/gi, '').trim();

    // Detecta formato BRL com vírgula decimal: "1.299,90" → "1299.90"
    // O ponto é separador de milhar apenas quando seguido de exatamente 3 dígitos antes de vírgula ou fim.
    if (s.includes(',')) {
      const cleaned = s.replace(/\./g, '').replace(',', '.');
      const n = parseFloat(cleaned);
      if (isFinite(n) && n > 0) return n;
    }

    // Formato com ponto decimal (já normalizado): "482.31", "1299.90"
    const n = parseFloat(s);
    if (isFinite(n) && n > 0) return n;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Seleciona o variant correto dentro de hasVariant[]
// Critério: variant.url corresponde (normalizada) à URL da página.
// Fallback: primeiro variant com price > 0.
// ---------------------------------------------------------------------------
function selectVariant(
  variants: unknown[],
  pageUrl: string,
): Record<string, unknown> | null {
  if (!Array.isArray(variants) || variants.length === 0) return null;

  const normalizeUrl = (u: string) =>
    u.toLowerCase().replace(/\/$/, '').split('?')[0];

  const targetUrl = normalizeUrl(pageUrl);

  // Tentativa 1: variant cuja url bate com a URL da página
  for (const v of variants) {
    if (
      v !== null &&
      typeof v === 'object' &&
      typeof (v as Record<string, unknown>)['url'] === 'string'
    ) {
      const vUrl = normalizeUrl((v as Record<string, unknown>)['url'] as string);
      if (vUrl === targetUrl) return v as Record<string, unknown>;
    }
  }

  // Fallback: primeiro variant que tenha um price utilizável
  for (const v of variants) {
    if (v !== null && typeof v === 'object') {
      const rec = v as Record<string, unknown>;
      const offers = rec['offers'];
      if (
        offers !== null &&
        typeof offers === 'object' &&
        parsePrice((offers as Record<string, unknown>)['price']) !== null
      ) {
        return rec;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Parser principal: extrai ScrapedOffer do HTML
// ---------------------------------------------------------------------------
function extractFromHtml(html: string, url: string): ScrapedOffer | null {
  const root = parse(html);
  const ldScripts = root.querySelectorAll(
    'script[type="application/ld+json"]',
  );

  for (const script of ldScripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(script.textContent);
    } catch {
      continue;
    }

    if (parsed === null || typeof parsed !== 'object') continue;

    // O bloco pode ser um array (ex: [{@type:ProductGroup}, ...]) ou um objeto direto.
    // Normalizamos para array e procuramos o ProductGroup em qualquer posição.
    const candidates: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

    let obj: Record<string, unknown> | null = null;
    for (const candidate of candidates) {
      if (
        candidate !== null &&
        typeof candidate === 'object' &&
        (candidate as Record<string, unknown>)['@type'] === 'ProductGroup'
      ) {
        obj = candidate as Record<string, unknown>;
        break;
      }
    }

    // Localiza ProductGroup
    if (obj === null) continue;

    const variants = obj['hasVariant'];
    if (!Array.isArray(variants)) continue;

    const variant = selectVariant(variants, url);
    if (variant === null) continue;

    // Extrai offers do variant
    const offers = variant['offers'];
    if (offers === null || typeof offers !== 'object') continue;
    const offersObj = offers as Record<string, unknown>;

    // price é obrigatório — null justifica retornar null
    const price = parsePrice(offersObj['price']);
    if (price === null) return null;

    const result: ScrapedOffer = {
      price,
      // shippingPrice: não exposto no JSON-LD da Beleza na Web (DECISÃO-05 + ajuste DECISÃO-02)
      shippingPrice: 0,
      availability: normalizeAvailability(offersObj['availability']),
    };

    // originalPrice — via offers.priceSpecification ou offers.highPrice (ausente atualmente;
    // campo preservado para quando o site o expuser)
    const origRaw =
      offersObj['originalPrice'] ??
      offersObj['highPrice'] ??
      variant['originalPrice'];
    const orig = parsePrice(origRaw);
    if (orig !== null && orig > price) result.originalPrice = orig;

    // title — do variant ou do grupo
    const nameRaw = variant['name'] ?? obj['name'];
    if (typeof nameRaw === 'string' && nameRaw.trim().length > 0) {
      result.title = nameRaw.trim();
    }

    // sku — SKU interno da loja (DECISÃO-03: nunca tratar como ean)
    const skuRaw = variant['sku'] ?? offersObj['sku'];
    if (typeof skuRaw === 'string' && skuRaw.trim().length > 0) {
      result.sku = skuRaw.trim();
    }

    // ean — somente gtin13 ou gtin14 (campos globais)
    // Ausência é normal para a Beleza na Web (ajuste DECISÃO-02)
    const gtin13 = variant['gtin13'];
    const gtin14 = variant['gtin14'];
    const gtin   = variant['gtin'];
    const eanRaw = gtin13 ?? gtin14 ?? gtin;
    if (typeof eanRaw === 'string' && eanRaw.trim().length > 0) {
      result.ean = eanRaw.trim();
    }

    // mpn
    const mpnRaw = variant['mpn'];
    if (typeof mpnRaw === 'string' && mpnRaw.trim().length > 0) {
      result.mpn = mpnRaw.trim();
    }

    return result;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Connector
// ---------------------------------------------------------------------------
export const BelezaNaWebConnector: StoreConnector = {
  domain: DOMAIN,

  async scrapeOffer(url: string): Promise<ScrapedOffer | null> {
    try {
      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        redirect: 'follow',
      });

      if (!response.ok) {
        console.warn(
          `[beleza-na-web] HTTP ${response.status} for ${url}`,
        );
        return null;
      }

      const html = await response.text();
      return extractFromHtml(html, url);
    } catch (err) {
      // Nunca lança — o job não trata exceções do connector
      console.warn(
        '[beleza-na-web] scrape error:',
        err instanceof Error ? err.message : String(err),
      );
      return null;
    }
  },
};
