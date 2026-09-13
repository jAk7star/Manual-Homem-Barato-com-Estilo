/**
 * AG-003 — Matching Agent
 *
 * Responsabilidade: determinar se uma oferta pertence ao produto correto.
 *
 * Output:
 *   { product_id, offer_id, match_type, confidence, verified }
 */

import { db } from '../database/client.ts';

export interface MatchResult {
  productId: string;
  offerId: string;
  matchType: 'ean' | 'gtin' | 'sku' | 'exact' | 'semantic' | 'manual';
  confidence: number;
  verified: boolean;
}

export async function saveProductMatch(match: MatchResult): Promise<void> {
  await db.query(
    `INSERT INTO product_matches
            (product_id, offer_id, match_type, confidence, verified)
     VALUES ($1,         $2,       $3,         $4,         $5)
     ON CONFLICT (product_id, offer_id)
     DO UPDATE SET
         match_type = EXCLUDED.match_type,
         confidence = EXCLUDED.confidence,
         verified   = EXCLUDED.verified`,
    [
      match.productId,
      match.offerId,
      match.matchType,
      match.confidence,
      match.verified,
    ],
  );
}

export async function getUnmatchedOffers(): Promise<
  Array<{ id: string; product_id: string; title: string | null }>
> {
  const result = await db.query<{
    id: string;
    product_id: string;
    title: string | null;
  }>(
    `SELECT o.id, o.product_id, o.title
       FROM offers o
      WHERE NOT EXISTS (
          SELECT 1 FROM product_matches pm WHERE pm.offer_id = o.id
      )
        AND o.is_active = TRUE`,
  );

  return result.rows;
}
