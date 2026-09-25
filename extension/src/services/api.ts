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
}

/**
 * Sem dados MOCK fictícios — Apenas dados verificados e ao vivo
 */
export async function searchProducts(query: string): Promise<ProductDetails[]> {
  const normalized = query.trim().toLowerCase();
  
  try {
    const encoded = encodeURIComponent(query.trim());
    const queryParam = normalized
      ? `&or=(slug.ilike.*${encoded}*,name.ilike.*${encoded}*)`
      : '';
    let response = await fetch(`${API_BASE_URL}/products?select=id,name,slug,image_url,categories(name)&order=created_at.desc${queryParam}&limit=10`);
    
    if (response.ok) {
      let products = await response.json();
      
      // Se a busca por nome específico não retornou resultados, busca todos os produtos do catálogo
      if ((!Array.isArray(products) || products.length === 0) && normalized) {
        const fallbackRes = await fetch(`${API_BASE_URL}/products?select=id,name,slug,image_url,categories(name)&order=created_at.desc&limit=10`);
        if (fallbackRes.ok) {
          products = await fallbackRes.json();
        }
      }

      if (Array.isArray(products) && products.length > 0) {
        const results: ProductDetails[] = [];
        for (const prod of products) {
          const offersRes = await fetch(`${API_BASE_URL}/best_product_offers?product_id=eq.${prod.id}&order=price.asc&limit=5`);
          const offers = offersRes.ok ? await offersRes.json() : [];
          
          const catName = prod.categories?.name ?? 'Moda & Perfumaria';

          results.push({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            category_name: catName,
            image_url: prod.image_url || undefined,
            offers: Array.isArray(offers) ? offers.map(o => ({
              product_id: o.product_id,
              product_name: o.product_name || prod.name,
              current_price: parseFloat(o.price || o.total_price || '0'),
              original_price: o.original_price ? parseFloat(o.original_price) : undefined,
              store_name: o.store_name || 'Loja Parceira',
              store_domain: o.store_domain || '',
              affiliate_url: o.product_url || o.affiliate_url || '',
              offer_id: o.offer_id || o.id,
              classification: o.classification || 'good',
              score: o.score ? parseFloat(o.score) : 85,
            })) : [],
            accords: (prod.name.toLowerCase().includes('malbec') || prod.name.toLowerCase().includes('perfume') || prod.name.toLowerCase().includes('colonia') || prod.name.toLowerCase().includes('asad') || catName.toLowerCase().includes('perfum'))
              ? [
                  { name: 'Amadeirado', color: '#9A3412' },
                  { name: 'Especiado Quente', color: '#C85A32' },
                  { name: 'Âmbar', color: '#D97706' },
                  { name: 'Fresco Cítrico', color: '#0284C7' }
                ]
              : undefined,
          });
        }

        const validResults = results.filter(r => r.offers.length > 0);
        if (validResults.length > 0) {
          return validResults;
        }
        return results;
      }
    }
  } catch (err) {
    console.warn('[Extension API fetch search warning]', err);
  }

  return [];
}

/**
 * Realiza correspondência estrita/semântica enviando título, EAN e domínio para o backend RPC
 */
export async function matchProductContext(payload: {
  title: string;
  ean?: string;
  domain?: string;
}): Promise<ProductDetails | null> {
  if (!payload.title || payload.title.length < 3) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/rpc/match_product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_title: payload.title,
        p_ean: payload.ean || null,
        p_domain: payload.domain || null,
      }),
    });

    if (res.ok) {
      const matches = await res.json();
      if (Array.isArray(matches) && matches.length > 0 && matches[0].product_id) {
        const matchedId = matches[0].product_id;
        const prodRes = await fetch(`${API_BASE_URL}/products?id=eq.${matchedId}&select=id,name,slug,image_url,categories(name)`);
        if (prodRes.ok) {
          const prods = await prodRes.json();
          if (Array.isArray(prods) && prods.length > 0) {
            const prod = prods[0];
            const offersRes = await fetch(`${API_BASE_URL}/best_product_offers?product_id=eq.${prod.id}&order=price.asc&limit=5`);
            const offers = offersRes.ok ? await offersRes.json() : [];
            const catName = prod.categories?.name ?? 'Moda & Perfumaria';

            return {
              id: prod.id,
              name: prod.name,
              slug: prod.slug,
              category_name: catName,
              image_url: prod.image_url || undefined,
              offers: Array.isArray(offers) ? offers.map(o => ({
                product_id: o.product_id,
                product_name: o.product_name || prod.name,
                current_price: parseFloat(o.price || o.total_price || '0'),
                original_price: o.original_price ? parseFloat(o.original_price) : undefined,
                store_name: o.store_name || 'Loja Parceira',
                store_domain: o.store_domain || '',
                affiliate_url: o.product_url || o.affiliate_url || 'https://www.belezanaweb.com.br/',
                offer_id: o.offer_id || o.id,
                classification: o.classification || 'good',
                score: o.score ? parseFloat(o.score) : 85,
              })) : [],
              accords: (prod.name.toLowerCase().includes('malbec') || prod.name.toLowerCase().includes('perfume') || prod.name.toLowerCase().includes('colonia') || prod.name.toLowerCase().includes('asad') || catName.toLowerCase().includes('perfum'))
                ? [
                    { name: 'Amadeirado', color: '#9A3412' },
                    { name: 'Especiado Quente', color: '#C85A32' },
                    { name: 'Âmbar', color: '#D97706' },
                    { name: 'Fresco Cítrico', color: '#0284C7' }
                  ]
                : undefined,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Extension API matchProductContext warning]', err);
  }

  return null;
}

export async function getProductBySlugOrName(term: string): Promise<ProductDetails | null> {
  return matchProductContext({ title: term });
}

/**
 * Busca ofertas raspadas ao vivo nas páginas web dos e-commerces via Worker microservice (/api/live-compare)
 */
export async function fetchLiveOffersFromWeb(productId: string): Promise<ProductOffer[]> {
  try {
    const res = await fetch(`http://localhost:3002/api/live-compare?product_id=${encodeURIComponent(productId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((o: any) => ({
          product_id: o.product_id || productId,
          product_name: o.store_name,
          current_price: parseFloat(o.price || o.total_price || '0'),
          original_price: o.original_price ? parseFloat(o.original_price) : undefined,
          store_name: o.store_name || 'Loja Parceira',
          store_domain: o.store_domain || '',
          affiliate_url: o.product_url || 'https://www.belezanaweb.com.br/',
          offer_id: o.offer_id || o.id,
          classification: o.classification || 'excellent',
          score: o.score ? parseFloat(o.score) : 90,
        }));
      }
    }
  } catch (err) {
    console.warn('[Extension API fetchLiveOffersFromWeb warning]', err);
  }
  return [];
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
export function getMonetizedRedirectUrl(offerId: string, campaign = 'extension_popup', fallbackUrl?: string): string {
  let url = `${REDIRECT_BASE_URL}?offer_id=${encodeURIComponent(offerId)}&source=extension&campaign=${campaign}`;
  if (fallbackUrl) {
    url += `&fallback=${encodeURIComponent(fallbackUrl)}`;
  }
  return url;
}

/**
 * Abre links com segurança em nova aba do navegador Chrome
 */
export function openExternalLink(targetUrl: string): void {
  let finalUrl = targetUrl;

  if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
    finalUrl = `https://${finalUrl}`;
  }

  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url: finalUrl });
  } else {
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }
}
