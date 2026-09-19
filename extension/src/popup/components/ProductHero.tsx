import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { ProductDetails } from '../../services/api.ts';

interface ProductHeroProps {
  product: ProductDetails;
}

export const ProductHero: React.FC<ProductHeroProps> = ({ product }) => {
  const bestOffer = product.offers[0];

  return (
    <div className="bg-[#1A1C22] p-3.5 rounded-xl border border-[#282B34] space-y-2.5">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-lg bg-[#121316] border border-[#282B34] p-1 flex items-center justify-center shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain rounded" />
          ) : (
            <ShoppingBag className="w-6 h-6 text-[#94A3B8]" />
          )}
        </div>

        <div className="space-y-1 flex-1 truncate">
          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#282B34] text-[#C85A32] uppercase tracking-wider">
            {product.category_name || 'Moda & Perfumaria'}
          </span>
          <h2 className="text-xs font-bold text-[#F3F4F6] truncate leading-snug">
            {product.name}
          </h2>
          <p className="text-[10px] text-[#94A3B8]">
            Encontrado em: <strong className="text-[#E5E7EB]">{bestOffer?.store_name || 'Loja Parceira'}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
