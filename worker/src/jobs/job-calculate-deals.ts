/**
 * JOB-003 — Calculate Deals
 *
 * Para cada oferta ativa, recalcula o deal score.
 *
 * Fluxo:
 *   offers + price_history → Deal Agent → deal_scores
 */

import { calculateDealScore } from '../agents/deal-agent.ts';
import { db } from '../database/client.ts';

interface JobResult {
  job: string;
  startedAt: Date;
  finishedAt?: Date;
  status: 'success' | 'error';
  offersProcessed: number;
  scoresCreated: number;
  errors: number;
}

export async function jobCalculateDeals(): Promise<JobResult> {
  const result: JobResult = {
    job: 'calculate-deals',
    startedAt: new Date(),
    status: 'success',
    offersProcessed: 0,
    scoresCreated: 0,
    errors: 0,
  };

  try {
    const offersResult = await db.query<{ id: string }>(
      `SELECT id FROM offers WHERE is_active = TRUE`,
    );

    result.offersProcessed = offersResult.rows.length;

    for (const offer of offersResult.rows) {
      try {
        await calculateDealScore(offer.id);
        result.scoresCreated++;
      } catch (err) {
        result.errors++;
        console.error(`[calculate-deals] offer=${offer.id}`, err);
      }
    }
  } catch (err) {
    result.status = 'error';
    console.error('[calculate-deals]', err);
  }

  result.finishedAt = new Date();
  const duration =
    (result.finishedAt.getTime() - result.startedAt.getTime()) / 1000;

  console.log(
    `[${result.job}] status=${result.status} ` +
    `duration=${duration}s ` +
    `offers_processed=${result.offersProcessed} ` +
    `scores_created=${result.scoresCreated} ` +
    `errors=${result.errors}`,
  );

  return result;
}
