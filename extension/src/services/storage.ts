/**
 * Chrome Storage Wrapper — Armazenamento seguro de preferências e cache local
 */

export interface ActiveProductContext {
  title: string;
  price?: number;
  url: string;
  domain: string;
  updatedAt: number;
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
