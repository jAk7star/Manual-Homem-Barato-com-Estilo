/**
 * FerraciniConnector — Connector para Ferracini Calçados (ferracini.com.br)
 */

import { parse } from 'node-html-parser';
import type { ScrapedOffer, StoreConnector } from './types.ts';

const DOMAIN = 'ferracini.com.br';

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

export const FerraciniConnector: StoreConnector = {
  domain: DOMAIN,

  async scrapeOffer(url: string): Promise<ScrapedOffer | null> {
    try {
      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        redirect: 'follow',
      });

      if (!response.ok) return null;

      const html = await response.text();
      const root = parse(html);

      const ldScripts = root.querySelectorAll('script[type="application/ld+json"]');
      for (const script of ldScripts) {
        try {
          const parsed = JSON.parse(script.textContent);
          const candidates = Array.isArray(parsed) ? parsed : [parsed];

          for (const candidate of candidates) {
            if (candidate && typeof candidate === 'object' && (candidate['@type'] === 'Product' || candidate['@type'] === 'ProductGroup')) {
              const offersObj = Array.isArray(candidate.offers) ? candidate.offers[0] : candidate.offers;
              if (offersObj && typeof offersObj === 'object') {
                const price = parsePrice(offersObj.price ?? offersObj.lowPrice);
                if (price) {
                  return {
                    price,
                    shippingPrice: 0,
                    availability: 'in_stock',
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

      const priceMeta = root.querySelector('meta[property="og:price:amount"]') || root.querySelector('meta[property="product:price:amount"]');
      const price = parsePrice(priceMeta?.getAttribute('content'));
      if (price) {
        return {
          price,
          shippingPrice: 0,
          availability: 'in_stock',
          title: root.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? root.querySelector('title')?.textContent?.trim(),
        };
      }

      return null;
    } catch (err) {
      console.warn('[ferracini] scrape error:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
};
