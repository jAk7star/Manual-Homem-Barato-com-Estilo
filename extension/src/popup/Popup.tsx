import React, { useEffect, useState } from 'react';
import { Header } from './components/Header.tsx';
import { ProductHero } from './components/ProductHero.tsx';
import { DealBadge } from './components/DealBadge.tsx';
import { OlfactoryAccords } from './components/OlfactoryAccords.tsx';
import { StoreComparison } from './components/StoreComparison.tsx';
import { PriceAlertForm } from './components/PriceAlertForm.tsx';
import { PriceHistoryChart } from './components/PriceHistoryChart.tsx';
import { SavedProductsList } from './components/SavedProductsList.tsx';
import { ExpandedDashboard } from './components/ExpandedDashboard.tsx';
import {
  searchProducts,
  matchProductContext,
  fetchLiveOffersFromWeb,
  ProductDetails,
  ProductOffer,
  openExternalLink,
} from '../services/api.ts';
import { getDetectedProduct } from '../services/storage.ts';
import {
  Loader2,
  Search,
  ArrowRight,
  BookmarkCheck,
  ShieldAlert,
  Compass,
  ExternalLink,
} from 'lucide-react';
import '../styles/main.css';

type ViewMode = 'list' | 'detail' | 'saved' | 'out_of_scope';

