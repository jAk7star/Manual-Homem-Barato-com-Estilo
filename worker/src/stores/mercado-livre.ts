/**
 * MercadoLivreConnector — Connector para Mercado Livre (mercadolivre.com.br)
 *
 * Estratégia de extração (API Oficial Pública + Fallback HTML):
 *   1. Extrai o ID do item Mercado Livre (ex: MLB1234567890 ou MLB-1234567890) da URL.
 *   2. Se o ID for encontrado, chama a API Pública Oficial:
 *      GET https://api.mercadolibre.com/items/MLB{id}
 *   3. Parseia price, original_price, status, available_quantity, title e GTIN (EAN).
 *   4. Fallback: Caso a API falhe, faz fetch no HTML da página e extrai meta tags / JSON-LD.
 */

import { parse } from 'node-html-parser';
import type { ScrapedOffer, StoreConnector } from './types.ts';

const DOMAIN = 'mercadolivre.com.br';

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Extrai o ID MLB da URL.
 * Exemplos:
 *   https://produto.mercadolivre.com.br/MLB-3567890123-perfume-...
 *   https://www.mercadolivre.com.br/p/MLB28901234
 */
function extractMlbId(url: string): string | null {
  const match = url.match(/MLB-?(\d+)/i);
  if (match && match[1]) {
    return `MLB${match[1]}`;
  }
  return null;
}

interface MliAttribute {
  id?: string;
  name?: string;
  value_name?: string;
}

interface MliItemResponse {
  title?: string;
  price?: number;
  original_price?: number | null;
  status?: string;
  available_quantity?: number;
  attributes?: MliAttribute[];
  shipping?: {
    free_shipping?: boolean;
  };
}

export const MercadoLivreConnector: StoreConnector = {
  domain: DOMAIN,

  async scrapeOffer(url: string): Promise<ScrapedOffer | null> {
    const mlbId = extractMlbId(url);

    // Estratégia 1: API Pública Oficial do Mercado Livre
    if (mlbId) {
      try {
        const apiUrl = `https://api.mercadolibre.com/items/${mlbId}`;
        const response = await fetch(apiUrl, {
          headers: REQUEST_HEADERS,
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (response.ok) {
          const data = (await response.json()) as MliItemResponse;

          if (typeof data.price === 'number' && data.price > 0) {
            const isAvailable =
              data.status === 'active' && (data.available_quantity ?? 0) > 0;

            const result: ScrapedOffer = {
              price: data.price,
              shippingPrice: data.shipping?.free_shipping ? 0 : 0,
              availability: isAvailable ? 'in_stock' : 'out_of_stock',
              title: data.title,
            };

            if (
              typeof data.original_price === 'number' &&
              data.original_price > data.price
            ) {
              result.originalPrice = data.original_price;
            }

            // Busca GTIN / EAN nos atributos da API
            if (Array.isArray(data.attributes)) {
              const gtinAttr = data.attributes.find(
                (attr) =>
                  attr.id === 'GTIN' ||
                  attr.id === 'EAN' ||
                  attr.name?.toUpperCase() === 'GTIN',
              );
              if (gtinAttr?.value_name && gtinAttr.value_name.trim().length > 0) {
                result.ean = gtinAttr.value_name.trim();
              }

              const skuAttr = data.attributes.find(
                (attr) => attr.id === 'SELLER_SKU' || attr.id === 'SKU',
              );
              if (skuAttr?.value_name && skuAttr.value_name.trim().length > 0) {
                result.sku = skuAttr.value_name.trim();
              }
            }

            return result;
          }
        }
      } catch (err) {
        console.warn(
          `[mercado-livre] API fetch failed for ${mlbId}, attempting HTML fallback:`,
          err instanceof Error ? err.message : String(err),
        );
      }
    }

    // Estratégia 2 (Fallback HTML): raspagem via Meta Tags / JSON-LD da página do produto
    try {
      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        redirect: 'follow',
      });

      if (!response.ok) {
        console.warn(`[mercado-livre] HTTP ${response.status} for ${url}`);
        return null;
      }

      const html = await response.text();
      const root = parse(html);

      // Meta Tag og:price:amount
      const priceMeta = root.querySelector('meta[property="og:price:amount"]');
      const rawPrice = priceMeta?.getAttribute('content');
      const price = rawPrice ? parseFloat(rawPrice) : null;

      if (!price || isNaN(price) || price <= 0) {
        return null;
      }

      const titleMeta = root.querySelector('meta[property="og:title"]');
      const title = titleMeta?.getAttribute('content') ?? undefined;

      return {
        price,
        shippingPrice: 0,
        availability: 'in_stock',
        title,
      };
    } catch (err) {
      console.warn(
        '[mercado-livre] HTML scrape error:',
        err instanceof Error ? err.message : String(err),
      );
      return null;
    }
  },
};
