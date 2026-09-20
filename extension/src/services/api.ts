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
 * Catálogo com URLs Reais e Funcionais de E-commerce Brasileiros
 */
const MOCK_CATALOG: ProductDetails[] = [
  {
    id: 'e5d79b52-0000-4444-8888-000000000000',
    name: 'Asad Lattafa Eau de Parfum 100ml',
    slug: 'asad-lattafa-eau-de-parfum-100ml',
    category_name: 'Perfumaria',
    image_url: 'https://m.media-amazon.com/images/I/61S-+u3h7vL._AC_SL1500_.jpg',
    offers: [
      {
        product_id: 'e5d79b52-0000-4444-8888-000000000000',
        product_name: 'Asad Lattafa Eau de Parfum 100ml',
        current_price: 179.90,
        original_price: 220.00,
        store_name: 'Amazon Brasil',
        store_domain: 'amazon.com.br',
        affiliate_url: 'https://www.amazon.com.br/dp/B0C399F72D',
        offer_id: '7b4cb760-amazon-asad',
        classification: 'excellent',
        score: 97,
      },
      {
        product_id: 'e5d79b52-0000-4444-8888-000000000000',
        product_name: 'Asad Lattafa Eau de Parfum 100ml',
        current_price: 189.90,
        original_price: 220.00,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://www.mercadolivre.com.br/perfume-lattafa-asad-edp-100ml-para-masculino/p/MLB24037568',
        offer_id: '7b4cb760-ml-asad',
        classification: 'good',
        score: 91,
      },
      {
        product_id: 'e5d79b52-0000-4444-8888-000000000000',
        product_name: 'Asad Lattafa Eau de Parfum 100ml',
        current_price: 199.90,
        original_price: 230.00,
        store_name: 'Beleza na Web',
        store_domain: 'belezanaweb.com.br',
        affiliate_url: 'https://www.belezanaweb.com.br/lattafa-asad-eau-de-parfum-perfume-masculino-100ml/',
        offer_id: '7b4cb760-bnw-asad',
        classification: 'good',
        score: 88,
      },
      {
        product_id: 'e5d79b52-0000-4444-8888-000000000000',
        product_name: 'Asad Lattafa Eau de Parfum 100ml',
        current_price: 204.90,
        original_price: 240.00,
        store_name: 'Dafiti',
        store_domain: 'dafiti.com.br',
        affiliate_url: 'https://www.dafiti.com.br/Perfume-Lattafa-Asad-Eau-De-Parfum-Masculino-100ml-9812401.html',
        offer_id: '7b4cb760-dafiti-asad',
        classification: 'normal',
        score: 83,
      },
      {
        product_id: 'e5d79b52-0000-4444-8888-000000000000',
        product_name: 'Asad Lattafa Eau de Parfum 100ml',
        current_price: 209.90,
        original_price: 250.00,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/perfume-lattafa-asad-edp-masculino-100ml-D24-9120-006',
        offer_id: '7b4cb760-netshoes-asad',
        classification: 'normal',
        score: 80,
      }
    ],
    accords: [
      { name: 'Especiado Quente', color: '#C85A32' },
      { name: 'Pimenta & Café', color: '#9A3412' },
      { name: 'Baunilha / Âmbar', color: '#D97706' },
      { name: 'Amadeirado Nobre', color: '#78350F' }
    ]
  },
  {
    id: 'e5d79b52-1111-4444-8888-000000000001',
    name: 'Malbec Desodorante Colônia 100ml',
    slug: 'malbec-desodorante-colonia-100ml',
    category_name: 'Perfumaria',
    offers: [
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 174.90,
        original_price: 209.90,
        store_name: 'Amazon Brasil',
        store_domain: 'amazon.com.br',
        affiliate_url: 'https://www.amazon.com.br/dp/B0777G5ZKZ',
        offer_id: '7b4cb760-amazon-malbec',
        classification: 'excellent',
        score: 97,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 179.90,
        original_price: 209.90,
        store_name: 'Beleza na Web',
        store_domain: 'belezanaweb.com.br',
        affiliate_url: 'https://www.belezanaweb.com.br/malbec-o-boticario-desodorante-colonia-perfume-masculino-100ml/',
        offer_id: '7b4cb760-beleza-01',
        classification: 'excellent',
        score: 94,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 184.90,
        original_price: 209.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://www.mercadolivre.com.br/malbec-desodorante-colnia-100ml-o-boticario/p/MLB15184920',
        offer_id: '7b4cb760-ml-01',
        classification: 'good',
        score: 89,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 189.90,
        original_price: 209.90,
        store_name: 'O Boticário',
        store_domain: 'boticario.com.br',
        affiliate_url: 'https://www.boticario.com.br/malbec-desodorante-colonia-100ml/',
        offer_id: '7b4cb760-boticario-01',
        classification: 'good',
        score: 86,
      },
      {
        product_id: 'e5d79b52-1111-4444-8888-000000000001',
        product_name: 'Malbec Desodorante Colônia 100ml',
        current_price: 194.90,
        original_price: 209.90,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/malbec-desodorante-colonia-100ml-o-boticario-D24-8812-002',
        offer_id: '7b4cb760-netshoes-malbec',
        classification: 'normal',
        score: 81,
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
    name: 'Kaiak Masculino Desodorante Colônia 100ml',
    slug: 'kaiak-masculino-desodorante-colonia-100ml',
    category_name: 'Perfumaria',
    offers: [
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Masculino Desodorante Colônia 100ml',
        current_price: 119.90,
        original_price: 179.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://www.mercadolivre.com.br/desodorante-colnia-kaiak-masculino-100ml-natura/p/MLB15185012',
        offer_id: '7b4cb760-ml-02',
        classification: 'excellent',
        score: 96,
      },
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Masculino Desodorante Colônia 100ml',
        current_price: 129.90,
        original_price: 179.90,
        store_name: 'Amazon Brasil',
        store_domain: 'amazon.com.br',
        affiliate_url: 'https://www.amazon.com.br/dp/B0797H8M9P',
        offer_id: '7b4cb760-amazon-kaiak',
        classification: 'excellent',
        score: 92,
      },
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Masculino Desodorante Colônia 100ml',
        current_price: 139.90,
        original_price: 179.90,
        store_name: 'Beleza na Web',
        store_domain: 'belezanaweb.com.br',
        affiliate_url: 'https://www.belezanaweb.com.br/natura-kaiak-desodorante-colonia-perfume-masculino-100ml/',
        offer_id: '7b4cb760-bnw-kaiak',
        classification: 'good',
        score: 87,
      },
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Masculino Desodorante Colônia 100ml',
        current_price: 149.90,
        original_price: 179.90,
        store_name: 'Natura',
        store_domain: 'natura.com.br',
        affiliate_url: 'https://www.natura.com.br/p/desodorante-colonia-kaiak-masculino-100-ml/2255',
        offer_id: '7b4cb760-natura-01',
        classification: 'good',
        score: 84,
      },
      {
        product_id: 'e5d79b52-2222-4444-8888-000000000002',
        product_name: 'Kaiak Masculino Desodorante Colônia 100ml',
        current_price: 154.90,
        original_price: 179.90,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/kaiak-masculino-desodorante-colonia-100ml-natura-D24-9012-004',
        offer_id: '7b4cb760-netshoes-kaiak',
        classification: 'normal',
        score: 80,
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
    name: 'Sapato Social Democrata Air Casion Masculino Couro',
    slug: 'sapato-social-democrata-air-casion-masculino-couro',
    category_name: 'Calçados',
    offers: [
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Democrata Air Casion Masculino Couro',
        current_price: 279.90,
        original_price: 349.90,
        store_name: 'Democrata',
        store_domain: 'democrata.com.br',
        affiliate_url: 'https://www.democrata.com.br/sapato-social-democrata-air-casion-couro-preto/p',
        offer_id: '7b4cb760-democrata-01',
        classification: 'excellent',
        score: 96,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Democrata Air Casion Masculino Couro',
        current_price: 289.90,
        original_price: 359.90,
        store_name: 'Ferracini',
        store_domain: 'ferracini.com.br',
        affiliate_url: 'https://www.ferracini.com.br/sapato-social-masculino-couro-preto/p',
        offer_id: '7b4cb760-ferracini-01',
        classification: 'excellent',
        score: 93,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Democrata Air Casion Masculino Couro',
        current_price: 299.90,
        original_price: 359.90,
        store_name: 'Dafiti',
        store_domain: 'dafiti.com.br',
        affiliate_url: 'https://www.dafiti.com.br/Sapato-Social-Democrata-Air-Casion-Couro-8948123.html',
        offer_id: '7b4cb760-dafiti-01',
        classification: 'good',
        score: 88,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Democrata Air Casion Masculino Couro',
        current_price: 319.90,
        original_price: 359.90,
        store_name: 'Netshoes',
        store_domain: 'netshoes.com.br',
        affiliate_url: 'https://www.netshoes.com.br/sapato-social-democrata-air-casion-couro-noir-D24-8192-006',
        offer_id: '7b4cb760-netshoes-01',
        classification: 'normal',
        score: 83,
      },
      {
        product_id: 'e5d79b52-3333-4444-8888-000000000003',
        product_name: 'Sapato Social Democrata Air Casion Masculino Couro',
        current_price: 339.90,
        original_price: 359.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://www.mercadolivre.com.br/sapato-social-democrata-air-casion-couro/p/MLB28194012',
        offer_id: '7b4cb760-ml-democrata',
        classification: 'normal',
        score: 79,
      }
    ]
  },
  {
    id: 'e5d79b52-5555-4444-8888-000000000005',
    name: 'Camiseta Masculina Básica Hering 100% Algodão',
    slug: 'camiseta-masculina-basica-hering-100-algodao',
    category_name: 'Moda',
    offers: [
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camiseta Masculina Básica Hering 100% Algodão',
        current_price: 39.90,
        original_price: 59.90,
        store_name: 'Lojas Renner',
        store_domain: 'lojasrenner.com.br',
        affiliate_url: 'https://www.lojasrenner.com.br/p/camiseta-masculina-basica-em-algodao/-/A-549102931-br',
        offer_id: '7b4cb760-renner-01',
        classification: 'excellent',
        score: 97,
      },
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camiseta Masculina Básica Hering 100% Algodão',
        current_price: 45.99,
        original_price: 69.90,
        store_name: 'C&A',
        store_domain: 'cea.com.br',
        affiliate_url: 'https://www.cea.com.br/camiseta-masculina-basica-gola-careca-manga-curta-algodao-preta-9971029-preto/p',
        offer_id: '7b4cb760-cea-01',
        classification: 'excellent',
        score: 92,
      },
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camiseta Masculina Básica Hering 100% Algodão',
        current_price: 47.90,
        original_price: 69.90,
        store_name: 'Mercado Livre',
        store_domain: 'mercadolivre.com.br',
        affiliate_url: 'https://www.mercadolivre.com.br/camiseta-masculina-basica-hering-100-algodao/p/MLB19203940',
        offer_id: '7b4cb760-ml-hering',
        classification: 'good',
        score: 88,
      },
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camiseta Masculina Básica Hering 100% Algodão',
        current_price: 49.99,
        original_price: 69.90,
        store_name: 'Hering',
        store_domain: 'hering.com.br',
        affiliate_url: 'https://www.hering.com.br/camiseta-masculina-manga-curta-em-malha-de-algodao-04711asn/p',
        offer_id: '7b4cb760-hering-01',
        classification: 'good',
        score: 85,
      },
      {
        product_id: 'e5d79b52-5555-4444-8888-000000000005',
        product_name: 'Camiseta Masculina Básica Hering 100% Algodão',
        current_price: 52.90,
        original_price: 69.90,
        store_name: 'Amazon Brasil',
        store_domain: 'amazon.com.br',
        affiliate_url: 'https://www.amazon.com.br/dp/B07X81920K',
        offer_id: '7b4cb760-amazon-hering',
        classification: 'normal',
        score: 81,
      }
    ]
  }
];

