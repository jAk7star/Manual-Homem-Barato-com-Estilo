import React from 'react';
import { Flame, ThumbsUp, AlertTriangle } from 'lucide-react';

interface DealBadgeProps {
  classification?: 'excellent' | 'good' | 'normal' | 'expensive';
  savingsPercent?: number;
}

export const DealBadge: React.FC<DealBadgeProps> = ({ classification = 'excellent', savingsPercent = 20 }) => {
  if (classification === 'excellent') {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/30 text-[#C85A32] shadow-anti-vibe">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#C85A32]" />
          <span className="text-xs font-bold uppercase tracking-wide">
            OFERTA EXCELENTE
          </span>
        </div>
        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#C85A32] text-white">
          -{savingsPercent}% OFF
        </span>
      </div>
    );
  }

  if (classification === 'good') {
    return (
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0284C7]/10 border border-[#0284C7]/30 text-[#38BDF8] shadow-anti-vibe">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-xs font-bold uppercase tracking-wide">
            PREÇO BOM
          </span>
        </div>
        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#0284C7] text-white">
          BOM PREÇO
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#282B34] border border-[#383B44] text-[#94A3B8]">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[#94A3B8]" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          PREÇO NORMAL
        </span>
      </div>
    </div>
  );
};
