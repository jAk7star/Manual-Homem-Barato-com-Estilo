import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { ProductHero } from './components/ProductHero.tsx';
import { DealBadge } from './components/DealBadge.tsx';
import { OlfactoryAccords } from './components/OlfactoryAccords.tsx';
import { SizeSelector } from './components/SizeSelector.tsx';
import { StoreComparison } from './components/StoreComparison.tsx';
import { PriceAlertForm } from './components/PriceAlertForm.tsx';
import { getProductBySlugOrName, ProductDetails } from '../services/api.ts';
import { getDetectedProduct } from '../services/storage.ts';
import { Loader2, Search } from 'lucide-react';
import '../styles/main.css';

export const Popup: React.FC = () => {
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('Malbec');

  const loadData = async (query: string) => {
    setLoading(true);
    const data = await getProductBySlugOrName(query);
    setProduct(data);
    setLoading(false);
  };

  useEffect(() => {
    async function init() {
      const active = await getDetectedProduct();
      if (active && active.title) {
        setSearchTerm(active.title);
        await loadData(active.title);
      } else {
        await loadData('Malbec');
      }
    }
    init();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      loadData(searchTerm.trim());
    }
  };

  return (
    <div className="w-[390px] min-h-[560px] bg-[#121316] text-[#F3F4F6] flex flex-col font-sans border border-[#282B34]">
      <Header />

      <main className="p-3.5 space-y-3 flex-1">
        {/* Barra de Busca Rápida */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar perfume, tênis ou produto..."
            className="w-full bg-[#1A1C22] border border-[#282B34] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#F3F4F6] placeholder-[#94A3B8] focus:outline-none focus:border-[#C85A32] transition-colors"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
            <Loader2 className="w-6 h-6 animate-spin text-[#C85A32]" />
            <span className="text-xs font-semibold">Consultando 11 lojas parceiras...</span>
          </div>
        ) : product ? (
          <>
            <ProductHero product={product} />
            <DealBadge
              classification={product.offers[0]?.classification || 'excellent'}
              savingsPercent={20}
            />

            {/* Renderização Contextual Olfativa vs Tamanhos */}
            {product.accords ? (
              <OlfactoryAccords accords={product.accords} />
            ) : (
              <SizeSelector sizes={product.available_sizes} />
            )}

            <StoreComparison offers={product.offers} />

            <PriceAlertForm
              productId={product.id}
              currentPrice={product.offers[0]?.current_price || 149.90}
            />
          </>
        ) : (
          <div className="py-12 bg-[#1A1C22] p-4 rounded-xl border border-[#282B34] text-center space-y-2">
            <p className="text-xs font-semibold text-[#F3F4F6]">
              Nenhum produto encontrado para "{searchTerm}"
            </p>
            <p className="text-[10px] text-[#94A3B8]">
              Tente pesquisar por Malbec, Kaiak, Tênis, O Boticário ou Renner.
            </p>
          </div>
        )}
      </main>

      <footer className="px-4 py-2 bg-[#1A1C22] border-t border-[#282B34] flex items-center justify-between text-[10px] text-[#94A3B8]">
        <span>Elite Bot v1.0 • Guia do Homem Barato</span>
        <span className="text-[#C85A32] font-semibold">Links Monetizados 302</span>
      </footer>
    </div>
  );
};

export default Popup;
