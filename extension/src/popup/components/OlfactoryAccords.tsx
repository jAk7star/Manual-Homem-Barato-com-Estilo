import React from 'react';

interface OlfactoryAccordsProps {
  accords?: { name: string; color: string }[];
}

export const OlfactoryAccords: React.FC<OlfactoryAccordsProps> = ({ accords }) => {
  if (!accords || accords.length === 0) return null;

  return (
    <div className="bg-[#1A1C22] p-3 rounded-xl border border-[#282B34] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
          ACORDES PRINCIPAIS (FRAGRÂNCIA)
        </span>
        <span className="text-[10px] text-[#C85A32] font-semibold">
          Pirâmide Olfativa
        </span>
      </div>

      <div className="space-y-1.5">
        {accords.map((accord, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-[#E5E7EB]">
              <span>{accord.name}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#121316] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${100 - idx * 20}%`,
                  backgroundColor: accord.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
