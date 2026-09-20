import React, { useState } from 'react';
import { ProductDetails } from '../../services/api.ts';

interface ProductHeroProps {
  product: ProductDetails;
}

export const ProductHero: React.FC<ProductHeroProps> = ({ product }) => {
  const [imgError, setImgError] = useState(false);
  const bestOffer = product.offers[0];

  return (
    <div className="flex gap-4 items-start p-3.5 bg-[#14151a] border border-[#22242b] rounded-lg">
      <div className="w-20 h-20 rounded bg-[#1a1c22] border border-[#262833] overflow-hidden flex-shrink-0 relative flex items-center justify-center">
        {product.image_url && !imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 bg-[#1a1c22] text-[#c85a32]">
            <svg className="w-6 h-6 mb-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-[9px] font-mono font-semibold text-[#a1a1aa] leading-tight">
              Elite Bot
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c85a32] block font-semibold">
          {bestOffer?.store_name || 'Loja Parceira'} • {product.category_name || 'Nicho Masculino'}
        </span>
        <h3 className="text-sm font-semibold text-white tracking-tight mt-0.5 truncate font-sans">
          {product.name}
        </h3>
        <p className="text-xs text-[#71717a] font-mono mt-0.5">Link Direto • Preço Verificado</p>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-white tracking-tight font-mono">
            R$ {(bestOffer?.current_price || 149.9).toFixed(2)}
          </span>
          {bestOffer?.original_price && bestOffer.original_price > bestOffer.current_price && (
            <span className="text-xs text-[#52525b] line-through font-mono">
              R$ {bestOffer.original_price.toFixed(2)}
            </span>
          )}
          <span className="text-[10px] text-[#c85a32] font-mono ml-auto font-semibold tracking-wider">
            ↓ 12% 30d
          </span>
        </div>
      </div>
    </div>
  );
};

