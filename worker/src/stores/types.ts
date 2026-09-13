/**
 * Store Connector — tipos base
 *
 * ScrapedOffer: dados extraídos de uma página de produto por um connector.
 * StoreConnector: contrato que cada connector de loja deve implementar.
 *
 * Regras de campo (DECISÃO-03 / Opção A):
 *   - ean  → apenas EAN-13 / GTIN — usado pelo product-agent para matching
 *   - sku  → SKU interno da loja — preservado, NÃO usado no matching da Fase 3
 *   - mpn  → Manufacturer Part Number — preservado, NÃO usado no matching da Fase 3
 *   Nunca colapsar sku em ean. Cada campo preserva sua origem e significado.
 *
 * Regras de preço (DECISÃO-05):
 *   - price e shippingPrice devem permanecer separados.
 *   - shippingPrice é obrigatório: usar 0 quando não disponível, nunca undefined.
 *   O deal-agent soma price + shipping_price — os dois campos precisam ser explícitos.
 *
 * Regra de availability (DECISÃO-04):
 *   - Deve ser normalizado para o enum exato do banco antes de retornar.
 *   - Nunca retornar string livre (ex: "InStock", "OutOfStock").
 */

export interface ScrapedOffer {
  /** Preço do produto (sem frete). Obrigatório. */
  price: number;

  /** Preço original antes de desconto, se disponível. */
  originalPrice?: number;

  /**
   * Preço de frete. Obrigatório — usar 0 se não disponível na página.
   * Nunca deixar undefined: o deal-agent lê price + shipping_price do banco.
   */
  shippingPrice: number;

  /**
   * Disponibilidade normalizada para o enum do banco (availability_status).
   * O connector é responsável pela conversão antes de retornar.
   */
  availability?: 'in_stock' | 'out_of_stock' | 'pre_order' | 'unknown';

  /**
   * Título do produto extraído da página.
   * Necessário para o product-agent (ProductInput.title).
   */
  title?: string;

  /**
   * EAN-13 ou GTIN — identificador global de produto.
   * Usado pelo product-agent para matching automático de alta confiança.
   * Mapeia para identifier_type = 'ean' ou 'gtin' em product_identifiers.
   */
  ean?: string;

  /**
   * SKU interno da loja.
   * Preservado para uso futuro — NÃO usado no matching da Fase 3.
   * Mapeia para identifier_type = 'sku' em product_identifiers (milestone posterior).
   * NUNCA tratar como equivalente a ean.
   */
  sku?: string;

  /**
   * Manufacturer Part Number.
   * Preservado para uso futuro — NÃO usado no matching da Fase 3.
   * Mapeia para identifier_type = 'mpn' em product_identifiers (milestone posterior).
   */
  mpn?: string;
}

/**
 * Contrato que todo store connector deve implementar.
 *
 * domain: domínio da loja sem protocolo (ex: 'belezanaweb.com.br')
 *   — usado pelo registry para resolver o connector correto.
 *
 * scrapeOffer: dado uma URL de produto, retorna os dados extraídos.
 *   Retorna null se a página não for reconhecida, o parsing falhar
 *   ou qualquer erro ocorrer internamente.
 *   Nunca deve lançar — o job não trata exceções do connector.
 */
export interface StoreConnector {
  readonly domain: string;
  scrapeOffer(url: string): Promise<ScrapedOffer | null>;
}
