/**
 * JOB-001 — Ingest Prices
 *
 * Coleta preços de todas as lojas ativas e atualiza ofertas + histórico.
 *
 * Garantia de Links Funcionais:
 *   - Ofertas com scraping bem sucedido (HTTP 200) -> is_active = TRUE
 *   - Ofertas com erros 404/410 ou raspagem nula -> is_active = FALSE (removidas das views da API)
 */

import { updateOfferPrice } from '../agents/price-agent.ts';
import { getConnector } from '../stores/registry.ts';
import { db } from '../database/client.ts';

interface JobResult {
  job: string;
  startedAt: Date;
  finishedAt?: Date;
  status: 'success' | 'error';
  offersFound: number;
  offersUpdated: number;
  offersDeactivated: number;
  errors: number;
  errorDetails: string[];
}

export async function jobIngestPrices(): Promise<JobResult> {
  const result: JobResult = {
    job: 'ingest-prices',
    startedAt: new Date(),
    status: 'success',
    offersFound: 0,
    offersUpdated: 0,
    offersDeactivated: 0,
    errors: 0,
    errorDetails: [],
  };

  try {
    const offersResult = await db.query<{
      id: string;
      product_url: string;
      store_domain: string;
    }>(
      `SELECT o.id, o.product_url, s.domain AS store_domain
         FROM offers o
         JOIN stores s ON s.id = o.store_id
        WHERE s.is_active = TRUE`,
    );

    result.offersFound = offersResult.rows.length;

    for (const offer of offersResult.rows) {
      try {
        const connector = getConnector(offer.store_domain);
        if (connector === null) {
          console.log(
            `[ingest-prices] skip offer=${offer.id} — no connector for domain=${offer.store_domain}`,
          );
          continue;
        }

        // Raspa o preço atual via conector da loja
        const scraped = await connector.scrapeOffer(offer.product_url);
        
        if (scraped === null || !scraped.price || scraped.price <= 0) {
          // Link quebrado ou 404: Desativa a oferta no banco para não aparecer na API
          console.log(
            `[ingest-prices] deactivating dead offer=${offer.id} (404/410/invalid) for ${offer.product_url}`,
          );
          await updateOfferPrice({
            offerId: offer.id,
            price: 0,
            availability: 'out_of_stock',
            isActive: false,
          });
          result.offersDeactivated++;
          continue;
        }

        // Link Comprovadamente Funcional: Atualiza preço e confirma status ativo no banco
        await updateOfferPrice({
          offerId: offer.id,
          price: scraped.price,
          originalPrice: scraped.originalPrice,
          shippingPrice: scraped.shippingPrice,
          availability: scraped.availability || 'in_stock',
          isActive: true,
        });

        result.offersUpdated++;
      } catch (err) {
        result.errors++;
        result.errorDetails.push(
          `offer=${offer.id}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } catch (err) {
    result.status = 'error';
    result.errors++;
    result.errorDetails.push(err instanceof Error ? err.message : String(err));
  }

  result.finishedAt = new Date();
  const duration =
    (result.finishedAt.getTime() - result.startedAt.getTime()) / 1000;

  console.log(
    `[${result.job}] status=${result.status} ` +
    `duration=${duration}s ` +
    `offers_found=${result.offersFound} ` +
    `offers_updated=${result.offersUpdated} ` +
    `offers_deactivated=${result.offersDeactivated} ` +
    `errors=${result.errors}`,
  );

  return result;
}
