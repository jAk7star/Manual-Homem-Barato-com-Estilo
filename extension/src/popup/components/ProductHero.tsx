import React from 'react';
import { ProductDetails } from '../../services/api.ts';

interface ProductHeroProps {
  product: ProductDetails;
}

export const ProductHero: React.FC<ProductHeroProps> = ({ product }) => {
  const bestOffer = product.offers[0];

  return (
    <div className="flex gap-4 items-start p-3.5 bg-[#14151a] border border-[#22242b] rounded-lg">
      <div className="w-20 h-20 rounded bg-[#1a1c22] border border-[#262833] overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#71717a]">
            EB
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
        <p className="text-xs text-[#71717a] font-mono mt-0.5">100ml / Edição Limitada</p>

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
