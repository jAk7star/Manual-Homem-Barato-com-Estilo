import React, { useState } from 'react';
import { Bell, Check, Loader2, Bookmark } from 'lucide-react';
import { createPriceAlert } from '../../services/api.ts';
import { saveProductToCache } from '../../services/storage.ts';

interface PriceAlertFormProps {
  productId: string;
  currentPrice: number;
  productName?: string;
  categoryName?: string;
  imageUrl?: string;
  affiliateUrl?: string;
}

export const PriceAlertForm: React.FC<PriceAlertFormProps> = ({
  productId,
  currentPrice,
  productName = 'Produto Selecionado',
  categoryName,
  imageUrl,
  affiliateUrl,
}) => {
  const [targetPrice, setTargetPrice] = useState<string>(
    (currentPrice * 0.85).toFixed(2)
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setLoading(true);

    // 1. Salva na Persistência Local do Cache do App (chrome.storage.local)
    await saveProductToCache({
      id: productId,
      name: productName,
      targetPrice: priceNum,
      currentBestPrice: currentPrice,
      imageUrl,
      categoryName,
      affiliateUrl,
      savedAt: Date.now(),
      targetReached: currentPrice <= priceNum,
    });

    // 2. Sincroniza com a API do PostgreSQL (se online)
    await createPriceAlert(productId, priceNum);

    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1A1C22] p-3.5 rounded-xl border border-[#282B34] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3F4F6]">
            SALVAR & DEFINIR PREÇO PRETENDIDO
          </span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">
          Salvo no App + Notificação
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94A3B8]">
            R$
          </span>
          <input
            type="number"
            step="0.01"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full bg-[#121316] border border-[#282B34] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#F3F4F6] focus:outline-none focus:border-[#C85A32] transition-colors"
            placeholder="Preço desejado"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || success}
          className="px-4 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#B8522B] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : success ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Salvo no App!</span>
            </>
          ) : (
            <span>Salvar & Monitorar</span>
          )}
        </button>
      </div>
    </form>
  );
};
