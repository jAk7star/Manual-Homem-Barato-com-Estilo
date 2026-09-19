/**
 * Background Service Worker — Gerenciador de eventos e ícone de Badge da Extensão
 */

import { getProductBySlugOrName } from '../services/api.ts';

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('[Elite Bot Background] Service Worker Instalado com Sucesso!');
  });

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'PRODUCT_DETECTED' && message.payload) {
      const { title } = message.payload;

      // Consulta a API para verificar se existe um desconto maior no Elite Bot
      getProductBySlugOrName(title).then((product) => {
        if (product && product.offers.length > 0) {
          const bestPrice = product.offers[0].current_price;
          const currentPrice = message.payload.price || bestPrice;

          if (bestPrice < currentPrice) {
            const savingsPercent = Math.round(((currentPrice - bestPrice) / currentPrice) * 100);
            chrome.action.setBadgeText({ text: `-${savingsPercent}%` });
            chrome.action.setBadgeBackgroundColor({ color: '#C85A32' }); // Terracota Aramis
          } else {
            chrome.action.setBadgeText({ text: 'TOP' });
            chrome.action.setBadgeBackgroundColor({ color: '#10B981' });
          }
        }
      });
    }
  });
}
