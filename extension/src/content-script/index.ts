/**
 * Content Script — Extrator de produtos e preços em tempo real
 * Injetado automaticamente nas páginas de e-commerce parceiras.
 */

/**
 * Chrome Storage Inline Wrapper para Content Script
 */
function setDetectedProduct(data: { title: string; price?: number; url: string; domain: string; updatedAt: number }): void {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ activeProduct: data });
  } else {
    localStorage.setItem('activeProduct', JSON.stringify(data));
  }
}

function injectFloatingWidget(productTitle: string, currentPrice?: number) {
  if (document.getElementById('elitebot-shadow-root')) return;

  const container = document.createElement('div');
  container.id = 'elitebot-shadow-root';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '999999999';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

  const shadow = container.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .eb-pill {
      background: #0E0F12;
      border: 1px solid #C85A32;
      border-radius: 9999px;
      padding: 10px 18px;
      color: #FFFFFF;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(200, 90, 50, 0.35);
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      animation: ebSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }
    .eb-pill:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 14px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(200, 90, 50, 0.5);
    }
    .eb-icon {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #C85A32 0%, #9A3412 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 11px;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    .eb-text {
      display: flex;
      flex-direction: column;
    }
    .eb-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #C85A32;
      text-transform: uppercase;
    }
    .eb-sub {
      font-size: 12px;
      font-weight: 700;
      color: #F3F4F6;
      white-space: nowrap;
    }
    .eb-close {
      background: transparent;
      border: none;
      color: #71717A;
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      margin-left: 4px;
      transition: color 0.15s ease;
    }
    .eb-close:hover {
      color: #FFFFFF;
    }
    @keyframes ebSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const priceText = currentPrice ? ` R$ ${currentPrice.toFixed(2)}` : '';
  const widget = document.createElement('div');
  widget.className = 'eb-pill';
  widget.innerHTML = `
    <div class="eb-icon">EB</div>
    <div class="eb-text">
      <span class="eb-title">Elite Bot • Guia do Homem Barato</span>
      <span class="eb-sub">Menor Preço Verificado: ${priceText}</span>
    </div>
    <button class="eb-close" title="Fechar alerta">&times;</button>
  `;

  widget.querySelector('.eb-close')?.addEventListener('click', (e) => {
    e.stopPropagation();
    container.remove();
  });

  widget.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    }
  });

  shadow.appendChild(style);
  shadow.appendChild(widget);
  document.body.appendChild(container);
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
    const cleanSearch = parsed.searchParams.toString();
    return `${parsed.origin}${parsed.pathname}${cleanSearch ? `?${cleanSearch}` : ''}`;
  } catch {
    return rawUrl;
  }
}

/**
 * Extrator Isolado por Card de Produto
 * Evita a dessincronização de arrays iterando estritamente dentro de cada container (.product-card)
 */
export interface ScrapedCardProduct {
  url: string;
  price: number;
  title?: string;
}

export function extractProductsFromCardContainers(
  cardSelector: string = '.product-card, .ui-search-result__wrapper, [data-product-id], .product-item',
  linkSelector: string = 'a.product-link, a.ui-search-link, a[href*="/p/"], a[href*="/produto/"]',
  priceSelector: string = '.price-tag, .price, .sales-price, .andes-money-amount'
): ScrapedCardProduct[] {
  const cards = document.querySelectorAll(cardSelector);
  const scraped: ScrapedCardProduct[] = [];

  cards.forEach((card) => {
    const linkNode = card.querySelector<HTMLAnchorElement>(linkSelector);
    const priceNode = card.querySelector<HTMLElement>(priceSelector);

    if (linkNode && linkNode.href && priceNode && priceNode.innerText) {
      const rawPrice = priceNode.innerText.replace(/[^\d,.]/g, '').replace(',', '.');
      const parsedPrice = parseFloat(rawPrice);

      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        scraped.push({
          url: normalizeUrl(linkNode.href),
          price: parsedPrice,
          title: linkNode.title || linkNode.innerText.trim() || undefined,
        });
      }
    }
  });

  return scraped;
}

/**
 * Extrator Robusto com Protocolo Anti-Falso-Positivo para Preços em Páginas de Detalhe (PDP)
 * Desconsidera expressamente preços originais riscados (<s>, <del>, .line-through, .original-price)
 */
