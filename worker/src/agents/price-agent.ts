/**
 * AG-002 — Price Agent
 *
 * Responsabilidade:
 *   - coletar preços de lojas
 *   - normalizar valores
 *   - atualizar ofertas
 *   - registrar histórico
 *   - controlar last_checked_at
 */

import { db } from '../database/client.ts';

export interface PriceData {
  offerId: string;
  price: number;
  originalPrice?: number;
  shippingPrice?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
}

export async function updateOfferPrice(data: PriceData): Promise<void> {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Atualiza o preço atual da oferta
    await client.query(
      `UPDATE offers
          SET price            = $1,
              original_price   = $2,
              shipping_price   = COALESCE($3, 0),
              availability     = COALESCE($4, availability),
              last_checked_at  = NOW(),
              updated_at       = NOW()
        WHERE id = $5`,
      [
        data.price,
        data.originalPrice ?? null,
        data.shippingPrice ?? 0,
        data.availability ?? null,
        data.offerId,
      ],
    );

    // Registra no histórico
    await client.query(
      `INSERT INTO price_history
              (offer_id, price, original_price, shipping_price)
       VALUES ($1,       $2,    $3,             $4)`,
      [
        data.offerId,
        data.price,
        data.originalPrice ?? null,
        data.shippingPrice ?? 0,
      ],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
