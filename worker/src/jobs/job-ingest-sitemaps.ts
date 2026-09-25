/**
 * JOB-005 — Ingest Sitemaps & Catalog Feed Crawler
 *
 * Objetivo:
 *   - Varrer sitemaps XML e páginas de catálogo das 12 lojas parceiras
 *   - Filtrar URLs de produtos masculinos (perfumaria, roupas, calçados, grooming)
 *   - Cadastrar novas ofertas na tabela `offers` e vincular a produtos canônicos
 *   - Permitir a ampliação contínua do catálogo sem dependência de navegação humana
 */

import { db } from '../database/client.ts';
import { normalizeUrl } from '../agents/price-agent.ts';

export interface SitemapJobResult {
  job: string;
  startedAt: Date;
  finishedAt?: Date;
  status: 'success' | 'error';
  storesScanned: number;
  urlsExtracted: number;
  newOffersCreated: number;
  errors: number;
  details: string[];
}

// Configuração de Sitemaps e Categorias Alvo por Loja
const STORE_SITEMAP_CONFIGS: Record<string, { sitemaps: string[]; keywords: string[] }> = {
  'belezanaweb.com.br': {
    sitemaps: [
      'https://www.belezanaweb.com.br/sitemap.xml',
      'https://www.belezanaweb.com.br/perfumes/masculino/',
    ],
    keywords: ['perfumes', 'masculino', 'barba', 'shampoo', 'cabelos'],
  },
  'oboticario.com.br': {
    sitemaps: [
      'https://www.boticario.com.br/sitemap.xml',
      'https://www.boticario.com.br/perfumaria/masculino/',
    ],
    keywords: ['malbec', 'zaad', 'quasar', 'arbo', 'men', 'masculino', 'desodorante-colonia'],
  },
  'natura.com.br': {
    sitemaps: [
      'https://www.natura.com.br/sitemap.xml',
      'https://www.natura.com.br/c/perfumaria/masculino',
    ],
    keywords: ['kaiak', 'homem', 'essencial', 'biografia', 'humor', 'sr-n', 'masculino'],
  },
  'lojasrenner.com.br': {
    sitemaps: [
      'https://www.lojasrenner.com.br/sitemap.xml',
      'https://www.lojasrenner.com.br/c/masculino',
    ],
    keywords: ['masculino', 'camiseta', 'polo', 'calca', 'jaqueta', 'bermuda', 'sapato', 'tenis'],
  },
  'hering.com.br': {
    sitemaps: [
      'https://www.hering.com.br/sitemap.xml',
      'https://www.hering.com.br/masculino',
    ],
    keywords: ['masculino', 'camiseta', 'polo', 'regata', 'casaco', 'jeans'],
  },
  'democrata.com.br': {
    sitemaps: ['https://www.democrata.com.br/sitemap.xml'],
    keywords: ['sapato', 'sapatatenis', 'bota', 'mocassim', 'couro', 'air', 'democrata'],
  },
  'ferracini.com.br': {
    sitemaps: ['https://www.ferracini.com.br/sitemap.xml'],
    keywords: ['sapato', 'sapatatenis', 'bota', 'couro', 'ferracini', '24h'],
  },
  'netshoes.com.br': {
    sitemaps: ['https://www.netshoes.com.br/sitemap.xml'],
    keywords: ['tenis', 'masculino', 'chuteira', 'camisa', 'nike', 'adidas', 'puma', 'olympikus'],
  },
  'dafiti.com.br': {
    sitemaps: ['https://www.dafiti.com.br/sitemap.xml'],
    keywords: ['masculino', 'calcados', 'roupas', 'polo', 'jaqueta', 'tenis'],
  },
  'cea.com.br': {
    sitemaps: ['https://www.cea.com.br/sitemap.xml'],
    keywords: ['masculino', 'camiseta', 'calca', 'polo', 'jeans'],
  },
  'mercadolivre.com.br': {
    sitemaps: ['https://www.mercadolivre.com.br/c/perfumes-e-cosmeticos'],
    keywords: ['malbec', 'kaiak', 'sauvage', 'bleu', 'perfume-masculino', 'desodorante-colonia'],
  },
  'amazon.com.br': {
    sitemaps: ['https://www.amazon.com.br/b?node=17353457031'],
    keywords: ['perfume-masculino', 'sauvage', 'lattafa', 'asad', 'club-de-nuit', 'nivea-men'],
  },
};

/**
 * Normaliza título do produto a partir da URL se necessário
 */
function createTitleFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(Boolean);
    const last = segments[segments.length - 1] || 'Produto Masculino';
    const clean = last
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|php|pdp|p)$/i, '')
      .replace(/\b[a-f0-9]{8,}\b/gi, '');
    return clean
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .trim();
  } catch {
    return 'Produto Masculino';
  }
}

