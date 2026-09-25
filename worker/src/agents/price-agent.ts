/**
 * AG-002 — Price Agent
 *
 * Responsabilidade:
 *   - coletar preços de lojas
 *   - normalizar valores e URLs (remover UTMs/tracking)
 *   - atualizar ofertas (garantindo apenas links funcionais e ativos)
 *   - upsert estrito de ofertas verificadas por EAN
 *   - registrar histórico APENAS quando houver alteração de preço (Deduplicação / CDC)
 *   - controlar last_checked_at
 */

import { db } from '../database/client.ts';

export interface PriceData {
  offerId: string;
  price: number;
  originalPrice?: number;
  shippingPrice?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
  productUrl?: string;
  isActive?: boolean;
}

export interface VerifiedOfferData {
  productId: string;
  storeDomain: string;
  productUrl: string;
  title: string;
  price: number;
  originalPrice?: number;
  shippingPrice?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';
  ean?: string;
}

/**
 * Normaliza URLs removendo parâmetros de rastreamento (UTM, gclid, ref, etc.)
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'gclid',
      'fbclid',
      'ref',
      'affiliate_id',
      'tag',
    ];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    // Se a busca ficar vazia, remove o '?' no final
    const cleanSearch = parsed.searchParams.toString();
    return `${parsed.origin}${parsed.pathname}${cleanSearch ? `?${cleanSearch}` : ''}`;
  } catch {
    return rawUrl;
  }
}

export async function updateOfferPrice(data: PriceData): Promise<void> {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const cleanUrl = data.productUrl ? normalizeUrl(data.productUrl) : null;

    // 1. Consulta o estado atual da oferta para deduplicação CDC
    const currentRes = await client.query<{
      price: string;
      original_price: string | null;
      shipping_price: string;
      availability: string;
      is_active: boolean;
    }>(
      `SELECT price, original_price, shipping_price, availability, is_active
         FROM offers
        WHERE id = $1 LIMIT 1`,
      [data.offerId],
    );

    const current = currentRes.rows[0];
    const newPrice = Number(data.price);
    const oldPrice = current ? Number(current.price) : null;
    const oldOriginalPrice = current && current.original_price !== null ? Number(current.original_price) : null;
    const newOriginalPrice = data.originalPrice ?? null;
    const oldAvailability = current ? current.availability : null;
    const newAvailability = data.availability ?? oldAvailability;

    // Detecta se houve mudança significativa no valor ou estado
    const priceChanged = oldPrice === null || Math.abs(oldPrice - newPrice) > 0.001;
    const originalPriceChanged = oldOriginalPrice !== newOriginalPrice;
    const availabilityChanged = oldAvailability !== newAvailability;

    // 2. Atualiza a tabela 'offers'
    await client.query(
      `UPDATE offers
          SET price            = $1,
              original_price   = $2,
              shipping_price   = COALESCE($3, shipping_price, 0),
              availability     = COALESCE($4, availability),
              product_url      = COALESCE($5, product_url),
              is_active        = COALESCE($6, is_active),
              last_checked_at  = NOW(),
              updated_at       = NOW()
        WHERE id = $7`,
      [
        data.price,
        data.originalPrice ?? null,
        data.shippingPrice ?? 0,
        data.availability ?? null,
        cleanUrl,
        data.isActive ?? null,
        data.offerId,
      ],
    );

    // 3. Deduplicação CDC: Insere no histórico APENAS se houver alteração real de preço e for ativa
    if (data.price > 0 && data.isActive !== false && (priceChanged || originalPriceChanged || availabilityChanged)) {
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
      console.log(`[price-agent] CDC: Price/state update recorded in price_history for offer=${data.offerId} (R$ ${oldPrice} -> R$ ${newPrice})`);
    } else {
      console.log(`[price-agent] CDC: Price unchanged (R$ ${newPrice}). Skipped price_history insert for offer=${data.offerId}`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Upsert Estrito por EAN Verificado — Salva no PostgreSQL com Deduplicação CDC
 */
export async function upsertVerifiedOffer(data: VerifiedOfferData): Promise<string> {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const cleanUrl = normalizeUrl(data.productUrl);

    // 1. Busca store_id pelo domínio da loja
    const storeRes = await client.query<{ id: string }>(
      `SELECT id FROM stores WHERE domain = $1 AND is_active = TRUE LIMIT 1`,
      [data.storeDomain]
    );

    if (storeRes.rows.length === 0) {
      throw new Error(`Store not found or inactive for domain: ${data.storeDomain}`);
    }

    const storeId = storeRes.rows[0].id;

    // 2. Busca se a oferta para esta loja e produto já existe
    const existingRes = await client.query<{
      id: string;
      price: string;
      availability: string;
    }>(
      `SELECT id, price, availability FROM offers WHERE product_id = $1 AND store_id = $2 LIMIT 1`,
      [data.productId, storeId]
    );

    let offerId: string;
    let priceChanged = true;

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      offerId = existing.id;
      const oldPrice = Number(existing.price);
      priceChanged = Math.abs(oldPrice - Number(data.price)) > 0.001 || existing.availability !== (data.availability ?? 'in_stock');

      await client.query(
        `UPDATE offers
            SET product_url      = $1,
                title            = $2,
                price            = $3,
                original_price   = $4,
                shipping_price   = COALESCE($5, 0),
                availability     = COALESCE($6, 'in_stock'),
                is_active        = TRUE,
                last_checked_at  = NOW(),
                updated_at       = NOW()
          WHERE id = $7`,
        [
          cleanUrl,
          data.title,
          data.price,
          data.originalPrice ?? null,
          data.shippingPrice ?? 0,
          data.availability ?? 'in_stock',
          offerId,
        ]
      );
    } else {
      const insertRes = await client.query<{ id: string }>(
        `INSERT INTO offers
                (product_id, store_id, product_url, title, price, original_price, shipping_price, availability, is_active)
         VALUES ($1,         $2,       $3,          $4,    $5,    $6,             $7,             $8,           TRUE)
      RETURNING id`,
        [
          data.productId,
          storeId,
          cleanUrl,
          data.title,
          data.price,
          data.originalPrice ?? null,
          data.shippingPrice ?? 0,
          data.availability ?? 'in_stock',
        ]
      );
      offerId = insertRes.rows[0].id;
    }

    // 3. Registra no histórico de preços com CDC
    if (priceChanged && data.price > 0) {
      await client.query(
        `INSERT INTO price_history
                (offer_id, price, original_price, shipping_price)
         VALUES ($1,       $2,    $3,             $4)`,
        [
          offerId,
          data.price,
          data.originalPrice ?? null,
          data.shippingPrice ?? 0,
        ]
      );
      console.log(`[price-agent] CDC: Price recorded in price_history for offer=${offerId}`);
    } else {
      console.log(`[price-agent] CDC: Price unchanged. Skipped price_history insert for offer=${offerId}`);
    }

    await client.query('COMMIT');
    return offerId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

