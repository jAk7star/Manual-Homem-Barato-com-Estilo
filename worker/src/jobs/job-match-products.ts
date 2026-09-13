/**
 * JOB-002 — Match Products
 *
 * Para cada oferta sem match, tenta associar ao produto correto.
 *
 * Fluxo:
 *   new offers → Product Agent → Matching Agent → Product Match
 */

import { identifyProduct } from '../agents/product-agent.ts';
import {
  getUnmatchedOffers,
  saveProductMatch,
} from '../agents/matching-agent.ts';
import { db } from '../database/client.ts';

interface JobResult {
  job: string;
  startedAt: Date;
  finishedAt?: Date;
  status: 'success' | 'error';
  offersChecked: number;
  matchesCreated: number;
  unmatched: number;
  errors: number;
}

export async function jobMatchProducts(): Promise<JobResult> {
  const result: JobResult = {
    job: 'match-products',
    startedAt: new Date(),
    status: 'success',
    offersChecked: 0,
    matchesCreated: 0,
    unmatched: 0,
    errors: 0,
  };

  try {
    const offers = await getUnmatchedOffers();
    result.offersChecked = offers.length;

    for (const offer of offers) {
      try {
        // Busca dados do produto para tentar identificação
        const productData = await db.query<{
          name: string;
          brand_name: string | null;
        }>(
          `SELECT p.name, b.name AS brand_name
             FROM products p
             LEFT JOIN brands b ON b.id = p.brand_id
            WHERE p.id = $1`,
          [offer.product_id],
        );

        if (productData.rows.length === 0) {
          result.unmatched++;
          continue;
        }

        const pd = productData.rows[0];
        const match = await identifyProduct({
          title: offer.title ?? pd.name,
          brand: pd.brand_name ?? undefined,
          url: '',
        });

        if (match) {
          await saveProductMatch({
            productId: match.productId,
            offerId: offer.id,
            matchType: match.matchType,
            confidence: match.confidence,
            verified: match.confidence >= 0.99,
          });
          result.matchesCreated++;
        } else {
          result.unmatched++;
        }
      } catch (err) {
        result.errors++;
        console.error(`[match-products] offer=${offer.id}`, err);
      }
    }
  } catch (err) {
    result.status = 'error';
    console.error('[match-products]', err);
  }

  result.finishedAt = new Date();
  const duration =
    (result.finishedAt.getTime() - result.startedAt.getTime()) / 1000;

  console.log(
    `[${result.job}] status=${result.status} ` +
    `duration=${duration}s ` +
    `checked=${result.offersChecked} ` +
    `matched=${result.matchesCreated} ` +
    `unmatched=${result.unmatched} ` +
    `errors=${result.errors}`,
  );

  return result;
}
