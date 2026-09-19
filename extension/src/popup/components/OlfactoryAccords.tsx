import React from 'react';

export interface AccordItem {
  name: string;
  color?: string;
  percentage?: number;
}

interface OlfactoryAccordsProps {
  accords?: AccordItem[];
  score?: number;
}

export const OlfactoryAccords: React.FC<OlfactoryAccordsProps> = ({
  accords = [
    { name: 'Amadeirado Nobre', percentage: 95, color: '#c85a32' },
    { name: 'Especiado Quente', percentage: 78, color: '#d97706' },
    { name: 'Couro & Tabaco', percentage: 64, color: '#71717a' },
  ],
  score = 9.4,
}) => {
  if (!accords || accords.length === 0) return null;

  return (
    <div className="bg-[#14151a] p-3.5 rounded-lg border border-[#22242b] space-y-2.5">
      <div className="flex justify-between items-center text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
        <span>Acordes Principais (Perfumes)</span>
        <span className="text-[#d97706] font-semibold">Score {score}</span>
      </div>

      <div className="space-y-2">
        {accords.map((accord, idx) => {
          const pct = accord.percentage ?? (100 - idx * 20);

          return (
            <div key={idx}>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#d4d4d8] font-medium">{accord.name}</span>
                <span className="text-[#71717a]">{pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1c1d24] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: accord.color || '#c85a32',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
