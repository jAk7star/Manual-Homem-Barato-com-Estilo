/**
 * AG-005 — Alert Agent
 *
 * Responsabilidade: processar alertas ativos.
 *
 * Fluxo:
 *   buscar alertas → buscar melhor preço → comparar target_price
 *   → disparar notificação → atualizar last_triggered_at
 */

import { db } from '../database/client.ts';

interface ActiveAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: string;
  currency: string;
}

interface BestPrice {
  total_price: string;
  store_name: string;
  affiliate_url: string | null;
}

export async function processAlerts(): Promise<{
  checked: number;
  triggered: number;
}> {
  const alertsResult = await db.query<ActiveAlert>(
    `SELECT id, user_id, product_id, target_price, currency
       FROM alerts
      WHERE is_active = TRUE`,
  );

  const alerts = alertsResult.rows;
  let triggered = 0;

  for (const alert of alerts) {
    const bestResult = await db.query<BestPrice>(
      `SELECT total_price, store_name, affiliate_url
         FROM best_product_offers
        WHERE product_id = $1
        ORDER BY total_price ASC
        LIMIT 1`,
      [alert.product_id],
    );

    if (bestResult.rows.length === 0) continue;

    const best = bestResult.rows[0];
    const bestPrice = parseFloat(best.total_price);
    const targetPrice = parseFloat(alert.target_price);

    if (bestPrice <= targetPrice) {
      // TODO: integrar com sistema de notificações (email, push, etc.)
      console.log(
        `[alert-agent] TRIGGERED alert=${alert.id} ` +
        `product=${alert.product_id} ` +
        `best=${bestPrice} target=${targetPrice} ` +
        `store=${best.store_name}`,
      );

      await db.query(
        `UPDATE alerts
            SET last_triggered_at = NOW(),
                updated_at        = NOW()
          WHERE id = $1`,
        [alert.id],
      );

      triggered++;
    }
  }

  return { checked: alerts.length, triggered };
}
