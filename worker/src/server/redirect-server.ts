/**
 * HTTP Redirect Server — Monetização & Tracking de Afiliados (Fase 5)
 *
 * Expõe os endpoints na porta 3002:
 *   GET /r?offer_id=<UUID>           → Redirecionamento 302 com Auto-Healing de Links
 *   GET /api/live-compare?product_id → Raspagem e Sincronização Estrita de Preços Ao Vivo (Zero Falsos Positivos)
 *   GET /health                      → Status do Serviço
 */

import http from 'node:http';
import { URL } from 'node:url';
import { registerClick } from '../agents/affiliate-agent.ts';
import { updateOfferPrice, upsertVerifiedOffer } from '../agents/price-agent.ts';
import { getConnector } from '../stores/registry.ts';
import { db } from '../database/client.ts';

const PORT = parseInt(process.env.REDIRECT_PORT || '3002', 10);

/**
 * Constrói URL de Busca Ao Vivo na Loja Parceira caso a URL do produto esteja expirada/404
 */
function getStoreSearchUrl(originalUrl: string, productTitle?: string): string {
  if (!originalUrl) return 'https://www.belezanaweb.com.br';
  const u = originalUrl.toLowerCase();

  const cleanTitle = (productTitle || 'perfume')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const q = encodeURIComponent(cleanTitle || 'perfume');

  if (u.includes('amazon.com.br')) return `https://www.amazon.com.br/s?k=${q}`;
  if (u.includes('mercadolivre.com.br')) return `https://lista.mercadolivre.com.br/${q.replace(/%20/g, '-')}`;
  if (u.includes('belezanaweb.com.br')) return `https://www.belezanaweb.com.br/busca?q=${q}`;
  if (u.includes('boticario.com.br')) return `https://www.boticario.com.br/busca?q=${q}`;
  if (u.includes('natura.com.br')) return `https://www.natura.com.br/c/perfumaria/masculino`;
  if (u.includes('lojasrenner.com.br')) return `https://www.lojasrenner.com.br/busca?Ntt=${q}`;
  if (u.includes('netshoes.com.br')) return `https://www.netshoes.com.br/busca?q=${q}`;
  if (u.includes('dafiti.com.br')) return `https://www.dafiti.com.br/catalog/?q=${q}`;
  if (u.includes('hering.com.br')) return `https://www.hering.com.br/busca?q=${q}`;
  if (u.includes('cea.com.br')) return `https://www.cea.com.br/busca?q=${q}`;
  if (u.includes('democrata.com.br')) return `https://www.democrata.com.br/busca?q=${q}`;
  if (u.includes('ferracini.com.br')) return `https://www.ferracini.com.br/busca?q=${q}`;

  return originalUrl;
}

