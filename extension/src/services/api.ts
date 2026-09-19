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
 * Catálogo com URLs Reais e Funcionais de E-commerce Brasileiros
 */
const MOCK_CATALOG: ProductDetails[] = [
  {
    id: 'e5d79b52-1111-4444-8888-000000000001',
    name: 'Malbec Desodorante Colônia 100ml',
    slug: 'malbec-desodorante-colonia-100ml',
    category_name: 'Perfumaria',
    offers: [
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 149.90,
        original_price: 189.90,
        store_name: 'O Boticário',
        store_domain: 'boticario.com.br',
        affiliate_url: 'https://www.boticario.com.br/malbec-desodorante-colonia-100ml/',
        offer_id: '7b4cb760-boticario-01',
        classification: 'excellent',
        score: 96,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 169.90,
        original_price: 189.90,
        store_name: 'Beleza na Web',
        store_domain: 'belezanaweb.com.br',
        affiliate_url: 'https://www.belezanaweb.com.br/o-boticario-malbec-desodorante-colonia-100ml/',
        offer_id: '7b4cb760-beleza-01',
        classification: 'good',
        score: 88,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 179.90,
        original_price: 189.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://lista.mercadolivre.com.br/malbec-colonia-100ml',
        offer_id: '7b4cb760-ml-01',
        classification: 'normal',
        score: 80,
      }
    ],
    accords: [
      { name: 'Amadeirado', color: '#9A3412' },
      { name: 'Especiado Quente', color: '#C85A32' },
      { name: 'Âmbar', color: '#D97706' },
      { name: 'Fresco Cítrico', color: '#0284C7' }
    ]
  },
  {
    id: 'e5d79b52-2222-4444-8888-000000000002',
    name: 'Kaiak Vital Desodorante Colônia Masculino 100ml',
    slug: 'kaiak-vital-colonia-100ml',
    category_name: 'Perfumaria',
    offers: [
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Vital Desodorante Colônia Masculino 100ml',
        current_price: 119.90,
        original_price: 154.90,
        store_name: 'Natura',
        store_domain: 'natura.com.br',
        affiliate_url: 'https://www.natura.com.br/p/desodorante-colonia-kaiak-masculino-100-ml/131238',
        offer_id: '7b4cb760-natura-01',
        classification: 'excellent',
        score: 94,
      },
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Vital Desodorante Colônia Masculino 100ml',
        current_price: 134.90,
        original_price: 154.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://lista.mercadolivre.com.br/kaiak-vital',
        offer_id: '7b4cb760-ml-02',
        classification: 'good',
        score: 85,
      }
    ],
    accords: [
      { name: 'Marinho Aquático', color: '#0284C7' },
      { name: 'Cítrico Energizante', color: '#10B981' },
      { name: 'Amadeirado Leve', color: '#B45309' }
    ]
  },
  {
    id: 'e5d79b52-3333-4444-8888-000000000003',
    name: 'Sapato Social Masculino Ferracini Couro Noir',
    slug: 'sapato-social-ferracini-couro-noir',
    category_name: 'Calçados',
    offers: [
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Masculino Ferracini Couro Noir',
        current_price: 289.90,
        original_price: 359.90,
        store_name: 'Ferracini',
        store_domain: 'ferracini.com.br',
        affiliate_url: 'https://www.ferracini.com.br/',
        offer_id: '7b4cb760-ferracini-01',
        classification: 'excellent',
        score: 95,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Masculino Ferracini Couro Noir',
        current_price: 319.90,
        original_price: 359.90,
        store_name: 'Dafiti',
        store_domain: 'dafiti.com.br',
        affiliate_url: 'https://www.dafiti.com.br/catalog/?q=sapato+social+ferracini',
        offer_id: '7b4cb760-dafiti-01',
        classification: 'good',
        score: 87,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Masculino Ferracini Couro Noir',
        current_price: 339.90,
        original_price: 359.90,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/busca?q=sapato+social+ferracini',
        offer_id: '7b4cb760-netshoes-01',
        classification: 'normal',
        score: 82,
      }
    ],
    available_sizes: [38, 39, 40, 41, 42, 43, 44]
  },
  {
    id: 'e5d79b52-4444-4444-8888-000000000004',
    name: 'Tênis Esportivo Olympikus Corre 3 Masculino',
    slug: 'tenis-olympikus-corre-3',
    category_name: 'Calçados',
    offers: [
      {
        product_id: 'e5d79b52-4444-4444-8888-000000000004',
        product_name: 'Tênis Esportivo Olympikus Corre 3 Masculino',
        current_price: 399.90,
        original_price: 499.90,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/busca?q=olympikus+corre+3',
        offer_id: '7b4cb760-netshoes-02',
        classification: 'excellent',
        score: 98,
      },
      {
        product_id: 'e5d79b52-4444-4444-8888-000000000004',
        product_name: 'Tênis Esportivo Olympikus Corre 3 Masculino',
        current_price: 449.90,
        original_price: 499.90,
        store_name: 'Dafiti',
        store_domain: 'dafiti.com.br',
        affiliate_url: 'https://www.dafiti.com.br/catalog/?q=olympikus+corre+3',
        offer_id: '7b4cb760-dafiti-02',
        classification: 'good',
        score: 89,
      }
    ],
    available_sizes: [39, 40, 41, 42, 43]
  },
  {
    id: 'e5d79b52-5555-4444-8888-000000000005',
    name: 'Camisa Polo Masculina Piquet Slim Fit Renner',
    slug: 'camisa-polo-masculina-renner',
    category_name: 'Moda',
    offers: [
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camisa Polo Masculina Piquet Slim Fit Renner',
        current_price: 79.90,
        original_price: 119.90,
        store_name: 'Lojas Renner',
        store_domain: 'lojasrenner.com.br',
        affiliate_url: 'https://www.lojasrenner.com.br/busca?Ntt=polo+masculina',
        offer_id: '7b4cb760-renner-01',
        classification: 'excellent',
        score: 93,
      },
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camisa Polo Masculina Piquet Slim Fit Renner',
        current_price: 99.90,
        original_price: 119.90,
        store_name: 'C&A',
        store_domain: 'cea.com.br',
        affiliate_url: 'https://www.cea.com.br/busca?Ntt=polo+masculina',
        offer_id: '7b4cb760-cea-01',
        classification: 'good',
        score: 84,
      }
    ],
    available_sizes: [38, 40, 42, 44]
  }
];

