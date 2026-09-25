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
  last_triggered_at?: string;
}

interface BestPrice {
  offer_id: string;
  total_price: string;
  store_name: string;
  affiliate_url: string | null;
  product_url: string;
  average_price?: string;
  lowest_price?: string;
}

const REDIRECT_BASE_URL = process.env.REDIRECT_BASE_URL || 'http://localhost:3002/r';

export async function processAlerts(): Promise<{
  checked: number;
  triggered: number;
}> {
  // 1. Busca alertas ativos que NÃO foram disparados nas últimas 12 horas (Cooldown anti-spam)
  const alertsResult = await db.query<ActiveAlert>(
    `SELECT a.id, a.user_id, a.product_id, a.target_price, a.currency, a.last_triggered_at,
            p.name AS product_name
       FROM alerts a
       JOIN products p ON p.id = a.product_id
      WHERE a.is_active = TRUE
        AND (a.last_triggered_at IS NULL OR a.last_triggered_at < NOW() - INTERVAL '12 hours')`,
  );

  const alerts = alertsResult.rows;
  let triggered = 0;

  for (const alert of alerts) {
    // 2. Busca melhor preço atual e histórico resumido do produto
    const bestResult = await db.query<BestPrice>(
      `SELECT o.id AS offer_id, o.product_url, b.total_price, b.store_name, o.affiliate_url,
              s.average_price, s.lowest_price
         FROM best_product_offers b
         JOIN offers o ON o.product_id = b.product_id AND o.is_active = TRUE
    LEFT JOIN product_deal_summary s ON s.product_id = b.product_id
        WHERE b.product_id = $1
        ORDER BY b.total_price ASC
        LIMIT 1`,
      [alert.product_id],
    );

    if (bestResult.rows.length === 0) continue;

    const best = bestResult.rows[0];
    const bestPrice = parseFloat(best.total_price);
    const targetPrice = parseFloat(alert.target_price);
    const minHistoricalPrice = best.lowest_price ? parseFloat(best.lowest_price) : null;
    const avgHistoricalPrice = best.average_price ? parseFloat(best.average_price) : null;

    // Regra 1: Preço atual atingiu ou ficou abaixo da meta definida pelo usuário
    const targetReached = bestPrice <= targetPrice;

    // Regra 2: Alerta Pretensioso — Preço atual atingiu a Menor Mínima Histórica do mercado
    const isHistoricalLow = minHistoricalPrice !== null && bestPrice <= minHistoricalPrice;

    // Regra 3: Alerta Pretensioso — Preço atual caiu mais de 15% abaixo da média histórica do produto
    const isBigDrop = avgHistoricalPrice !== null && bestPrice <= avgHistoricalPrice * 0.85;

    if (targetReached || isHistoricalLow || isBigDrop) {
      // Constrói URL de redirecionamento com tracking de afiliado
      const redirectUrl = `${REDIRECT_BASE_URL}?offer_id=${best.offer_id}&source=alert_notification&user_id=${alert.user_id}`;

      let triggerReason = 'Alerta de Preço Alvo';
      if (isHistoricalLow) triggerReason = '🔥 Mínima Histórica do Mercado (All-Time-Low)';
      else if (isBigDrop) triggerReason = '⚡ Queda Pretensiosa >15% abaixo da Média';

      console.log(
        `[alert-agent] TRIGGERED (${triggerReason}) alert=${alert.id} ` +
        `product="${alert.product_name}" ` +
        `best=R$ ${bestPrice.toFixed(2)} target=R$ ${targetPrice.toFixed(2)} ` +
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

      // Atualiza data do último disparo no banco para ativar o Cooldown
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



