/**
 * Background Service Worker — Gerenciador de eventos, Side Panel e Badge da Extensão
 */

import { getProductBySlugOrName } from '../services/api.ts';

if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onInstalled.addListener(() => {
    console.log('[Elite Bot Background] Service Worker Instalado com Sucesso!');

    // Configura o Side Panel para abrir ao clicar no ação caso ativado
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
        console.warn('Erro ao definir comportamento do SidePanel:', err);
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
    if (message.action === 'OPEN_EXPANDED_VIEW') {
      const expandedUrl = chrome.runtime.getURL('index.html?mode=expanded');
      chrome.tabs.create({ url: expandedUrl });
      return;
    }

    if (message.type === 'OPEN_SIDE_PANEL' && sender.tab?.id) {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ tabId: sender.tab.id }).catch(() => {
          const popupUrl = chrome.runtime.getURL('index.html');
          chrome.tabs.create({ url: popupUrl });
        });
      } else {
        const popupUrl = chrome.runtime.getURL('index.html');
        chrome.tabs.create({ url: popupUrl });
      }
      return;
    }

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