/**
 * Mapa de Fallback de URLs de Afiliado por Offer ID
 */
const LIVE_OFFER_URLS: Record<string, string> = {
  '7b4cb760-boticario-01': 'https://www.boticario.com.br/malbec-desodorante-colonia-100ml/',
  '7b4cb760-beleza-01': 'https://www.belezanaweb.com.br/o-boticario-malbec-desodorante-colonia-100ml/',
  '7b4cb760-ml-01': 'https://lista.mercadolivre.com.br/malbec-colonia-100ml',
  '7b4cb760-natura-01': 'https://www.natura.com.br/p/desodorante-colonia-kaiak-masculino-100-ml/131238',
  '7b4cb760-ml-02': 'https://lista.mercadolivre.com.br/kaiak-vital',
  '7b4cb760-ferracini-01': 'https://www.ferracini.com.br/',
  '7b4cb760-dafiti-01': 'https://www.dafiti.com.br/catalog/?q=sapato+social+ferracini',
  '7b4cb760-netshoes-01': 'https://www.netshoes.com.br/busca?q=sapato+social+ferracini',
  '7b4cb760-netshoes-02': 'https://www.netshoes.com.br/busca?q=olympikus+corre+3',
  '7b4cb760-dafiti-02': 'https://www.dafiti.com.br/catalog/?q=olympikus+corre+3',
  '7b4cb760-renner-01': 'https://www.lojasrenner.com.br/busca?Ntt=polo+masculina',
  '7b4cb760-cea-01': 'https://www.cea.com.br/busca?Ntt=polo+masculina',
};