function extractPriceFromDOM(): number | undefined {
  // 1. Mercado Livre: Prioridade Máxima para o Preço Promocional Vigente (.ui-pdp-price__second-line)
  const mlSecondLine = document.querySelector('.ui-pdp-price__second-line');
  if (mlSecondLine) {
    const fraction = mlSecondLine.querySelector('.andes-money-amount__fraction')?.textContent?.replace(/\./g, '');
    const cents = mlSecondLine.querySelector('.andes-money-amount__cents')?.textContent || '00';
    if (fraction) {
      const parsed = parseFloat(`${fraction}.${cents}`);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  // 2. Mercado Livre Fallback: Elemento de preço que NÃO esteja dentro de 's' ou 'del' ou '.ui-pdp-price__original-value'
  const mlActivePricePart = document.querySelector(
    '.ui-pdp-price__part:not(s *):not(del *):not(.ui-pdp-price__original-value *):not(.ui-pdp-price__part--original *)'
  );
  if (mlActivePricePart) {
    const fraction = mlActivePricePart.querySelector('.andes-money-amount__fraction')?.textContent?.replace(/\./g, '');
    const cents = mlActivePricePart.querySelector('.andes-money-amount__cents')?.textContent || '00';
    if (fraction) {
      const parsed = parseFloat(`${fraction}.${cents}`);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  // 3. Meta OpenGraph price (somente se maior que zero)
  const ogPrice =
    document.querySelector('meta[property="og:price:amount"]')?.getAttribute('content') ||
    document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');
  if (ogPrice && !isNaN(parseFloat(ogPrice))) {
    const parsed = parseFloat(ogPrice);
    if (parsed > 0) return parsed;
  }

  // 4. Elementos com itemprop="price" ou value desconsiderando elementos riscados
  const itempropEl = document.querySelector('[itemprop="price"]:not(s *):not(del *):not(.line-through *)');
  if (itempropEl) {
    const content = itempropEl.getAttribute('content') || itempropEl.getAttribute('value') || itempropEl.textContent;
    if (content) {
      const raw = content.replace(/[^\d,.]/g, '').replace(',', '.');
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  // 5. Fallback genérico de classes CSS de preço focado exclusivamente na oferta ativa
  const priceEls = document.querySelectorAll(
    '.sales-price, .best-price, .spot-price, .price-tag-fraction, .product-price, .skuBestPrice'
  );
  for (const el of Array.from(priceEls)) {
    if (el.closest('s, del, .line-through, .original-price, .old-price, .ui-pdp-price__original-value')) {
      continue; // Ignora preços cortados antigos
    }
    if (el.textContent) {
      const raw = el.textContent.replace(/[^\d,.]/g, '').replace(',', '.');
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }

  return undefined;
}


function extractProductContext() {
  const url = normalizeUrl(window.location.href);
  const domain = window.location.hostname.replace(/^www\./, '');

  // Título da Página / Produto
  const titleMeta =
    document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title;

  // Extração precisa do preço do DOM
  const price = extractPriceFromDOM();

  const productContext = {
    title: titleMeta,
    price,
    url,
    domain,
    updatedAt: Date.now(),
  };

  // Salva no Chrome Storage
  setDetectedProduct(productContext);

  // Notifica o Background Service Worker
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DETECTED',
      payload: productContext,
    });
  }

  // Injeta a pílula visual na página de e-commerce se for página de produto
  if (titleMeta && titleMeta.length > 5 && !url.includes('/checkout') && !url.includes('/cart')) {
    injectFloatingWidget(titleMeta, price);
  }
}

function checkAndExtractProductContext() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get('verifierEnabled', (res) => {
      if (res.verifierEnabled === false) {
        document.getElementById('elitebot-shadow-root')?.remove();
        return;
      }
      extractProductContext();
    });
  } else {
    const raw = localStorage.getItem('verifierEnabled');
    if (raw !== null && JSON.parse(raw) === false) {
      document.getElementById('elitebot-shadow-root')?.remove();
      return;
    }
    extractProductContext();
  }
}

// Escuta mudanças de configuração em tempo real no Chrome Storage (Liga / Desliga)
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.verifierEnabled) {
      if (changes.verifierEnabled.newValue === false) {
        document.getElementById('elitebot-shadow-root')?.remove();
      } else {
        checkAndExtractProductContext();
      }
    }
  });
}

// Observador DOM para capturar preços dinâmicos injetados por React/NextJS (MutationObserver)
let mutationTimeout: number | undefined;
const observer = new MutationObserver(() => {
  if (mutationTimeout) window.clearTimeout(mutationTimeout);
  mutationTimeout = window.setTimeout(() => {
    checkAndExtractProductContext();
  }, 500);
});

// Executa na carga da página e inicia o MutationObserver
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  checkAndExtractProductContext();
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  window.addEventListener('DOMContentLoaded', () => {
    checkAndExtractProductContext();
    observer.observe(document.body, { childList: true, subtree: true });
  });
}


