/**
 * Content Script — Extrator de produtos e preços em tempo real
 * Injetado automaticamente nas páginas de e-commerce parceiras.
 */

import { setDetectedProduct } from '../services/storage.ts';

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

  const widget = document.createElement('div');
  widget.className = 'eb-pill';
  widget.innerHTML = `
    <div class="eb-icon">EB</div>
    <div class="eb-text">
      <span class="eb-title">Elite Bot • Guia do Homem Barato</span>
      <span class="eb-sub">Menor Preço Verificado em Lojas Parceiras</span>
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

function extractProductContext() {
  const url = window.location.href;
  const domain = window.location.hostname.replace(/^www\./, '');

  // Título da Página / Produto
  const titleMeta =
    document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
    document.querySelector('h1')?.textContent?.trim() ||
    document.title;

  // Preço da Página
  const priceMeta =
    document.querySelector('meta[property="og:price:amount"]')?.getAttribute('content') ||
    document.querySelector('meta[property="product:price:amount"]')?.getAttribute('content');
  const price = priceMeta ? parseFloat(priceMeta) : undefined;

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

// Executa na carga da página
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  extractProductContext();
} else {
  window.addEventListener('DOMContentLoaded', extractProductContext);
}

