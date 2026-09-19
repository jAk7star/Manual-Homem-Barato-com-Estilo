import React from 'react';

interface PriceHistoryChartProps {
  currentPrice?: number;
  lowestPrice?: number;
  timeframe?: string;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  currentPrice = 149.9,
  lowestPrice = 139.9,
  timeframe = '180 Dias',
}) => {
  return (
    <div className="bg-[#14151a] border border-[#22242b] p-4 rounded-lg flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-tight">
            Variação Histórica de Preços ({timeframe})
          </h3>
          <p className="text-[10px] font-mono text-[#71717a] mt-0.5">
            Mínima Histórica: <span className="text-[#10b981] font-medium">R$ {lowestPrice.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-[#c85a32]">
            <span className="w-2 h-0.5 bg-[#c85a32]"></span> Perfumaria
          </span>
          <span className="flex items-center gap-1 text-[#71717a]">
            <span className="w-2 h-0.5 bg-[#71717a]"></span> Calçados
          </span>
        </div>
      </div>

      {/* SVG Canvas Chart */}
      <div className="w-full h-24 pt-1 flex flex-col justify-end">
        <svg className="w-full h-16 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 100">
          {/* Dashed Reference Lines */}
          <line x1="0" y1="20" x2="600" y2="20" stroke="#1f2129" strokeDasharray="2 4" />
          <line x1="0" y1="60" x2="600" y2="60" stroke="#1f2129" strokeDasharray="2 4" />

          {/* Secondary Muted Trend Line */}
          <path
            d="M 0,70 Q 75,50 150,65 T 300,45 T 450,80 T 600,25"
            fill="none"
            stroke="#71717a"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Primary Terracotta Precision Line */}
          <path
            d="M 0,85 Q 100,75 200,40 T 400,60 T 600,15"
            fill="none"
            stroke="#c85a32"
            strokeWidth="2"
          />

          {/* Markers */}
          <circle cx="200" cy="40" fill="#c85a32" r="3" />
          <circle cx="600" cy="15" fill="#10b981" r="3.5" />
        </svg>

        <div className="flex justify-between text-[9px] font-mono text-[#52525b] pt-2 border-t border-[#22242b]">
          <span>OUT 24</span>
          <span>NOV 24</span>
          <span>DEZ 24</span>
          <span>FEV 25</span>
          <span className="text-[#10b981] font-semibold">HOJE (R$ {currentPrice.toFixed(2)})</span>
        </div>
      </div>
    </div>
  );
};
