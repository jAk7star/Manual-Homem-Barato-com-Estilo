/**
 * AG-004 — Deal Agent
 *
 * Responsabilidade: calcular a qualidade da oferta.
 *
 * Regras de classificação (hipótese inicial):
 *   < 70% da média histórica → excellent
 *   70–85%                   → good
 *   85–105%                  → normal
 *   > 105%                   → expensive
 */

import { db } from '../database/client.ts';

type DealClassification = 'excellent' | 'good' | 'normal' | 'expensive';

function classify(
  currentPrice: number,
  averagePrice: number,
): { score: number; classification: DealClassification } {
  const ratio = currentPrice / averagePrice;

  if (ratio < 0.7) {
    // Escala 85–100 proporcional dentro da faixa excelente
    const score = Math.round(85 + (0.7 - ratio) / 0.7 * 15);
    return { score: Math.min(score, 100), classification: 'excellent' };
  }

  if (ratio < 0.85) {
    const score = Math.round(70 + (0.85 - ratio) / 0.15 * 15);
    return { score, classification: 'good' };
  }

  if (ratio <= 1.05) {
    const score = Math.round(50 + (1.05 - ratio) / 0.2 * 20);
    return { score, classification: 'normal' };
  }

  const score = Math.max(0, Math.round(50 - (ratio - 1.05) / 0.05 * 5));
  return { score, classification: 'expensive' };
}

export async function calculateDealScore(offerId: string): Promise<void> {
  // Busca preço atual da oferta
  const offerResult = await db.query<{
    price: string;
    shipping_price: string;
    product_id: string;
  }>(
    `SELECT price, shipping_price, product_id
       FROM offers
      WHERE id = $1 AND is_active = TRUE`,
    [offerId],
  );

  if (offerResult.rows.length === 0) return;

  const offer = offerResult.rows[0];
  const currentTotal =
    parseFloat(offer.price) + parseFloat(offer.shipping_price);

  // Calcula média histórica do produto (todas as ofertas ativas)
  const historyResult = await db.query<{ avg_total: string }>(
    `SELECT AVG(ph.price + ph.shipping_price) AS avg_total
       FROM price_history ph
       JOIN offers o ON o.id = ph.offer_id
      WHERE o.product_id = $1`,
    [offer.product_id],
  );

  // Se não há histórico, usa o preço atual como referência
  const averagePrice =
    historyResult.rows[0]?.avg_total != null
      ? parseFloat(historyResult.rows[0].avg_total)
      : currentTotal;

  if (averagePrice === 0) return;

  const lowestResult = await db.query<{ lowest: string }>(
    `SELECT MIN(ph.price + ph.shipping_price) AS lowest
       FROM price_history ph
       JOIN offers o ON o.id = ph.offer_id
      WHERE o.product_id = $1`,
    [offer.product_id],
  );
  const lowestPrice = lowestResult.rows[0]?.lowest != null
    ? parseFloat(lowestResult.rows[0].lowest)
    : null;

  const { score, classification } = classify(currentTotal, averagePrice);
  const discountPct =
    ((averagePrice - currentTotal) / averagePrice) * 100;

  await db.query(
    `INSERT INTO deal_scores
            (offer_id, score, classification, current_price,
             average_price, lowest_price, discount_percentage)
     VALUES ($1,       $2,    $3,             $4,
             $5,            $6,           $7)`,
    [
      offerId,
      score,
      classification,
      currentTotal,
      averagePrice,
      lowestPrice,
      parseFloat(discountPct.toFixed(2)),
    ],
  );
}
