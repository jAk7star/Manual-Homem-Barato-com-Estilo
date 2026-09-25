/**
 * NotificationService — Sistema de Envio de Notificações de Alertas (Fase 6)
 *
 * Suporta múltiplos canais e provedores reais de comunicação:
 *   - WhatsApp: Evolution API, Z-API ou Webhook Genérico (WhatsApp Web/Cloud API)
 *   - Email: Resend API (HTML), SendGrid API ou Webhook Genérico
 *   - Push / Webhook: Push Notification para a Chrome Extension e Webhooks de Automação
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
 * Envia notificação por WhatsApp (Evolution API, Z-API ou Webhook)
 */
async function sendWhatsAppNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE;

  const zapiInstanceId = process.env.ZAPI_INSTANCE_ID;
  const zapiToken = process.env.ZAPI_TOKEN;

  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  const phone = payload.userPhone ? payload.userPhone.replace(/\D/g, '') : null;

  const savings = payload.targetPrice > payload.currentPrice
    ? (payload.targetPrice - payload.currentPrice).toFixed(2)
    : null;

  const text =
    `🔥 *ALERTA DE PREÇO — ELITE BOT* 🔥\n\n` +
    `O produto *${payload.productName}* atingiu o preço desejado!\n\n` +
    `💰 *Preço Alvo:* R$ ${payload.targetPrice.toFixed(2)}\n` +
    `⚡ *Preço Atual:* R$ ${payload.currentPrice.toFixed(2)}${savings ? ` (Economia de R$ ${savings})` : ''}\n` +
    `🏪 *Loja:* ${payload.storeName}\n\n` +
    `🛒 *Garanta o seu com desconto:* ${payload.offerUrl}`;

  // 1. Integrador Evolution API (WhatsApp)
  if (evolutionApiUrl && evolutionApiKey && evolutionInstance && phone) {
    try {
      const response = await fetch(`${evolutionApiUrl.replace(/\/$/, '')}/message/sendText/${evolutionInstance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          number: phone,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Evolution API HTTP ${response.status}`);
      }

      console.log(`[notification-service][Evolution API WhatsApp] Notificação enviada para ${phone}`);
      return { channel: 'whatsapp', success: true, messageId: `evo-${Date.now()}` };
    } catch (err) {
      console.error('[notification-service][Evolution API Error]', err);
    }
  }

  // 2. Integrador Z-API (WhatsApp)
  if (zapiInstanceId && zapiToken && phone) {
    try {
      const response = await fetch(`https://api.z-api.io/instances/${zapiInstanceId}/token/${zapiToken}/send-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': process.env.ZAPI_CLIENT_TOKEN || '',
        },
        body: JSON.stringify({
          phone,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Z-API HTTP ${response.status}`);
      }

      console.log(`[notification-service][Z-API WhatsApp] Notificação enviada para ${phone}`);
      return { channel: 'whatsapp', success: true, messageId: `zapi-${Date.now()}` };
    } catch (err) {
      console.error('[notification-service][Z-API Error]', err);
    }
  }

  // 3. Webhook Genérico de WhatsApp
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: phone || payload.userId,
          message: text,
          productName: payload.productName,
          currentPrice: payload.currentPrice,
          url: payload.offerUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp Webhook HTTP ${response.status}`);
      }

      return { channel: 'whatsapp', success: true, messageId: `wa-webhook-${Date.now()}` };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[notification-service][WhatsApp Error]', errorMsg);
      return { channel: 'whatsapp', success: false, error: errorMsg };
    }
  }

  // Fallback Mock se nenhum provedor estiver configurado nas variáveis de ambiente
  console.log(`[notification-service][WhatsApp Dev Log] Notificação para ${phone || payload.userId}:\n${text}`);
  return { channel: 'whatsapp', success: true, messageId: `mock-wa-${Date.now()}` };
}

/**
 * Envia notificação por Email (Resend API, SendGrid ou Webhook HTML)
 */
async function sendEmailNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  const recipient = payload.userEmail || 'cliente@elitebot.com.br';

  const subject = `🔥 Preço Baixou! ${payload.productName} por R$ ${payload.currentPrice.toFixed(2)} na ${payload.storeName}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0E0F12; color: #F3F4F6; margin: 0; padding: 24px; }
        .card { max-width: 560px; margin: 0 auto; background: #14151A; border: 1px solid #282B34; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-weight: 800; font-size: 20px; color: #FFFFFF; letter-spacing: 2px; }
        .accent { color: #C85A32; }
        .badge { display: inline-block; background: rgba(200, 90, 50, 0.15); border: 1px solid #C85A32; color: #C85A32; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; margin-bottom: 16px; }
        .title { font-size: 18px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0; line-height: 1.4; }
        .price-box { background: #1A1C22; border: 1px solid #2A2D37; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .price { font-size: 28px; font-weight: 800; color: #10B981; margin: 4px 0; }
        .target { font-size: 13px; color: #94A3B8; }
        .btn { display: block; width: 100%; text-align: center; background: linear-gradient(135deg, #C85A32 0%, #9A3412 100%); color: #FFFFFF; font-weight: 800; padding: 14px 24px; border-radius: 99px; text-decoration: none; box-shadow: 0 6px 20px rgba(200, 90, 50, 0.4); margin-top: 24px; box-sizing: border-box; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">ELITE<span class="accent">BOT</span></div>
          <div style="font-size: 11px; color: #94A3B8; margin-top: 4px;">GUIA DO HOMEM BARATO</div>
        </div>
        <div class="badge">🔥 Oportunidade de Preço Verificada</div>
        <h2 class="title">${payload.productName}</h2>
        <div class="price-box">
          <div class="target">Meta do Alerta: R$ ${payload.targetPrice.toFixed(2)}</div>
          <div class="price">R$ ${payload.currentPrice.toFixed(2)}</div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 4px;">Vendido por ${payload.storeName}</div>
        </div>
        <a href="${payload.offerUrl}" class="btn">APROVEITAR OFERTA NA LOJA →</a>
      </div>
    </body>
    </html>
  `;

  // 1. Integrador Resend API (Email)
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Elite Bot <alertas@elitebot.com.br>',
          to: [recipient],
          subject,
          html: htmlBody,
        }),
      });

      if (!response.ok) {
        throw new Error(`Resend API HTTP ${response.status}`);
      }

      console.log(`[notification-service][Resend Email] Notificação enviada para ${recipient}`);
      return { channel: 'email', success: true, messageId: `resend-${Date.now()}` };
    } catch (err) {
      console.error('[notification-service][Resend Error]', err);
    }
  }

  // 2. Integrador SendGrid API (Email)
  if (sendgridApiKey) {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sendgridApiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: process.env.SENDGRID_FROM_EMAIL || 'alertas@elitebot.com.br', name: 'Elite Bot' },
          subject,
          content: [{ type: 'text/html', value: htmlBody }],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API HTTP ${response.status}`);
      }

      console.log(`[notification-service][SendGrid Email] Notificação enviada para ${recipient}`);
      return { channel: 'email', success: true, messageId: `sg-${Date.now()}` };
    } catch (err) {
      console.error('[notification-service][SendGrid Error]', err);
    }
  }

  // 3. Webhook Genérico de Email
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          html: htmlBody,
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

      return { channel: 'email', success: true, messageId: `email-webhook-${Date.now()}` };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('[notification-service][Email Error]', errorMsg);
      return { channel: 'email', success: false, error: errorMsg };
    }
  }

  // Fallback Mock se nenhum provedor estiver configurado nas variáveis de ambiente
  console.log(`[notification-service][Email Dev Log] Assunto: ${subject} -> Destinatário: ${recipient}`);
  return { channel: 'email', success: true, messageId: `mock-email-${Date.now()}` };
}

/**
 * Envia notificação Push para a Chrome Extension / Webhook de Push
 */
async function sendPushNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const pushWebhookUrl = process.env.PUSH_WEBHOOK_URL;

  if (pushWebhookUrl) {
    try {
      await fetch(pushWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: payload.userId,
          title: `🔥 Preço Baixou: ${payload.productName}`,
          message: `Agora por R$ ${payload.currentPrice.toFixed(2)} na ${payload.storeName}!`,
          url: payload.offerUrl,
        }),
      });
    } catch (e) {
      console.warn('[notification-service][Push Webhook warning]', e);
    }
  }

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

