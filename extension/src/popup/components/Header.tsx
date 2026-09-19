import React from 'react';
import { ShieldCheck, Tag } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[#1A1C22] border-b border-[#282B34]">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold font-sans text-xs tracking-wider shadow-sm">
          EB
        </div>
        <div>
          <h1 className="text-xs font-bold uppercase tracking-widest text-[#F3F4F6] font-sans">
            Elite Bot
          </h1>
          <p className="text-[10px] text-[#94A3B8] tracking-tight">
            Guia do Homem Barato
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121316] border border-[#282B34]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
        <span className="text-[10px] font-semibold text-[#E5E7EB] tracking-wide uppercase">
          API Conectada
        </span>
      </div>
    </header>
  );
};
