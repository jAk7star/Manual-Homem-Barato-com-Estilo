/**
 * RennerConnector — Connector para Lojas Renner (lojasrenner.com.br)
 *
 * Estratégia de extração:
 *   1. HTTP GET da URL do produto com headers de navegador Desktop.
 *   2. Extração do bloco <script type="application/ld+json"> com @type: Product ou ProductGroup.
 *   3. Fallback por meta tags og:price:amount, product:price:amount e og:title.
 */

import { parse } from 'node-html-parser';
import type { ScrapedOffer, StoreConnector } from './types.ts';

const DOMAIN = 'lojasrenner.com.br';

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const REQUEST_TIMEOUT_MS = 10_000;

function parsePrice(raw: unknown): number | null {
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) return raw;
  if (typeof raw === 'string') {
    const s = raw.replace(/R\$\s*/gi, '').trim();
    if (s.includes(',')) {
      const cleaned = s.replace(/\./g, '').replace(',', '.');
      const n = parseFloat(cleaned);
      if (isFinite(n) && n > 0) return n;
    }
    const n = parseFloat(s);
    if (isFinite(n) && n > 0) return n;
  }
  return null;
}

export const RennerConnector: StoreConnector = {
  domain: DOMAIN,

  async scrapeOffer(url: string): Promise<ScrapedOffer | null> {
    try {
      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        redirect: 'follow',
      });

      if (!response.ok) {
        console.warn(`[renner] HTTP ${response.status} for ${url}`);
        return null;
      }

      const html = await response.text();
      const root = parse(html);

      // Estratégia 1: JSON-LD
      const ldScripts = root.querySelectorAll('script[type="application/ld+json"]');
      for (const script of ldScripts) {
        try {
          const parsed = JSON.parse(script.textContent);
          const candidates = Array.isArray(parsed) ? parsed : [parsed];

          for (const candidate of candidates) {
            if (
              candidate &&
              typeof candidate === 'object' &&
              (candidate['@type'] === 'Product' || candidate['@type'] === 'ProductGroup')
            ) {
              const offersObj = Array.isArray(candidate.offers)
                ? candidate.offers[0]
                : candidate.offers;

              if (offersObj && typeof offersObj === 'object') {
                const price = parsePrice(offersObj.price ?? offersObj.lowPrice);
                if (price) {
                  return {
                    price,
                    shippingPrice: 0,
                    availability:
                      offersObj.availability?.includes('InStock') ? 'in_stock' : 'in_stock',
                    title: candidate.name ?? root.querySelector('title')?.textContent?.trim(),
                    sku: candidate.sku ?? offersObj.sku,
                    ean: candidate.gtin13 ?? candidate.gtin,
                  };
                }
              }
            }
          }
        } catch {}
      }

      // Estratégia 2: Meta Tags
      const priceMeta =
        root.querySelector('meta[property="og:price:amount"]') ||
        root.querySelector('meta[property="product:price:amount"]');
      const rawPrice = priceMeta?.getAttribute('content');
      const price = parsePrice(rawPrice);

      if (price) {
        const titleMeta = root.querySelector('meta[property="og:title"]');
        return {
          price,
          shippingPrice: 0,
          availability: 'in_stock',
          title: titleMeta?.getAttribute('content') ?? root.querySelector('title')?.textContent?.trim(),
        };
      }

      return null;
    } catch (err) {
      console.warn('[renner] scrape error:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
};
