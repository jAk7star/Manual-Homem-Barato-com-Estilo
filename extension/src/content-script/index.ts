/**
 * Content Script — Extrator de produtos e preços em tempo real
 * Injetado automaticamente nas páginas de e-commerce parceiras.
 */

import { setDetectedProduct } from '../services/storage.ts';

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
}

// Executa na carga da página
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  extractProductContext();
} else {
  window.addEventListener('DOMContentLoaded', extractProductContext);
}
