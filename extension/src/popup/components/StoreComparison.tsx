import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ProductOffer, getMonetizedRedirectUrl, openExternalLink } from '../../services/api.ts';

interface StoreComparisonProps {
  offers: ProductOffer[];
  selectedSize?: string | number;
  isLiveSyncing?: boolean;
}

export const StoreComparison: React.FC<StoreComparisonProps> = ({ offers, selectedSize, isLiveSyncing }) => {
  if (!offers || offers.length === 0) {
    return (
      <div className="bg-[#1A1C22] p-4 rounded-xl border border-[#282B34] text-center text-xs text-[#94A3B8]">
        Nenhuma oferta adicional encontrada no momento.
      </div>
    );
  }

  const handleOpenStore = (e: React.MouseEvent, offer: ProductOffer) => {
    e.preventDefault();
    const redirectUrl = getMonetizedRedirectUrl(offer.offer_id, 'extension_popup', offer.affiliate_url);
    openExternalLink(redirectUrl);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
          COMPARATIVO NAS 11 LOJAS PARCEIRAS
        </h2>
        <span className="text-[10px] text-[#C85A32] font-semibold">
          {offers.length} ofertas ativas
        </span>
      </div>

      {isLiveSyncing && (
        <div className="px-3 py-1.5 rounded-lg bg-[#C85A32]/10 border border-[#C85A32]/30 flex items-center gap-2 text-[10px] text-[#C85A32]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C85A32] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C85A32]"></span>
          </span>
          <span className="font-bold">⚡ Sincronizando preços ao vivo com os sites...</span>
        </div>
      )}

      <div className="space-y-2">
        {offers.map((offer, index) => {
          const isBest = index === 0;

          return (
            <div
              key={offer.offer_id || index}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                isBest
                  ? 'bg-[#1A1C22] border-[#C85A32]/50 shadow-md'
                  : 'bg-[#1A1C22]/60 border-[#282B34] opacity-90 hover:opacity-100'
              }`}
            >
              <div className="space-y-0.5 flex-1 truncate">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-[#F3F4F6] truncate">
                    {offer.store_name}
                  </span>
                  {isBest && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#C85A32] text-white uppercase tracking-wider">
                      MENOR PREÇO
                    </span>
                  )}
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#22242B] text-[#10B981] border border-[#10B981]/30">
                    ✓ Link Direto
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                  <span>Vendido pela loja • Vai para o produto exato</span>
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#F3F4F6]">
                    R$ {offer.current_price.toFixed(2)}
                  </div>
                  {offer.original_price && offer.original_price > offer.current_price && (
                    <div className="text-[10px] text-[#94A3B8] line-through">
                      R$ {offer.original_price.toFixed(2)}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => handleOpenStore(e, offer)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isBest
                      ? 'bg-white text-[#090A0F] hover:bg-[#F3F4F6] shadow-md'
                      : 'bg-[#282B34] text-[#F3F4F6] hover:bg-[#383B44]'
                  }`}
                  title="Abrir link de oferta em nova aba"
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
