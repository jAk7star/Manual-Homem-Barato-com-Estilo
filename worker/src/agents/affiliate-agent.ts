/**
 * AG-006 — Affiliate Agent
 *
 * Responsabilidade:
 *   - registrar clique de afiliado
 *   - identificar origem e campanha
 *   - retornar URL afiliada da oferta
 */

import { db } from '../database/client.ts';

export interface AffiliateClickInput {
  offerId: string;
  userId?: string;
  source: 'extension' | 'website';
  campaign?: string;
}

export interface AffiliateRedirect {
  affiliateUrl: string;
  clickId: string;
}

export async function registerClick(
  input: AffiliateClickInput,
): Promise<AffiliateRedirect | null> {
  // Busca a affiliate_url da oferta
  const offerResult = await db.query<{
    affiliate_url: string | null;
    product_url: string;
  }>(
    `SELECT affiliate_url, product_url
       FROM offers
      WHERE id = $1 AND is_active = TRUE`,
    [input.offerId],
  );

  if (offerResult.rows.length === 0) return null;

  const offer = offerResult.rows[0];
  const redirectUrl = offer.affiliate_url ?? offer.product_url;

  // Registra o clique
  const clickResult = await db.query<{ id: string }>(
    `INSERT INTO affiliate_clicks (offer_id, user_id, source, campaign)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      input.offerId,
      input.userId ?? null,
      input.source,
      input.campaign ?? null,
    ],
  );

  return {
    affiliateUrl: redirectUrl,
    clickId: clickResult.rows[0].id,
  };
}
