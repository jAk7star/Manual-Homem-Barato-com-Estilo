import React, { useState } from 'react';
import { ProductDetails, ProductOffer } from '../../services/api.ts';
import { Moon, Sun, Gem, ZoomIn, ZoomOut, ArrowUpRight, BarChart2, LayoutGrid, Layers } from 'lucide-react';

export type ThemeMode = 'dark' | 'sand' | 'obsidian';
export type LayoutScheme = 'editorial' | 'matrix' | 'analytics';

interface ExpandedDashboardProps {
  product?: ProductDetails | null;
}

export const ExpandedDashboard: React.FC<ExpandedDashboardProps> = ({ product }) => {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [layout, setLayout] = useState<LayoutScheme>('editorial');
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '180d' | '1y'>('180d');
  const [zoomScale, setZoomScale] = useState<number>(100); // 90%, 100%, 110%
  const [searchTerm, setSearchTerm] = useState('');

  // Estilização & Tipografia Especificamente Pareadas por Tema
  const themeConfig = {
    dark: {
      wrapperClass: 'theme-dark bg-[#0e0f12] text-[#e4e4e7] font-["Inter",sans-serif]',
      surface: 'bg-[#14151a]',
      border: 'border-[#22242b]',
      subtleBorder: 'border-[#1f2129]',
      accentText: 'text-[#c85a32]',
      accentBg: 'bg-[#c85a32] hover:bg-[#b54f2a]',
      pillBg: 'bg-[#1c1d24]',
      mutedText: 'text-[#71717a]',
      cardTitle: 'text-white',
      headerTitle: 'text-white',
    },
    sand: {
      wrapperClass: 'theme-sand bg-[#F7F5F0] text-[#1B1B18] font-["Manrope",sans-serif]',
      surface: 'bg-[#FFFFFF]',
      border: 'border-[#DCD5CA]',
      subtleBorder: 'border-[#EAE6DF]',
      accentText: 'text-[#B84A28]',
      accentBg: 'bg-[#B84A28] hover:bg-[#9d3c1e]',
      pillBg: 'bg-[#F2EFEB]',
      mutedText: 'text-[#7C776E]',
      cardTitle: 'text-[#1B1B18]',
      headerTitle: 'text-[#1B1B18]',
    },
    obsidian: {
      wrapperClass: 'theme-obsidian bg-[#0a0b0e] text-[#e2e8f0] font-["Space_Grotesk",monospace]',
      surface: 'bg-[#121318]',
      border: 'border-[#1e222d]',
      subtleBorder: 'border-[#1e222d]',
      accentText: 'text-[#10b981]',
      accentBg: 'bg-[#10b981] hover:bg-[#0d9668]',
      pillBg: 'bg-[#191b22]',
      mutedText: 'text-[#64748b]',
      cardTitle: 'text-[#f8fafc]',
      headerTitle: 'text-[#f8fafc]',
    },
  };

  const t = themeConfig[theme];

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 10, 120));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 10, 85));

  const currentPrice = product?.offers[0]?.current_price || 149.9;
  const sampleOffers: ProductOffer[] = product?.offers?.length
    ? product.offers
    : [
        {
          offer_id: '1',
          product_id: 'sample-1',
          product_name: 'Malbec 100ml',
          store_name: 'O Boticário',
          store_domain: 'oboticario.com.br',
          affiliate_url: 'https://oboticario.com.br',
          current_price: 149.9,
          original_price: 189.9,
        },
        {
          offer_id: '2',
          product_id: 'sample-1',
          product_name: 'Malbec 100ml',
          store_name: 'Beleza na Web',
          store_domain: 'belezanaweb.com.br',
          affiliate_url: 'https://belezanaweb.com.br',
          current_price: 169.9,
          original_price: 189.9,
        },
        {
          offer_id: '3',
          product_id: 'sample-1',
          product_name: 'Malbec 100ml',
          store_name: 'Mercado Livre',
          store_domain: 'mercadolivre.com.br',
          affiliate_url: 'https://mercadolivre.com.br',
          current_price: 175.0,
          original_price: 189.9,
        },
        {
          offer_id: '4',
          product_id: 'sample-1',
          product_name: 'Malbec 100ml',
          store_name: 'Sephora Brasil',
          store_domain: 'sephora.com.br',
          affiliate_url: 'https://sephora.com.br',
          current_price: 179.9,
          original_price: 199.9,
        },
      ];

  return (
    <div
      className={`w-full min-h-screen ${t.wrapperClass} transition-colors duration-300 antialiased`}
      style={{ fontSize: `${zoomScale}%` }}
    >
      {/* ===== HEADER WIDESCREEN PRINCIPAL ===== */}
      <header className={`sticky top-0 z-50 h-16 ${t.surface} border-b ${t.border} px-6 lg:px-12 flex items-center justify-between shadow-sm`}>
        {/* Marca & Logotipo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#16181f] border border-[#c85a32]/60 flex items-center justify-center text-white font-bold text-sm font-mono">
              E
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold tracking-[0.2em] ${t.headerTitle} font-mono`}>
                ELITE<span className={t.accentText}>BOT</span>
              </span>
              <span className={`text-[9px] tracking-widest ${t.mutedText} font-mono uppercase -mt-0.5`}>
                Widescreen Concierge
              </span>
            </div>
          </div>

          {/* Variações de Esquemas de Organização de Elementos */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded ${t.pillBg} border ${t.border} text-xs font-mono`}>
            <button
              onClick={() => setLayout('editorial')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${
                layout === 'editorial' ? `${t.accentBg} text-white font-semibold` : `${t.mutedText} hover:text-white`
              }`}
              title="Esquema Curadoria Editorial"
            >
              <Layers className="w-3 h-3" />
              <span>Editorial</span>
            </button>
            <button
              onClick={() => setLayout('matrix')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${
                layout === 'matrix' ? `${t.accentBg} text-white font-semibold` : `${t.mutedText} hover:text-white`
              }`}
              title="Esquema Matriz de Oportunidades"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Matriz</span>
            </button>
            <button
              onClick={() => setLayout('analytics')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${
                layout === 'analytics' ? `${t.accentBg} text-white font-semibold` : `${t.mutedText} hover:text-white`
              }`}
              title="Esquema Telemetria & Gráficos"
            >
              <BarChart2 className="w-3 h-3" />
              <span>Telemetria</span>
            </button>
          </nav>
        </div>

        {/* Ícones Minimalistas de Tema & Controles de Densidade/Zoom */}
        <div className="flex items-center gap-4">
          {/* Botões Minimalistas de Ícones de Temas */}
          <div className={`flex items-center gap-1 p-1 rounded ${t.pillBg} border ${t.border}`}>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded transition-all ${
                theme === 'dark' ? 'bg-[#c85a32] text-white shadow-sm' : `${t.mutedText} hover:text-white`
              }`}
              title="Tema Dark Charcoal Matte (Escuro)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('sand')}
              className={`p-1.5 rounded transition-all ${
                theme === 'sand' ? 'bg-[#B84A28] text-white shadow-sm' : `${t.mutedText} hover:text-black`
              }`}
              title="Tema Light Sand Editorial (Claro Limpo Aramis & oBoticário)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setTheme('obsidian')}
              className={`p-1.5 rounded transition-all ${
                theme === 'obsidian' ? 'bg-[#10b981] text-white shadow-sm' : `${t.mutedText} hover:text-white`
              }`}
              title="Tema Obsidian Telemetry (Alta Telemetria)"
            >
              <Gem className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Controles de Densidade & Zoom (+ / -) */}
          <div className={`flex items-center gap-1 p-1 rounded ${t.pillBg} border ${t.border} text-xs font-mono`}>
            <button
              onClick={handleZoomOut}
              className={`p-1 rounded ${t.mutedText} hover:text-white transition-colors`}
              title="Reduzir Escala/Fonte"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[10px] px-1 font-bold ${t.mutedText}`}>{zoomScale}%</span>
            <button
              onClick={handleZoomIn}
              className={`p-1 rounded ${t.mutedText} hover:text-white transition-colors`}
              title="Aumentar Escala/Fonte"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Busca Rápida */}
          <div className={`hidden sm:flex items-center w-56 ${t.surface} border ${t.border} px-3 py-1.5 rounded text-xs`}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar modelo ou nota..."
              className={`bg-transparent border-none p-0 text-xs ${t.cardTitle} placeholder-[#71717a] focus:outline-none w-full font-mono`}
            />
          </div>
        </div>
      </header>

      {/* ===== CONTEÚDO DA PÁGINA WIDESCREEN (CONTAINER FLUIDO MAX 1520PX) ===== */}
      <main className="w-full max-w-[1520px] mx-auto px-6 lg:px-12 pt-8 pb-16 space-y-8">
        {/* Status Ribbon */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b ${t.border} gap-3 text-xs font-mono`}>
          <div className="flex items-center gap-3">
            <span className={`${t.accentText} uppercase tracking-wider font-bold`}>Radar Connoisseur</span>
            <span className={t.mutedText}>/</span>
            <span className={t.mutedText}>Moda, Calçados & Perfumaria Masculina</span>
          </div>
          <div className={`flex items-center gap-4 ${t.mutedText}`}>
            <span>SKUs: <strong className={`${t.cardTitle} font-semibold`}>14.280</strong></span>
            <span>•</span>
            <span>Varredura: <strong className="text-[#10b981] font-semibold">142ms</strong></span>
          </div>
        </div>

        {/* ===== ESQUEMA 1: CURADORIA EDITORIAL CONSOLE ===== */}
        {layout === 'editorial' && (
          <div className={`border ${t.border} ${t.surface} p-8 rounded-lg relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center`}>
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-mono">
                <span className={`${t.accentText} font-bold`}>CURADORIA EDITORIAL</span>
                <span className={t.mutedText}>•</span>
                <span className={t.mutedText}>EDIÇÃO 04</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight leading-tight max-w-2xl ${t.cardTitle}`}>
                {product?.name || 'Malbec Desodorante Colônia 100ml'}
              </h1>
              <p className={`text-xs ${t.mutedText} max-w-xl font-mono leading-relaxed`}>
                Fragrância icônica com acordes amadeirados nobres. Cotação em tempo real nas 11 lojas parceiras com comparativo de frete e cupom verificado.
              </p>

              {/* KPIs de Cesta Telemetria */}
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t ${t.subtleBorder} text-xs font-mono`}>
                <div>
                  <p className={`text-[10px] uppercase ${t.mutedText}`}>Preço Atual</p>
                  <p className={`text-lg font-bold mt-0.5 ${t.cardTitle}`}>R$ {currentPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase ${t.mutedText}`}>Mínima Histórica</p>
                  <p className="text-lg font-bold text-[#10b981] mt-0.5">R$ 139,90</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase ${t.mutedText}`}>Volatilidade</p>
                  <p className={`text-lg font-bold mt-0.5 ${t.cardTitle}`}>Baixa (4.1%)</p>
                </div>
                <div>
                  <p className={`text-[10px] uppercase ${t.mutedText}`}>Índice Connoisseur</p>
                  <p className="text-lg font-bold text-[#d97706] mt-0.5">9.4 / 10</p>
                </div>
              </div>
            </div>

            {/* Fotografia Editorial com Overlay Escuro Scrim */}
            <div className={`lg:col-span-5 h-64 sm:h-72 rounded-lg overflow-hidden relative border ${t.border}`}>
              <img
                src="/assets/editorial_fragrance_male.jpg"
                alt="Editorial Perfumaria Masculina"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#101116]/80 backdrop-blur rounded text-[10px] text-white uppercase tracking-wider font-mono">
                Fotografia Editorial • Perfumaria de Elite
              </div>
            </div>
          </div>
        )}

        {/* ===== GRID WIDESCREEN RESPONSIVO ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA: COTAÇÃO DE LOJAS & PIRÂMIDE OLFATIVA */}
          <div className="lg:col-span-7 space-y-8">
            {/* Matriz Comparativa de Lojas */}
            <div className={`border ${t.border} ${t.surface} p-6 rounded-lg space-y-4`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <h2 className={`font-semibold uppercase tracking-wider ${t.cardTitle}`}>
                  Matriz Comparativa de Lojas
                </h2>
                <span className={`text-[10px] ${t.accentText} font-bold uppercase`}>
                  {sampleOffers.length} ofertas ativas
                </span>
              </div>

              <div className="space-y-2">
                {sampleOffers.map((offer, idx) => (
                  <div
                    key={offer.offer_id || idx}
                    className={`p-3.5 rounded border ${t.subtleBorder} flex items-center justify-between gap-4 text-xs font-mono`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${t.cardTitle}`}>{offer.store_name}</span>
                        {idx === 0 && (
                          <span className="text-[9px] px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-bold uppercase">
                            Menor Preço
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] ${t.mutedText} block mt-0.5`}>
                        Frete Grátis • Cupom: SPECIAL20 (+20% OFF)
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className={`text-sm font-bold block ${t.cardTitle}`}>
                          R$ {offer.current_price.toFixed(2)}
                        </span>
                        {offer.original_price && offer.original_price > offer.current_price && (
                          <span className={`text-[10px] ${t.mutedText} line-through block`}>
                            R$ {offer.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <a
                        href={`http://localhost:3002/r?offer_id=${offer.offer_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-1.5 rounded ${t.accentBg} text-white font-bold text-xs transition-colors flex items-center gap-1`}
                      >
                        <span>Ir para Loja</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pirâmide Olfativa Completa (Fragrantica Style) */}
            <div className={`border ${t.border} ${t.surface} p-6 rounded-lg space-y-4`}>
              <div className="flex justify-between items-center text-xs font-mono">
                <h2 className={`font-semibold uppercase tracking-wider ${t.cardTitle}`}>
                  Pirâmide Olfativa & Acordes
                </h2>
                <span className="text-[10px] text-[#d97706] font-bold">Fragrantica Rating 9.4</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className={`p-3 rounded border ${t.subtleBorder} space-y-1`}>
                  <span className={`text-[10px] ${t.accentText} uppercase font-bold`}>Notas de Topo</span>
                  <p className={`${t.mutedText} text-xs`}>Bergamota, Limão Siciliano, Folhas Verdes</p>
                </div>
                <div className={`p-3 rounded border ${t.subtleBorder} space-y-1`}>
                  <span className="text-[10px] text-[#d97706] uppercase font-bold">Notas de Coração</span>
                  <p className={`${t.mutedText} text-xs`}>Patchouli, Cedro da Virgínia, Pimenta Preta</p>
                </div>
                <div className={`p-3 rounded border ${t.subtleBorder} space-y-1`}>
                  <span className={`text-[10px] ${t.mutedText} uppercase font-bold`}>Notas de Fundo</span>
                  <p className={`${t.mutedText} text-xs`}>Âmbar Quente, Musgo de Carvalho, Couro Nobre</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: HISTÓRICO DE PREÇOS & CATÁLOGO CURADO */}
          <div className="lg:col-span-5 space-y-8">
            {/* Gráfico Histórico Interativo de 180 Dias */}
            <div className={`border ${t.border} ${t.surface} p-6 rounded-lg space-y-4`}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 font-mono text-xs">
                <div>
                  <h3 className={`font-semibold uppercase tracking-wider ${t.cardTitle}`}>
                    Histórico de Preços (180 Dias)
                  </h3>
                  <p className={`text-[10px] ${t.mutedText} mt-0.5`}>
                    Tendência de variação nas lojas parceiras
                  </p>
                </div>

                <div className="flex gap-1 text-[10px]">
                  {(['30d', '90d', '180d', '1y'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded transition-colors uppercase ${
                        timeframe === tf ? `${t.accentBg} text-white font-bold` : `${t.mutedText} hover:text-white`
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas SVG de Gráfico */}
              <div className="w-full h-36 pt-2 flex flex-col justify-end">
                <svg className="w-full h-24 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 100">
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#1f2129" strokeDasharray="2 4" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#1f2129" strokeDasharray="2 4" />
                  <path
                    d="M 0,80 Q 100,70 200,35 T 400,55 T 600,15"
                    fill="none"
                    stroke="#c85a32"
                    strokeWidth="2"
                  />
                  <circle cx="200" cy="35" fill="#c85a32" r="3" />
                  <circle cx="600" cy="15" fill="#10b981" r="3.5" />
                </svg>

                <div className={`flex justify-between text-[9px] font-mono ${t.mutedText} pt-2 border-t ${t.subtleBorder}`}>
                  <span>OUT 24</span>
                  <span>DEZ 24</span>
                  <span>FEV 25</span>
                  <span className="text-[#10b981] font-bold">HOJE (R$ {currentPrice.toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Matriz de Oportunidades / Calçados de Nicho */}
            <div className={`border ${t.border} ${t.surface} p-6 rounded-lg space-y-4`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${t.cardTitle} font-mono`}>
                Alfaiataria & Calçados Selecionados
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className={`p-3.5 rounded border ${t.subtleBorder} space-y-2`}>
                  <div className={`h-32 rounded overflow-hidden border ${t.border} relative`}>
                    <img
                      src="/assets/editorial_fashion_male.jpg"
                      alt="Aramis Tênis Couro"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className={`text-[9px] ${t.accentText} uppercase font-bold block`}>Aramis Footwear</span>
                  <h4 className={`text-xs font-medium truncate ${t.cardTitle}`}>Tênis Couro Legítimo Urban</h4>
                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <span className={`font-bold ${t.cardTitle}`}>R$ 349,90</span>
                    <span className={`text-[10px] ${t.mutedText} line-through`}>R$ 499,90</span>
                  </div>
                </div>

                <div className={`p-3.5 rounded border ${t.subtleBorder} space-y-2`}>
                  <div className={`h-32 rounded overflow-hidden border ${t.border} relative`}>
                    <img
                      src="/assets/editorial_fragrance_male.jpg"
                      alt="Lattafa Asad"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[9px] text-[#d97706] uppercase font-bold block">Lattafa Dubai</span>
                  <h4 className={`text-xs font-medium truncate ${t.cardTitle}`}>Asad Elixir Eau de Parfum</h4>
                  <div className="flex justify-between items-center text-xs font-mono pt-1">
                    <span className={`font-bold ${t.cardTitle}`}>R$ 269,00</span>
                    <span className={`text-[10px] ${t.mutedText} line-through`}>R$ 380,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
