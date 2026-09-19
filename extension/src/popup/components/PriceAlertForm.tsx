import React, { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { createPriceAlert } from '../../services/api.ts';

interface PriceAlertFormProps {
  productId: string;
  currentPrice: number;
}

export const PriceAlertForm: React.FC<PriceAlertFormProps> = ({ productId, currentPrice }) => {
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
    const ok = await createPriceAlert(productId, priceNum);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#1A1C22] p-3.5 rounded-xl border border-[#282B34] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-[#C85A32]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#F3F4F6]">
            CRIAR ALERTA DE PREÇO
          </span>
        </div>
        <span className="text-[10px] text-[#94A3B8]">
          WhatsApp & Email
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
          className="px-4 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#B8522B] text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : success ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Criado!</span>
            </>
          ) : (
            <span>Ativar Alerta</span>
          )}
        </button>
      </div>
    </form>
  );
};