/**
 * Mapa de Fallback de URLs de Afiliado por Offer ID (URLs Diretas do Produto)
 */
const LIVE_OFFER_URLS: Record<string, string> = {
  '7b4cb760-amazon-asad': 'https://www.amazon.com.br/dp/B0C399F72D',
  '7b4cb760-ml-asad': 'https://www.mercadolivre.com.br/perfume-lattafa-asad-edp-100ml-para-masculino/p/MLB24037568',
  '7b4cb760-bnw-asad': 'https://www.belezanaweb.com.br/lattafa-asad-eau-de-parfum-perfume-masculino-100ml/',
  '7b4cb760-dafiti-asad': 'https://www.dafiti.com.br/Perfume-Lattafa-Asad-Eau-De-Parfum-Masculino-100ml-9812401.html',
  '7b4cb760-netshoes-asad': 'https://www.netshoes.com.br/perfume-lattafa-asad-edp-masculino-100ml-D24-9120-006',

  '7b4cb760-amazon-malbec': 'https://www.amazon.com.br/dp/B0777G5ZKZ',
  '7b4cb760-beleza-01': 'https://www.belezanaweb.com.br/malbec-o-boticario-desodorante-colonia-perfume-masculino-100ml/',
  '7b4cb760-ml-01': 'https://www.mercadolivre.com.br/malbec-desodorante-colnia-100ml-o-boticario/p/MLB15184920',
  '7b4cb760-boticario-01': 'https://www.boticario.com.br/malbec-desodorante-colonia-100ml/',
  '7b4cb760-netshoes-malbec': 'https://www.netshoes.com.br/malbec-desodorante-colonia-100ml-o-boticario-D24-8812-002',

  '7b4cb760-ml-02': 'https://www.mercadolivre.com.br/desodorante-colnia-kaiak-masculino-100ml-natura/p/MLB15185012',
  '7b4cb760-amazon-kaiak': 'https://www.amazon.com.br/dp/B0797H8M9P',
  '7b4cb760-bnw-kaiak': 'https://www.belezanaweb.com.br/natura-kaiak-desodorante-colonia-perfume-masculino-100ml/',
  '7b4cb760-natura-01': 'https://www.natura.com.br/p/desodorante-colonia-kaiak-masculino-100-ml/2255',
  '7b4cb760-netshoes-kaiak': 'https://www.netshoes.com.br/kaiak-masculino-desodorante-colonia-100ml-natura-D24-9012-004',

  '7b4cb760-renner-01': 'https://www.lojasrenner.com.br/p/camiseta-masculina-basica-em-algodao/-/A-549102931-br',
  '7b4cb760-cea-01': 'https://www.cea.com.br/camiseta-masculina-basica-gola-careca-manga-curta-algodao-preta-9971029-preto/p',
  '7b4cb760-ml-hering': 'https://www.mercadolivre.com.br/camiseta-masculina-basica-hering-100-algodao/p/MLB19203940',
  '7b4cb760-hering-01': 'https://www.hering.com.br/camiseta-masculina-manga-curta-em-malha-de-algodao-04711asn/p',
  '7b4cb760-amazon-hering': 'https://www.amazon.com.br/dp/B07X81920K',

  '7b4cb760-democrata-01': 'https://www.democrata.com.br/sapato-social-democrata-air-casion-couro-preto/p',
  '7b4cb760-ferracini-01': 'https://www.ferracini.com.br/sapato-social-masculino-couro-preto/p',
  '7b4cb760-dafiti-01': 'https://www.dafiti.com.br/Sapato-Social-Democrata-Air-Casion-Couro-8948123.html',
  '7b4cb760-netshoes-01': 'https://www.netshoes.com.br/sapato-social-democrata-air-casion-couro-noir-D24-8192-006',
  '7b4cb760-ml-democrata': 'https://www.mercadolivre.com.br/sapato-social-democrata-air-casion-couro/p/MLB28194012',
};

/**
 * Busca múltiplos produtos que correspondem ao termo digitado (Retorna até 5 ofertas por produto)
 */
export async function searchProducts(query: string): Promise<ProductDetails[]> {
  const normalized = query.trim().toLowerCase();
  
  try {
    const encoded = encodeURIComponent(query.trim());
    const queryParam = normalized
      ? `&or=(slug.ilike.*${encoded}*,name.ilike.*${encoded}*)`
      : '';
    const response = await fetch(`${API_BASE_URL}/products?select=id,name,slug,image_url,categories(name)&order=created_at.desc${queryParam}&limit=10`);
    
    if (response.ok) {
      const products = await response.json();
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
              affiliate_url: o.product_url || o.affiliate_url || 'https://www.boticario.com.br/',
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

        // Filtra itens com ofertas para que a busca exiba apenas resultados válidos
        const validResults = results.filter(r => r.offers.length > 0);
        if (validResults.length > 0) {
          return validResults;
        }
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
  return `${REDIRECT_BASE_URL}?offer_id=${encodeURIComponent(offerId)}&source=extension&campaign=${campaign}`;
}

/**
 * Abre links com segurança em nova aba do navegador Chrome
 */
export function openExternalLink(targetUrl: string): void {
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
