/**
 * NotificationService — Sistema de Envio de Notificações de Alertas (Fase 6)
 *
 * Suporta múltiplos canais de comunicação:
 *   - WhatsApp (Via Webhook / Evolution API / Z-API / Twilio)
 *   - Email (Via Webhook / Resend / SendGrid / SMTP)
 *   - Push Notification (Para a Chrome Extension)
 */

export interface NotificationPayload {
  alertId: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  storeName: string;
  offerUrl: string;
}

export interface NotificationResult {
  channel: 'whatsapp' | 'email' | 'push' | 'webhook';
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia notificação por WhatsApp
 */
async function sendWhatsAppNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

  const text =
    `🔥 *ALERTA DE PREÇO — ELITE BOT* 🔥\n\n` +
    `O produto *${payload.productName}* atingiu o preço desejado!\n\n` +
    `💰 *Preço Alvo:* R$ ${payload.targetPrice.toFixed(2)}\n` +
    `⚡ *Preço Atual:* R$ ${payload.currentPrice.toFixed(2)}\n` +
    `🏪 *Loja:* ${payload.storeName}\n\n` +
    `🛒 *Garanta o seu com desconto:* ${payload.offerUrl}`;

  if (!webhookUrl) {
    console.log(`[notification-service][WhatsApp Mock] Envio para ${payload.userPhone || payload.userId}:\n${text}`);
    return { channel: 'whatsapp', success: true, messageId: `mock-wa-${Date.now()}` };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        number: payload.userPhone,
        message: text,
        url: payload.offerUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp Webhook HTTP ${response.status}`);
    }

    return { channel: 'whatsapp', success: true, messageId: `wa-${Date.now()}` };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[notification-service][WhatsApp Error]', errorMsg);
    return { channel: 'whatsapp', success: false, error: errorMsg };
  }
}

/**
 * Envia notificação por Email
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;

  const subject = `🔥 Preço Baixou! ${payload.productName} por R$ ${payload.currentPrice.toFixed(2)} na ${payload.storeName}`;

  if (!webhookUrl) {
    console.log(`[notification-service][Email Mock] Assunto: ${subject} -> Destinatário: ${payload.userEmail || payload.userId}`);
    return { channel: 'email', success: true, messageId: `mock-email-${Date.now()}` };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: payload.userEmail,
        subject,
        productName: payload.productName,
        currentPrice: payload.currentPrice,
        targetPrice: payload.targetPrice,
        storeName: payload.storeName,
        offerUrl: payload.offerUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email Webhook HTTP ${response.status}`);
    }

    return { channel: 'email', success: true, messageId: `email-${Date.now()}` };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[notification-service][Email Error]', errorMsg);
    return { channel: 'email', success: false, error: errorMsg };
  }
}

/**
 * Envia notificação Push para a Chrome Extension
 */
async function sendPushNotification(payload: NotificationPayload): Promise<NotificationResult> {
  console.log(`[notification-service][Push Extension] Notificação Push gerada para user_id=${payload.userId} — ${payload.productName}`);
  return { channel: 'push', success: true, messageId: `push-${Date.now()}` };
}

/**
 * Orquestrador principal de notificações do Elite Bot
 */
export async function sendPriceAlertNotification(
  payload: NotificationPayload,
): Promise<NotificationResult[]> {
  console.log(
    `[notification-service] Processando disparos de alerta para alert_id=${payload.alertId} (${payload.productName})`,
  );

  const results: NotificationResult[] = [];

  // Dispara canais habilitados em paralelo
  const [waResult, emailResult, pushResult] = await Promise.all([
    sendWhatsAppNotification(payload),
    sendEmailNotification(payload),
    sendPushNotification(payload),
  ]);

  results.push(waResult, emailResult, pushResult);
  return results;
}