export function startRedirectServer(): http.Server {
  const server = http.createServer(async (req, res) => {
    // Habilita CORS para requisições da extensão Chrome
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const reqUrl = req.url || '/';
      const parsedUrl = new URL(reqUrl, `http://localhost:${PORT}`);
      const pathname = parsedUrl.pathname;

      // Healthcheck
      if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'elitebot-redirect-server' }));
        return;
      }

      // Rota de Raspagem e Sincronização Estrita de Preços Ao Vivo (Zero Falsos Positivos)
      if (pathname === '/api/live-compare') {
        const productId = parsedUrl.searchParams.get('product_id') || parsedUrl.searchParams.get('id');

        if (!productId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parâmetro product_id é obrigatório.' }));
          return;
        }

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        if (!isUuid) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify([]));
          return;
        }

        // 1. Busca dados do produto canônico e EAN
        const prodRow = await db.query<{ name: string; ean?: string }>(
          `SELECT p.name, pi.identifier_value AS ean
             FROM products p
        LEFT JOIN product_identifiers pi ON pi.product_id = p.id AND pi.identifier_type = 'ean'
            WHERE p.id = $1 LIMIT 1`,
          [productId]
        );

        if (prodRow.rows.length === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Produto não encontrado no catálogo.' }));
          return;
        }

        const product = prodRow.rows[0];

        // 2. Busca ofertas ativas reais do produto no banco PostgreSQL
        const offersRes = await db.query<{
          id: string;
          product_id: string;
          product_url: string;
          title: string;
          store_domain: string;
          store_name: string;
          price: number;
          original_price?: number;
          shipping_price: number;
          availability: string;
        }>(
          `SELECT o.id, o.product_id, o.product_url, o.title, s.domain AS store_domain, s.name AS store_name,
                  o.price, o.original_price, o.shipping_price, o.availability
             FROM offers o
             JOIN stores s ON s.id = o.store_id
            WHERE o.product_id = $1
              AND o.is_active = TRUE`,
          [productId]
        );

        // Se ofertas reais já existem, dispara raspagem em paralelo para atualização ao vivo
        if (offersRes.rows.length > 0) {
          const VARIANTS = ['extremo', 'aventura', 'oceano', 'urbe', 'pulso', 'vital', 'aero', 'black', 'gold', 'intense', 'absoluto', 'bleu', 'santal', 'infinity', 'bomb', 'botanic', 'clash', 'original', 'oud', 'sagaz'];

          const scrapePromises = offersRes.rows.map(async (offer) => {
            // Filtra divergência grosseira de variante no título da oferta vs produto
            const prodLower = product.name.toLowerCase();
            const offerLower = (offer.title || offer.product_url).toLowerCase();
            for (const v of VARIANTS) {
              if (prodLower.includes(v) !== offerLower.includes(v)) {
                return null; // Mismatch de variante!
              }
            }

            try {
              const connector = getConnector(offer.store_domain);
              if (connector) {
                const scraped = await connector.scrapeOffer(offer.product_url);
                if (scraped && scraped.price > 0) {
                  // Validação EAN estrita: se a página expuser EAN diferente do produto, rejeita a oferta
                  if (scraped.ean && product.ean && scraped.ean !== product.ean) {
                    console.warn(`[live-compare] EAN mismatch for ${offer.store_domain}: expected ${product.ean}, got ${scraped.ean}`);
                    await updateOfferPrice({ offerId: offer.id, price: 0, isActive: false });
                    return null;
                  }

                  await updateOfferPrice({
                    offerId: offer.id,
                    price: scraped.price,
                    originalPrice: scraped.originalPrice,
                    shippingPrice: scraped.shippingPrice,
                    availability: scraped.availability,
                    isActive: true,
                  });

                  return {
                    offer_id: offer.id,
                    product_id: offer.product_id,
                    store_name: offer.store_name,
                    store_domain: offer.store_domain,
                    price: scraped.price,
                    original_price: scraped.originalPrice || (offer.original_price ? parseFloat(offer.original_price as unknown as string) : undefined),
                    shipping_price: scraped.shippingPrice,
                    total_price: scraped.price + scraped.shippingPrice,
                    availability: scraped.availability || 'in_stock',
                    product_url: offer.product_url,
                    is_live_scraped: true,
                  };
                }
              }
            } catch (e) {
              console.warn(`[live-compare] Error scraping ${offer.store_domain}:`, e);
            }

            return {
              offer_id: offer.id,
              product_id: offer.product_id,
              store_name: offer.store_name,
              store_domain: offer.store_domain,
              price: parseFloat(offer.price as unknown as string),
              original_price: offer.original_price ? parseFloat(offer.original_price as unknown as string) : undefined,
              shipping_price: parseFloat(offer.shipping_price as unknown as string),
              total_price: parseFloat(offer.price as unknown as string) + parseFloat(offer.shipping_price as unknown as string),
              availability: offer.availability,
              product_url: offer.product_url,
              is_live_scraped: false,
            };
          });

          const rawResults = await Promise.all(scrapePromises);
          const validResults = rawResults.filter((r): r is NonNullable<typeof r> => r !== null && r.price > 0);
          validResults.sort((a, b) => a.total_price - b.total_price);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(validResults));
          return;
        }


        // Se nenhuma oferta real existe no banco (purge concluído), retorna array limpo de ofertas verificadas (zero falsos positivos)
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
        return;
      }

      // Rota de Redirecionamento (/r ou /r/<offerId>)
      if (pathname === '/r' || pathname.startsWith('/r/')) {
        let offerId = parsedUrl.searchParams.get('offer_id') || parsedUrl.searchParams.get('id');

        if (!offerId && pathname.startsWith('/r/')) {
          offerId = pathname.substring(3).trim();
        }

        if (!offerId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parâmetro offer_id é obrigatório. Ex: /r?offer_id=UUID' }));
          return;
        }

        const sourceParam = parsedUrl.searchParams.get('source');
        const source = sourceParam === 'extension' ? 'extension' : 'website';
        const campaign = parsedUrl.searchParams.get('campaign') || undefined;
        const userId = parsedUrl.searchParams.get('user_id') || undefined;
        const fallbackUrl = parsedUrl.searchParams.get('fallback');

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(offerId);
        const isUrlOfferId = offerId.startsWith('http://') || offerId.startsWith('https://');

        let offerTitle = '';
        let dbAffiliateUrl: string | null = null;

        if (isUuid) {
          try {
            const offerRow = await db.query<{ title: string; product_name?: string; affiliate_url?: string; product_url?: string }>(
              `SELECT o.title, o.affiliate_url, o.product_url, p.name AS product_name 
                 FROM offers o 
            LEFT JOIN products p ON p.id = o.product_id 
                WHERE o.id = $1`,
              [offerId]
            );
            if (offerRow.rows.length > 0) {
              const row = offerRow.rows[0];
              offerTitle = row.product_name || row.title || '';
              dbAffiliateUrl = row.affiliate_url || row.product_url || null;
            }

            await registerClick({
              offerId,
              userId,
              source,
              campaign,
            }).catch((e) => console.warn('[affiliate-redirect] warning registering click:', e));
          } catch (e) {
            console.warn('[affiliate-redirect] warning fetching offer title:', e);
          }
        }

        let rawTargetUrl = dbAffiliateUrl || fallbackUrl || (isUrlOfferId ? offerId : null) || 'https://www.belezanaweb.com.br';
        if (rawTargetUrl && !rawTargetUrl.startsWith('http://') && !rawTargetUrl.startsWith('https://')) {
          rawTargetUrl = `https://${rawTargetUrl}`;
        }

        // Verifica se a URL já é um link direto funcional para o produto
        let isDirectProductUrl = false;
        try {
          const parsedTarget = new URL(rawTargetUrl);
          const path = parsedTarget.pathname.toLowerCase();
          isDirectProductUrl =
            path.includes('/p/') ||
            path.endsWith('/p') ||
            path.includes('/dp/') ||
            path.includes('/produto/') ||
            path.includes('/pdp/') ||
            path.includes('/item/') ||
            path.endsWith('.html') ||
            (path.length > 5 && !path.includes('/busca') && !path.includes('/c/') && !path.includes('/catalog'));
        } catch {
          isDirectProductUrl = false;
        }

        // Auto-Healing: Só converte para busca se NÃO for um link direto válido de produto
        let targetUrl = rawTargetUrl;
        if (!isDirectProductUrl) {
          targetUrl = getStoreSearchUrl(rawTargetUrl, offerTitle);
        }

        console.log(
          `[affiliate-redirect] offer_id=${offerId} source=${source} isDirect=${isDirectProductUrl} ➔ 302 Redirect to: ${targetUrl}`,
        );

        // Retorna Redirecionamento HTTP 302 Found
        res.writeHead(302, {
          Location: targetUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        res.end();
        return;
      }


      // Rota não encontrada
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Rota não encontrada. Utilize /r?offer_id=UUID ou /api/live-compare' }));
    } catch (err) {
      console.error('[affiliate-redirect] Erro interno:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro interno ao processar a requisição' }));
    }
  });

  server.listen(PORT, () => {
    console.log(`[affiliate-redirect] Servidor de monetização e raspagem ao vivo rodando na porta http://localhost:${PORT}`);
  });

  return server;
}
