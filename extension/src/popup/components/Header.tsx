import React from 'react';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  onGoHome?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onGoHome, canGoBack }) => {
  return (
    <header className="flex items-center justify-between px-3.5 py-2.5 bg-[#1A1C22] border-b border-[#282B34] shrink-0">
      <div className="flex items-center gap-2">
        {canGoBack && onBack ? (
          <button
            onClick={onBack}
            className="p-1 rounded-lg bg-[#282B34] text-[#F3F4F6] hover:bg-[#383B44] transition-colors flex items-center justify-center cursor-pointer"
            title="Voltar para busca"
          >
            <ChevronLeft className="w-4 h-4 text-[#C85A32]" />
          </button>
        ) : null}

        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold font-sans text-xs tracking-wider shadow-sm">
            EB
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-[#F3F4F6] font-sans leading-none">
              Elite Bot
            </h1>
            <p className="text-[9.5px] text-[#94A3B8] tracking-tight mt-0.5">
              Guia do Homem Barato
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121316] border border-[#282B34]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
        <span className="text-[9.5px] font-semibold text-[#E5E7EB] tracking-wide uppercase">
          API Conectada
        </span>
      </div>
    </header>
  );
};
