/**
 * AG-001 — Product Agent
 *
 * Responsabilidade: identificar e normalizar produtos.
 *
 * Prioridade de matching:
 *   EAN/GTIN → SKU/MPN → Brand + Name + Size → Semantic Match
 */

import { db } from '../database/client.ts';

export interface ProductInput {
  title: string;
  brand?: string;
  price?: number;
  ean?: string;
  url: string;
}

export interface ProductMatch {
  productId: string;
  matchType: 'ean' | 'gtin' | 'sku' | 'exact' | 'semantic';
  confidence: number;
}

export async function identifyProduct(
  input: ProductInput,
): Promise<ProductMatch | null> {
  // 1. Tentar por EAN/GTIN
  if (input.ean) {
    const result = await db.query<{ product_id: string }>(
      `SELECT product_id
         FROM product_identifiers
        WHERE identifier_value = $1
          AND identifier_type IN ('ean', 'gtin')
        LIMIT 1`,
      [input.ean],
    );

    if (result.rows.length > 0) {
      return {
        productId: result.rows[0].product_id,
        matchType: 'ean',
        confidence: 1.0,
      };
    }
  }

  // 2. Tentar por Brand + Name (exact)
  if (input.brand && input.title) {
    const result = await db.query<{ id: string }>(
      `SELECT p.id
         FROM products p
         JOIN brands b ON b.id = p.brand_id
        WHERE LOWER(b.name) = LOWER($1)
          AND LOWER(p.name) = LOWER($2)
        LIMIT 1`,
      [input.brand, input.title],
    );

    if (result.rows.length > 0) {
      return {
        productId: result.rows[0].id,
        matchType: 'exact',
        confidence: 0.95,
      };
    }
  }

  // TODO: implementar semantic match (AG-003)
  return null;
}
