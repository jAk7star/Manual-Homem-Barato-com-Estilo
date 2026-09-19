import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { ProductHero } from './components/ProductHero.tsx';
import { DealBadge } from './components/DealBadge.tsx';
import { OlfactoryAccords } from './components/OlfactoryAccords.tsx';
import { SizeSelector } from './components/SizeSelector.tsx';
import { StoreComparison } from './components/StoreComparison.tsx';
import { PriceAlertForm } from './components/PriceAlertForm.tsx';
import { searchProducts, ProductDetails, openExternalLink } from '../services/api.ts';
import { getDetectedProduct } from '../services/storage.ts';
import { Loader2, Search, ArrowRight, Tag, ExternalLink } from 'lucide-react';
import '../styles/main.css';

type ViewMode = 'list' | 'detail';

export const Popup: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchResults, setSearchResults] = useState<ProductDetails[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const QUICK_TAGS = [
    { label: '🔥 Malbec', term: 'Malbec' },
    { label: '🌊 Kaiak', term: 'Kaiak' },
    { label: '👞 Sapato Ferracini', term: 'Ferracini' },
    { label: '👟 Tênis Olympikus', term: 'Olympikus' },
    { label: '👕 Polo Renner', term: 'Renner' },
  ];

  const handleExecuteSearch = async (query: string) => {
    setLoading(true);
    setSearchTerm(query);
    const results = await searchProducts(query);
    setSearchResults(results);
    
    // Se a busca retornar apenas 1 resultado direto, entra na página do produto
    if (results.length === 1 && query.trim() !== '') {
      setSelectedProduct(results[0]);
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
    setLoading(false);
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      const active = await getDetectedProduct();
      if (active && active.title) {
        const results = await searchProducts(active.title);
        if (results.length > 0) {
          setSearchResults(results);
          setSelectedProduct(results[0]);
          setViewMode('detail');
          setLoading(false);
          return;
        }
      }
      
      // Inicializa com catálogo padrão
      const initial = await searchProducts('');
      setSearchResults(initial);
      if (initial.length > 0) {
        setSelectedProduct(initial[0]);
        setViewMode('detail');
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteSearch(searchTerm);
  };

  const handleSelectProduct = (product: ProductDetails) => {
    setSelectedProduct(product);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  const handleGoHome = () => {
    setSearchTerm('');
    handleExecuteSearch('');
  };

  return (
    <div className="w-[390px] h-[580px] bg-[#121316] text-[#F3F4F6] flex flex-col font-sans border border-[#282B34] overflow-hidden">
      <Header
        canGoBack={viewMode === 'detail'}
        onBack={handleBackToList}
        onGoHome={handleGoHome}
      />

      <main className="p-3.5 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {/* Barra de Busca Interativa */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Buscar perfume, tênis ou produto..."
            className="w-full bg-[#1A1C22] border border-[#282B34] rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-[#F3F4F6] placeholder-[#94A3B8] focus:outline-none focus:border-[#C85A32] transition-colors"
          />
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded bg-[#C85A32] text-white hover:bg-[#b04d2a] transition-colors"
              title="Pesquisar"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </form>

        {/* Tags de Busca Rápida */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag.term}
              onClick={() => handleExecuteSearch(tag.term)}
              className="px-2.5 py-1 rounded-full bg-[#1A1C22] border border-[#282B34] hover:border-[#C85A32] text-[10px] font-medium text-[#94A3B8] hover:text-[#F3F4F6] whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Conteúdo Principal Dinâmico */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
            <Loader2 className="w-6 h-6 animate-spin text-[#C85A32]" />
            <span className="text-xs font-semibold">Consultando 11 lojas parceiras...</span>
          </div>
        ) : viewMode === 'detail' && selectedProduct ? (
          <div className="space-y-3">
            <ProductHero product={selectedProduct} />

            <DealBadge
              classification={selectedProduct.offers[0]?.classification || 'excellent'}
              savingsPercent={20}
            />

            {/* Renderização Contextual: Olfativa vs Tamanhos */}
            {selectedProduct.accords ? (
              <OlfactoryAccords accords={selectedProduct.accords} />
            ) : (
              <SizeSelector sizes={selectedProduct.available_sizes} />
            )}

            <StoreComparison offers={selectedProduct.offers} />

            <PriceAlertForm
              productId={selectedProduct.id}
              currentPrice={selectedProduct.offers[0]?.current_price || 149.90}
            />
          </div>
        ) : (
          /* Lista de Resultados de Busca */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                {searchTerm ? `Resultados para "${searchTerm}"` : 'Produtos em Destaque'}
              </h2>
              <span className="text-[10px] text-[#C85A32] font-semibold">
                {searchResults.length} produtos
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-12 bg-[#1A1C22] p-4 rounded-xl border border-[#282B34] text-center space-y-2">
                <p className="text-xs font-semibold text-[#F3F4F6]">
                  Nenhum produto encontrado para "{searchTerm}"
                </p>
                <p className="text-[10px] text-[#94A3B8]">
                  Tente pesquisar por Malbec, Kaiak, Sapato, Tênis, O Boticário ou Renner.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((item) => {
                  const best = item.offers[0];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="p-3 bg-[#1A1C22] border border-[#282B34] hover:border-[#C85A32]/60 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-lg bg-[#121316] border border-[#282B34] flex items-center justify-center text-[#C85A32] shrink-0 font-bold text-xs">
                          {item.name.charAt(0)}
                        </div>
                        <div className="truncate space-y-0.5">
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#282B34] text-[#C85A32] uppercase">
                            {item.category_name}
                          </span>
                          <h3 className="text-xs font-bold text-[#F3F4F6] group-hover:text-[#C85A32] transition-colors truncate">
                            {item.name}
                          </h3>
                          <p className="text-[10px] text-[#94A3B8]">
                            Melhor loja: <strong className="text-[#E5E7EB]">{best?.store_name || 'Loja Parceira'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-[#F3F4F6]">
                          R$ {best?.current_price.toFixed(2) || '0.00'}
                        </div>
                        <span className="text-[9.5px] font-bold text-[#C85A32] flex items-center justify-end gap-0.5">
                          Ver Lojas <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="px-4 py-2 bg-[#1A1C22] border-t border-[#282B34] flex items-center justify-between text-[10px] text-[#94A3B8] shrink-0">
        <span>Elite Bot v1.0 • Guia do Homem Barato</span>
        <button
          onClick={() => openExternalLink('http://localhost:3002/r')}
          className="text-[#C85A32] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Links Monetizados 302</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </footer>
    </div>
  );
};

export default Popup;
