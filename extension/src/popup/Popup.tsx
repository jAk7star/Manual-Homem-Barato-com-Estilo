import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { ProductHero } from './components/ProductHero.tsx';
import { DealBadge } from './components/DealBadge.tsx';
import { OlfactoryAccords } from './components/OlfactoryAccords.tsx';
import { StoreComparison } from './components/StoreComparison.tsx';
import { PriceAlertForm } from './components/PriceAlertForm.tsx';
import { PriceHistoryChart } from './components/PriceHistoryChart.tsx';
import { ExpandedDashboard } from './components/ExpandedDashboard.tsx';
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

  // Detecta se a página foi aberta em Modo Widescreen / Aba Completa
  const isExpandedMode = typeof window !== 'undefined' && window.location.search.includes('mode=expanded');

  const QUICK_TAGS = [
    { label: '🔥 Asad Lattafa', term: 'Asad' },
    { label: '🍷 Malbec', term: 'Malbec' },
    { label: '🌊 Kaiak', term: 'Kaiak' },
    { label: '👞 Sapato Democrata', term: 'Democrata' },
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

  // Se a URL contiver mode=expanded, renderiza o Dashboard Widescreen Completo
  if (isExpandedMode) {
    return <ExpandedDashboard product={selectedProduct} />;
  }

  return (
    <div className="w-full max-w-[390px] min-h-screen bg-[#0e0f12] text-[#F3F4F6] flex flex-col font-mono border-r border-[#22242b] overflow-x-hidden">
      <Header
        canGoBack={viewMode === 'detail'}
        onBack={handleBackToList}
        onGoHome={handleGoHome}
      />

      {/* Barra de Busca Minimalista */}
      <div className="px-3.5 py-2.5 bg-[#14151a] border-b border-[#22242b] shrink-0">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center bg-[#0e0f12] border border-[#27272a] rounded px-3 py-1.5 text-xs focus-within:border-[#c85a32]">
            <Search className="w-3.5 h-3.5 text-[#71717a] mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar acorde, marca ou sapato..."
              className="bg-transparent border-none p-0 text-xs text-white placeholder-[#52525b] focus:outline-none w-full font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded bg-[#c85a32] hover:bg-[#b54f2a] text-white text-xs font-mono font-medium transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Conteúdo Principal com Scroll Interno */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
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

            {/* Exibe notas olfativas se for perfume */}
            {selectedProduct.accords && (
              <OlfactoryAccords accords={selectedProduct.accords} />
            )}

            <PriceHistoryChart
              currentPrice={selectedProduct.offers[0]?.current_price || 149.90}
              lowestPrice={139.90}
              timeframe="180 Dias"
            />

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
      </div>

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
