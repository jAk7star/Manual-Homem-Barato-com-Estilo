/**
 * AG-005 — Alert Agent
 *
 * Responsabilidade: processar alertas ativos.
 *
 * Fluxo:
 *   buscar alertas → buscar melhor preço → comparar target_price
 *   → disparar notificação multi-canal (WhatsApp, Email, Push)
 *   → atualizar last_triggered_at
 */

import { db } from '../database/client.ts';
import { sendPriceAlertNotification } from '../services/notification-service.ts';

interface ActiveAlert {
  id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  target_price: string;
  currency: string;
  user_email?: string;
  user_phone?: string;
}

interface BestPrice {
  offer_id: string;
  total_price: string;
  store_name: string;
  affiliate_url: string | null;
  product_url: string;
}

const REDIRECT_BASE_URL = process.env.REDIRECT_BASE_URL || 'http://localhost:3002/r';

export async function processAlerts(): Promise<{
  checked: number;
  triggered: number;
}> {
  // Busca alertas ativos com nome do produto e dados do usuário
  const alertsResult = await db.query<ActiveAlert>(
    `SELECT a.id, a.user_id, a.product_id, a.target_price, a.currency,
            p.name AS product_name
       FROM alerts a
       JOIN products p ON p.id = a.product_id
  LEFT JOIN users u ON u.id = a.user_id
      WHERE a.is_active = TRUE`,
  );


  const alerts = alertsResult.rows;
  let triggered = 0;

  for (const alert of alerts) {
    const bestResult = await db.query<BestPrice>(
      `SELECT o.id AS offer_id, o.product_url, b.total_price, b.store_name, o.affiliate_url
         FROM best_product_offers b
         JOIN offers o ON o.product_id = b.product_id AND o.is_active = TRUE
        WHERE b.product_id = $1
        ORDER BY b.total_price ASC
        LIMIT 1`,
      [alert.product_id],
    );

    if (bestResult.rows.length === 0) continue;

    const best = bestResult.rows[0];
    const bestPrice = parseFloat(best.total_price);
    const targetPrice = parseFloat(alert.target_price);

    if (bestPrice <= targetPrice) {
      // Constrói URL de redirecionamento com tracking de afiliado
      const redirectUrl = `${REDIRECT_BASE_URL}?offer_id=${best.offer_id}&source=alert_notification&user_id=${alert.user_id}`;

      console.log(
        `[alert-agent] TRIGGERED alert=${alert.id} ` +
        `product="${alert.product_name}" ` +
        `best=R$${bestPrice} target=R$${targetPrice} ` +
        `store=${best.store_name}`,
      );

      // Dispara envio de notificações multi-canal (WhatsApp, Email, Push)
      await sendPriceAlertNotification({
        alertId: alert.id,
        userId: alert.user_id,
        userEmail: alert.user_email,
        userPhone: alert.user_phone,
        productName: alert.product_name,
        targetPrice,
        currentPrice: bestPrice,
        storeName: best.store_name,
        offerUrl: redirectUrl,
      });

      // Atualiza data do último disparo no banco
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
