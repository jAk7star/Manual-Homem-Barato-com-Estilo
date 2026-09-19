import React, { useState } from 'react';

interface SizeSelectorProps {
  sizes?: number[];
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ sizes = [38, 39, 40, 41, 42, 43, 44] }) => {
  const [selectedSize, setSelectedSize] = useState<number>(40);

  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="bg-[#1A1C22] p-3 rounded-xl border border-[#282B34] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
          COMPRE POR TAMANHO (CALÇADOS & MODA)
        </span>
        <span className="text-[10px] text-[#C85A32] font-bold">
          Tam. {selectedSize} selecionado
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {sizes.map((size) => {
          const isSelected = size === selectedSize;
          return (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all js-animate-card flex items-center justify-center ${
                isSelected
                  ? 'bg-[#C85A32] text-white shadow-md'
                  : 'bg-[#121316] text-[#94A3B8] hover:text-[#F3F4F6] border border-[#282B34]'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
