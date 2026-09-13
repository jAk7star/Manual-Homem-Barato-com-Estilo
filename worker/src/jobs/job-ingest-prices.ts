/**
 * JOB-001 — Ingest Prices
 *
 * Coleta preços de todas as lojas ativas e atualiza ofertas + histórico.
 *
 * Fluxo:
 *   Store registry → connector.scrapeOffer() → PriceData → updateOfferPrice()
 *   → offers (price atualizado) → price_history (novo registro)
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
  offersCreated: number;
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
    offersCreated: 0,
    errors: 0,
    errorDetails: [],
  };

  try {
    // Busca todas as ofertas ativas incluindo o domínio da loja (correção B3)
    const offersResult = await db.query<{
      id: string;
      product_url: string;
      store_domain: string;
    }>(
      `SELECT o.id, o.product_url, s.domain AS store_domain
         FROM offers o
         JOIN stores s ON s.id = o.store_id
        WHERE o.is_active = TRUE
          AND s.is_active = TRUE`,
    );

    result.offersFound = offersResult.rows.length;

    for (const offer of offersResult.rows) {
      try {
        // Resolve connector pelo domínio da loja
        const connector = getConnector(offer.store_domain);
        if (connector === null) {
          console.log(
            `[ingest-prices] skip offer=${offer.id} — no connector for domain=${offer.store_domain}`,
          );
          continue;
        }

        // Raspa o preço atual via connector
        const scraped = await connector.scrapeOffer(offer.product_url);
        if (scraped === null) {
          console.log(
            `[ingest-prices] skip offer=${offer.id} — connector returned null for ${offer.product_url}`,
          );
          continue;
        }

        // Mapeamento explícito ScrapedOffer → PriceData (campos separados, tipos preservados)
        await updateOfferPrice({
          offerId:       offer.id,
          price:         scraped.price,
          originalPrice: scraped.originalPrice,
          shippingPrice: scraped.shippingPrice,   // sempre número (0 quando indisponível)
          availability:  scraped.availability,    // union type preservado
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
    `errors=${result.errors}`,
  );

  return result;
}