export const Popup: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchResults, setSearchResults] = useState<ProductDetails[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [unmatchedTitle, setUnmatchedTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);

  // Detecta se a página foi aberta em Modo Widescreen / Aba Completa
  const isExpandedMode =
    typeof window !== 'undefined' && window.location.search.includes('mode=expanded');

  // Dispara a Raspagem Ao Vivo das Lojas Parceiras via Worker Microservice (/api/live-compare)
  useEffect(() => {
    if (selectedProduct && selectedProduct.id && !selectedProduct.id.includes('mock')) {
      setIsLiveSyncing(true);
      fetchLiveOffersFromWeb(selectedProduct.id)
        .then((liveOffers: ProductOffer[]) => {
          if (liveOffers && liveOffers.length > 0) {
            setSelectedProduct((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                offers: liveOffers,
              };
            });
          }
        })
        .catch((err: unknown) => console.warn('[Popup Live Compare Error]', err))
        .finally(() => setIsLiveSyncing(false));
    }
  }, [selectedProduct?.id]);

  const handleExecuteSearch = async (query: string) => {
    setLoading(true);
    setSearchTerm(query);
    const results = await searchProducts(query);
    setSearchResults(results);

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

      if (active && active.title && active.title.length > 3) {
        // Envia para o backend RPC para averiguação estrita de contexto
        let matched = await matchProductContext({
          title: active.title,
          domain: active.domain,
        });

        if (matched) {
          // Sincroniza em tempo real o preço extraído do DOM na oferta da loja ativa
          if (active.domain && active.price && active.price > 0) {
            const offerIdx = matched.offers.findIndex(
              (o) => o.store_domain.includes(active.domain) || active.domain.includes(o.store_domain)
            );
            if (offerIdx >= 0) {
              matched.offers[offerIdx].current_price = active.price;
              matched.offers.sort((a, b) => a.current_price - b.current_price);
            }
          }

          setSelectedProduct(matched);
          setViewMode('detail');
          setLoading(false);
          return;
        } else if (active.price && active.price > 0) {
          // Produto capturado da página atual que ainda não possui catálogo multi-loja pré-cadastrado
          const liveProduct: ProductDetails = {
            id: active.url || 'live-item',
            name: active.title,
            slug: active.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
            category_name: 'Produto da Página Atual',
            offers: [
              {
                product_id: active.url || 'live-item',
                product_name: active.title,
                current_price: active.price,
                store_name: active.domain.includes('mercadolivre')
                  ? 'Mercado Livre'
                  : active.domain.includes('boticario')
                  ? 'O Boticário'
                  : active.domain.includes('amazon')
                  ? 'Amazon Brasil'
                  : active.domain,
                store_domain: active.domain,
                affiliate_url: active.url,
                offer_id: active.url,
                classification: 'excellent',
                score: 98,
              }
            ],
          };

          setSelectedProduct(liveProduct);
          setViewMode('detail');
          setLoading(false);
          return;
        } else {
          // Produto fora do escopo ou sem preço extraído no DOM
          setUnmatchedTitle(active.title);
          setViewMode('out_of_scope');
          setLoading(false);
          return;
        }
      }

      // Se não há página ativa detectada, abre busca/lista de catálogo
      const initial = await searchProducts('');
      setSearchResults(initial);
      if (initial.length > 0) {
        setSelectedProduct(initial[0]);
        setViewMode('detail');
      } else {
        setViewMode('list');
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
        canGoBack={viewMode === 'detail' || viewMode === 'saved'}
        onBack={() => setViewMode('list')}
        onGoHome={handleGoHome}
      />

      {/* Tabs de Navegação Principal */}
      <div className="flex border-b border-[#22242b] bg-[#14151a] shrink-0 text-xs font-bold">
        <button
          onClick={() => setViewMode(selectedProduct ? 'detail' : 'list')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'detail' || viewMode === 'list'
              ? 'border-[#C85A32] text-[#C85A32] bg-[#1A1C22]'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Comparador</span>
        </button>

        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
            viewMode === 'saved'
              ? 'border-[#C85A32] text-[#C85A32] bg-[#1A1C22]'
              : 'border-transparent text-[#94A3B8] hover:text-white'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Meus Salvos (Cache)</span>
        </button>
      </div>

      {/* Barra de Busca Minimalista */}
      {viewMode !== 'saved' && (
        <div className="px-3.5 py-2.5 bg-[#14151a] border-b border-[#22242b] shrink-0">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1 flex items-center bg-[#0e0f12] border border-[#27272a] rounded px-3 py-1.5 text-xs focus-within:border-[#c85a32]">
              <Search className="w-3.5 h-3.5 text-[#71717a] mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto, marca ou sapato..."
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
      )}

      {/* Conteúdo Principal com Scroll Interno */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-[#94A3B8]">
            <Loader2 className="w-6 h-6 animate-spin text-[#C85A32]" />
            <span className="text-xs font-semibold">Averiguando contexto da página...</span>
          </div>
        ) : viewMode === 'out_of_scope' ? (
          /* Estado Neutro: Produto Fora do Escopo */
          <div className="py-8 px-4 bg-[#14151A] rounded-2xl border border-[#22242B] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1A1C22] border border-[#C85A32]/40 mx-auto flex items-center justify-center text-[#C85A32]">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#F3F4F6]">
                Produto Fora do Escopo Monitorado
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                A página atual (<strong className="text-white">"{unmatchedTitle}"</strong>) não pertence às categorias monitoradas pelo Elite-Bot (Perfumes, Moda, Grooming e Calçados).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#1A1C22] border border-[#262833] text-[11px] text-[#94A3B8] text-left space-y-1">
              <span className="text-[#C85A32] font-bold block">✓ Garantia de Coerência</span>
              <p>O Elite-Bot não exibe dados ou acordes olfativos forçados para produtos fora de nosso catálogo de inteligência.</p>
            </div>

            <button
              onClick={() => handleExecuteSearch('')}
              className="w-full py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#9A3412] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Explorar Catálogo em Destaque
            </button>
          </div>
        ) : viewMode === 'saved' ? (
          /* Visão da Lista de Salvos no Cache Local */
          <SavedProductsList />
        ) : viewMode === 'detail' && selectedProduct ? (
          /* Visão de Detalhes do Produto */
          <div className="space-y-3">
            <ProductHero product={selectedProduct} />

            <DealBadge
              classification={selectedProduct.offers[0]?.classification || 'excellent'}
              savingsPercent={20}
            />

            {/* Exibe notas olfativas APENAS se for perfume */}
            {selectedProduct.accords && (
              <OlfactoryAccords accords={selectedProduct.accords} />
            )}

            <PriceHistoryChart
              currentPrice={selectedProduct.offers[0]?.current_price || 149.9}
              lowestPrice={139.9}
              timeframe="180 Dias"
            />

            <StoreComparison offers={selectedProduct.offers} isLiveSyncing={isLiveSyncing} />

            <PriceAlertForm
              productId={selectedProduct.id}
              currentPrice={selectedProduct.offers[0]?.current_price || 149.9}
              productName={selectedProduct.name}
              categoryName={selectedProduct.category_name}
              imageUrl={selectedProduct.image_url}
              affiliateUrl={selectedProduct.offers[0]?.affiliate_url}
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
                  Tente pesquisar por Malbec, Kaiak, Sapato, Tênis ou Renner.
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
                            Melhor loja:{' '}
                            <strong className="text-[#E5E7EB]">
                              {best?.store_name || 'Loja Parceira'}
                            </strong>
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
          <span>Links Afiliados 302</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </footer>
    </div>
  );
};

export default Popup;
