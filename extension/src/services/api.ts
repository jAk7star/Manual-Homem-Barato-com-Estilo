/**
 * API Service — Comunicação HTTP com o Backend e PostgREST do Elite Bot
 */

const API_BASE_URL = 'http://localhost:3001';
const REDIRECT_BASE_URL = 'http://localhost:3002/r';

export interface ProductOffer {
  product_id: string;
  product_name: string;
  category_name?: string;
  current_price: number;
  original_price?: number;
  store_name: string;
  store_domain: string;
  affiliate_url: string;
  offer_id: string;
  classification?: 'excellent' | 'good' | 'normal' | 'expensive';
  score?: number;
}

export interface ProductDetails {
  id: string;
  name: string;
  slug: string;
  category_name?: string;
  gender?: string;
  image_url?: string;
  offers: ProductOffer[];
  accords?: { name: string; color: string }[];
  available_sizes?: number[];
}

/**
 * Busca ofertas de um produto por slug ou termo de busca
 */
export async function getProductBySlugOrName(term: string): Promise<ProductDetails | null> {
  try {
    const encoded = encodeURIComponent(term);
    const response = await fetch(`${API_BASE_URL}/products?select=id,name,slug,categories(name)&or=(slug.ilike.*${encoded}*,name.ilike.*${encoded}*)&limit=1`);
    
    if (!response.ok) return null;
    
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) return null;
    
    const prod = products[0];
    
    // Busca ofertas associadas
    const offersRes = await fetch(`${API_BASE_URL}/best_product_offers?product_id=eq.${prod.id}&order=current_price.asc`);
    const offers = offersRes.ok ? await offersRes.json() : [];

    return {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      category_name: prod.categories?.name ?? 'Moda & Perfumaria',
      offers: Array.isArray(offers) ? offers.map(o => ({
        product_id: o.product_id,
        product_name: o.product_name || prod.name,
        current_price: parseFloat(o.current_price || o.total_price || '0'),
        original_price: o.original_price ? parseFloat(o.original_price) : undefined,
        store_name: o.store_name || 'Loja Parceira',
        store_domain: o.store_domain || '',
        affiliate_url: o.affiliate_url || o.product_url,
        offer_id: o.id || o.offer_id,
        classification: o.classification || 'good',
        score: o.score ? parseFloat(o.score) : 85,
      })) : [],
      // Mock de acordes olfativos para perfumaria
      accords: prod.name.toLowerCase().includes('malbec') || prod.name.toLowerCase().includes('perfume') || prod.name.toLowerCase().includes('colonia')
        ? [
            { name: 'Amadeirado', color: '#9A3412' },
            { name: 'Especiado Quente', color: '#C85A32' },
            { name: 'Âmbar', color: '#D97706' },
            { name: 'Fresco Cítrico', color: '#0284C7' }
          ]
        : undefined,
      // Mock de tamanhos para calçados/roupas
      available_sizes: [38, 39, 40, 41, 42, 43, 44],
    };
  } catch (err) {
    console.warn('[Extension API Error]', err);
    return null;
  }
}

/**
 * Cria um alerta de preço no PostgreSQL
 */
export async function createPriceAlert(productId: string, targetPrice: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        product_id: productId,
        target_price: targetPrice,
        is_active: true,
      }),
    });
    return response.ok || response.status === 201;
  } catch (err) {
    console.error('[Create Alert Error]', err);
    return false;
  }
}

/**
 * Gera URL de compra com redirecionamento de afiliados (302 Tracking)
 */
export function getMonetizedRedirectUrl(offerId: string, campaign = 'extension_popup'): string {
  return `${REDIRECT_BASE_URL}?offer_id=${offerId}&source=extension&campaign=${campaign}`;
}
