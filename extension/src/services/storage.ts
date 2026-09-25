/**
 * Chrome Storage Wrapper — Armazenamento seguro de preferências, cache local e lista de salvos
 */

export interface ActiveProductContext {
  title: string;
  price?: number;
  url: string;
  domain: string;
  updatedAt: number;
}

export interface SavedWatchlistItem {
  id: string;
  name: string;
  targetPrice: number;
  currentBestPrice: number;
  imageUrl?: string;
  savedAt: number;
  categoryName?: string;
  targetReached: boolean;
  storeName?: string;
  affiliateUrl?: string;
}

export async function setDetectedProduct(data: ActiveProductContext): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ activeProduct: data });
  } else {
    localStorage.setItem('activeProduct', JSON.stringify(data));
  }
}

export async function getDetectedProduct(): Promise<ActiveProductContext | null> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const res = await chrome.storage.local.get('activeProduct');
    return (res.activeProduct as ActiveProductContext) || null;
  }
  const raw = localStorage.getItem('activeProduct');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Persistência Local — Produtos Salvos / Alertas de Preço Pretendido
 */

export async function getSavedProductsFromCache(): Promise<SavedWatchlistItem[]> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const res = await chrome.storage.local.get('savedWatchlist');
    return (res.savedWatchlist as SavedWatchlistItem[]) || [];
  }
  const raw = localStorage.getItem('savedWatchlist');
  return raw ? JSON.parse(raw) : [];
}

export async function saveProductToCache(item: SavedWatchlistItem): Promise<void> {
  const current = await getSavedProductsFromCache();
  const existingIdx = current.findIndex((p) => p.id === item.id);

  if (existingIdx >= 0) {
    current[existingIdx] = { ...current[existingIdx], ...item, savedAt: Date.now() };
  } else {
    current.unshift(item);
  }

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ savedWatchlist: current });
  } else {
    localStorage.setItem('savedWatchlist', JSON.stringify(current));
  }
}

export async function removeProductFromCache(id: string): Promise<void> {
  const current = await getSavedProductsFromCache();
  const updated = current.filter((p) => p.id !== id);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ savedWatchlist: updated });
  } else {
    localStorage.setItem('savedWatchlist', JSON.stringify(updated));
  }
}

export async function isProductSaved(id: string): Promise<boolean> {
  const current = await getSavedProductsFromCache();
  return current.some((p) => p.id === id);
}

/**
 * Estado Global do Verificador de Preços (Liga / Desliga)
 */
export async function getVerifierEnabled(): Promise<boolean> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    const res = await chrome.storage.local.get('verifierEnabled');
    return res.verifierEnabled !== false; // Padrão: TRUE (ativado)
  }
  const raw = localStorage.getItem('verifierEnabled');
  return raw !== null ? JSON.parse(raw) : true;
}

export async function setVerifierEnabled(enabled: boolean): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ verifierEnabled: enabled });
  } else {
    localStorage.setItem('verifierEnabled', JSON.stringify(enabled));
  }
}