/**
 * Cria Slug Amigável
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 140);
}

export async function jobIngestSitemaps(): Promise<SitemapJobResult> {
  const result: SitemapJobResult = {
    job: 'ingest-sitemaps',
    startedAt: new Date(),
    status: 'success',
    storesScanned: 0,
    urlsExtracted: 0,
    newOffersCreated: 0,
    errors: 0,
    details: [],
  };

  try {
    // 1. Busca Lojas Ativas
    const storesRes = await db.query<{ id: string; domain: string; name: string }>(
      `SELECT id, domain, name FROM stores WHERE is_active = TRUE`
    );

    // 2. Busca Categoria Padrão e Marca Padrão para Inserção de Novos Produtos
    const catRes = await db.query<{ id: string }>(`SELECT id FROM categories LIMIT 1`);
    const brandRes = await db.query<{ id: string }>(`SELECT id FROM brands LIMIT 1`);

    const defaultCatId = catRes.rows[0]?.id;
    const defaultBrandId = brandRes.rows[0]?.id;

    if (!defaultCatId || !defaultBrandId) {
      throw new Error('Categorias ou Marcas base não encontradas no PostgreSQL');
    }

    for (const store of storesRes.rows) {
      result.storesScanned++;
      const config = STORE_SITEMAP_CONFIGS[store.domain];

      if (!config) {
        console.log(`[ingest-sitemaps] Skip store=${store.name} (${store.domain}) — Sem sitemap configurado`);
        continue;
      }

      console.log(`[ingest-sitemaps] Scanning sitemaps for store=${store.name} (${store.domain})...`);

      for (const sitemapUrl of config.sitemaps) {
        try {
          const response = await fetch(sitemapUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            console.warn(`[ingest-sitemaps] HTTP ${response.status} fetching ${sitemapUrl}`);
            continue;
          }

          const content = await response.text();

          // Regex para extrair URLs dentro das tags <loc> ou hrefs
          const urlRegex = /<loc>(.*?)<\/loc>|href=["'](https?:\/\/[^"']+)["']/gi;
          let match: RegExpExecArray | null;
          const extractedUrls: string[] = [];

          while ((match = urlRegex.exec(content)) !== null) {
            const raw = match[1] || match[2];
            if (raw) extractedUrls.push(raw);
          }

          // Filtra URLs relevantes para o público masculino
          const filteredUrls = extractedUrls.filter((rawUrl) => {
            const lower = rawUrl.toLowerCase();
            return config.keywords.some((kw) => lower.includes(kw));
          });

          result.urlsExtracted += filteredUrls.length;
          console.log(`[ingest-sitemaps] Found ${filteredUrls.length} relevant candidate URLs in ${sitemapUrl}`);

          for (const rawUrl of filteredUrls.slice(0, 50)) { // Limita a 50 por sitemap para evitar sobrecarga
            const cleanUrl = normalizeUrl(rawUrl);

            // Verifica se a oferta já existe no PostgreSQL
            const existingOffer = await db.query<{ id: string }>(
              `SELECT id FROM offers WHERE store_id = $1 AND product_url = $2 LIMIT 1`,
              [store.id, cleanUrl]
            );

            if (existingOffer.rows.length > 0) {
              continue; // Já cadastrado
            }

            // Gera título e cria/vincular a um produto canônico
            const title = createTitleFromUrl(cleanUrl);
            const slug = slugify(title) || `prod-${Date.now()}`;

            let productId: string;
            const existingProd = await db.query<{ id: string }>(
              `SELECT id FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1`,
              [title]
            );

            if (existingProd.rows.length > 0) {
              productId = existingProd.rows[0].id;
            } else {
              const newProd = await db.query<{ id: string }>(
                `INSERT INTO products (category_id, brand_id, name, slug)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
                 RETURNING id`,
                [defaultCatId, defaultBrandId, title, slug]
              );
              productId = newProd.rows[0].id;
            }

            // Insere a nova oferta pendente de scraping
            await db.query(
              `INSERT INTO offers
                      (product_id, store_id, product_url, title, price, original_price, availability, is_active)
               VALUES ($1,         $2,       $3,          $4,    0,     0,              'unknown',    TRUE)`,
              [productId, store.id, cleanUrl, title]
            );

            result.newOffersCreated++;
            console.log(`[ingest-sitemaps] Candidate offer added: ${title} (${store.name})`);
          }
        } catch (err) {
          result.errors++;
          result.details.push(`Error scanning ${sitemapUrl}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  } catch (err) {
    result.status = 'error';
    result.details.push(`Fatal error in jobIngestSitemaps: ${err instanceof Error ? err.message : String(err)}`);
  }

  result.finishedAt = new Date();
  return result;
}