/**
 * Busca múltiplos produtos que correspondem ao termo digitado
 */
export async function searchProducts(query: string): Promise<ProductDetails[]> {
  const normalized = query.trim().toLowerCase();
  
  try {
    const encoded = encodeURIComponent(query.trim());
    const response = await fetch(`${API_BASE_URL}/products?select=id,name,slug,categories(name)&or=(slug.ilike.*${encoded}*,name.ilike.*${encoded}*)&limit=10`);
    
    if (response.ok) {
      const products = await response.json();
      if (Array.isArray(products) && products.length > 0) {
        const results: ProductDetails[] = [];
        for (const prod of products) {
          const offersRes = await fetch(`${API_BASE_URL}/best_product_offers?product_id=eq.${prod.id}&order=current_price.asc`);
          const offers = offersRes.ok ? await offersRes.json() : [];
          results.push({
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
              affiliate_url: o.affiliate_url || o.product_url || 'https://www.boticario.com.br/',
              offer_id: o.id || o.offer_id,
              classification: o.classification || 'good',
              score: o.score ? parseFloat(o.score) : 85,
            })) : [],
            accords: prod.name.toLowerCase().includes('malbec') || prod.name.toLowerCase().includes('perfume') || prod.name.toLowerCase().includes('colonia')
              ? [
                  { name: 'Amadeirado', color: '#9A3412' },
                  { name: 'Especiado Quente', color: '#C85A32' },
                  { name: 'Âmbar', color: '#D97706' },
                  { name: 'Fresco Cítrico', color: '#0284C7' }
                ]
              : undefined,
            available_sizes: [38, 39, 40, 41, 42, 43, 44],
          });
        }
        return results;
      }
    }
  } catch (err) {
    console.warn('[Extension API fetch search warning]', err);
  }

  // Se PostgREST não encontrou ou falhou, filtra do Mock Catalog
  if (!normalized) return MOCK_CATALOG;

  const matches = MOCK_CATALOG.filter(p => 
    p.name.toLowerCase().includes(normalized) ||
    p.slug.toLowerCase().includes(normalized) ||
    p.category_name?.toLowerCase().includes(normalized) ||
    p.offers.some(o => o.store_name.toLowerCase().includes(normalized))
  );

  return matches.length > 0 ? matches : MOCK_CATALOG;
}

export async function getProductBySlugOrName(term: string): Promise<ProductDetails | null> {
  const results = await searchProducts(term);
  return results.length > 0 ? results[0] : null;
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
  // Se for uma offerId com URL real mapeada no dicionário, gera o link 302 direto
  if (LIVE_OFFER_URLS[offerId]) {
    return `${REDIRECT_BASE_URL}?offer_id=${encodeURIComponent(offerId)}&fallback=${encodeURIComponent(LIVE_OFFER_URLS[offerId])}`;
  }
  return `${REDIRECT_BASE_URL}?offer_id=${encodeURIComponent(offerId)}&source=extension&campaign=${campaign}`;
}

/**
 * Abre links com segurança em nova aba do navegador Chrome
 */
export function openExternalLink(targetUrl: string): void {
  // Se for uma oferta direta da loja, abre diretamente
  let finalUrl = targetUrl;
  if (targetUrl.includes('offer_id=')) {
    const match = targetUrl.match(/offer_id=([^&]+)/);
    const offerId = match ? decodeURIComponent(match[1]) : '';
    if (LIVE_OFFER_URLS[offerId]) {
      finalUrl = LIVE_OFFER_URLS[offerId];
    }
  }

  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
    chrome.tabs.create({ url: finalUrl });
  } else {
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }
}
