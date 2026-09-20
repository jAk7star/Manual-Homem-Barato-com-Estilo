/**
 * AmazonConnector — Connector para Amazon Brasil (amazon.com.br)
 *
 * Estratégia:
 *   1. HTTP GET da URL do produto na Amazon.
 *   2. Extração de preço de og:price:amount ou seletores .a-price .a-offscreen.
 *   3. Fallback por meta tags og:title.
 */

import { parse } from 'node-html-parser';
import type { ScrapedOffer, StoreConnector } from './types.ts';

const DOMAIN = 'amazon.com.br';

const REQUEST_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
};

const REQUEST_TIMEOUT_MS = 10_000;

export const AmazonConnector: StoreConnector = {
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

      const priceMeta = root.querySelector('meta[property="og:price:amount"]');
      let price = priceMeta ? parseFloat(priceMeta.getAttribute('content') || '') : null;

      if (!price || isNaN(price)) {
        const offscreenPrice = root.querySelector('.a-price .a-offscreen')?.textContent?.trim();
        if (offscreenPrice) {
          const s = offscreenPrice.replace(/R\$\s*/gi, '').replace(/\./g, '').replace(',', '.').trim();
          const parsed = parseFloat(s);
          if (!isNaN(parsed) && parsed > 0) price = parsed;
        }
      }

      if (!price || isNaN(price) || price <= 0) return null;

      const title = root.querySelector('#productTitle')?.textContent?.trim() ||
                    root.querySelector('meta[property="og:title"]')?.getAttribute('content');

      return {
        price,
        shippingPrice: 0,
        availability: 'in_stock',
        title: title || undefined,
      };
    } catch (err) {
      console.warn('[amazon] scrape error:', err instanceof Error ? err.message : String(err));
      return null;
    }
  },
};
