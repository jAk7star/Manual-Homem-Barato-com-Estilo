import React, { useEffect, useState } from 'react';
import {
  SavedWatchlistItem,
  getSavedProductsFromCache,
  removeProductFromCache,
} from '../../services/storage.ts';
import { getMonetizedRedirectUrl, openExternalLink } from '../../services/api.ts';
import { BookmarkCheck, Trash2, ExternalLink, Tag, Bell } from 'lucide-react';

interface SavedProductsListProps {
  onSelectProduct?: (productId: string) => void;
}

export const SavedProductsList: React.FC<SavedProductsListProps> = () => {
  const [savedItems, setSavedItems] = useState<SavedWatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    const items = await getSavedProductsFromCache();
    setSavedItems(items);
    setLoading(false);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await removeProductFromCache(id);
    loadSaved();
  };

  const handleBuyNow = (e: React.MouseEvent, item: SavedWatchlistItem) => {
    e.stopPropagation();
    const redirectUrl = getMonetizedRedirectUrl(item.id, 'saved_watchlist', item.affiliateUrl);
    openExternalLink(redirectUrl);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#94A3B8] animate-pulse">
        Carregando seus produtos salvos...
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[#14151A] border border-[#22242B] text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#1A1C22] border border-[#262833] mx-auto flex items-center justify-center text-[#C85A32]">
          <BookmarkCheck className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-[#F3F4F6]">Nenhum produto salvo</h4>
        <p className="text-xs text-[#94A3B8] max-w-[240px] mx-auto leading-relaxed">
          Guarde os produtos que deseja monitorar. Notificaremos você assim que atingir seu preço pretendido!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8] flex items-center gap-1.5">
          <BookmarkCheck className="w-3.5 h-3.5 text-[#C85A32]" />
          PRODUTOS SALVOS / MONITORADOS ({savedItems.length})
        </h3>
      </div>

      <div className="space-y-2.5">
        {savedItems.map((item) => {
          const isTargetReached = item.currentBestPrice <= item.targetPrice;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col gap-3 ${
                isTargetReached
                  ? 'bg-[#14151A] border-[#10B981]/50 shadow-lg shadow-[#10B981]/5'
                  : 'bg-[#14151A] border-[#22242B]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 truncate space-y-1">
                  {item.categoryName && (
                    <span className="text-[9px] font-extrabold text-[#C85A32] uppercase tracking-wider block">
                      {item.categoryName}
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-[#F3F4F6] truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] flex items-center gap-2">
                    <span>Preço Atual: <strong className="text-white">R$ {item.currentBestPrice.toFixed(2)}</strong></span>
                    <span>•</span>
                    <span>Pretendido: <strong className="text-[#C85A32]">R$ {item.targetPrice.toFixed(2)}</strong></span>
                  </p>
                </div>

                <button
                  onClick={(e) => handleRemove(e, item.id)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-[#EF4444] hover:bg-[#262833] transition-colors"
                  title="Remover produto dos salvos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#22242B]/60">
                {isTargetReached ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1">
                    <Bell className="w-3 h-3 animate-bounce" />
                    PREÇO ALCANÇADO!
                  </span>
                ) : (
                  <span className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#C85A32]" />
                    Monitorando queda de preço
                  </span>
                )}

                <button
                  onClick={(e) => handleBuyNow(e, item)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C85A32] hover:bg-[#9A3412] text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Ir à Loja</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
