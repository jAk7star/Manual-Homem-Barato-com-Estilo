import React from 'react';

interface HeaderProps {
  onBack?: () => void;
  onGoHome?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onGoHome, canGoBack }) => {
  const handleOpenExpanded = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'OPEN_EXPANDED_VIEW' });
    } else {
      window.open(window.location.href + '?mode=expanded', '_blank');
    }
  };

  return (
    <header className="bg-[#101116] px-4 py-2.5 border-b border-[#22242b] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5">
        {canGoBack && onBack ? (
          <button
            onClick={onBack}
            className="p-1 rounded bg-[#1c1d24] text-[#a1a1aa] hover:text-white transition-colors"
            title="Voltar"
          >
            ←
          </button>
        ) : null}

        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded bg-[#16181f] border border-[#c85a32]/60 flex items-center justify-center text-white">
            <span className="font-mono text-xs font-bold text-[#c85a32]">E</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.2em] text-white font-mono">
              ELITE<span className="text-[#c85a32]">BOT</span>
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-[#71717a] -mt-0.5 uppercase">
              Side Panel
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleOpenExpanded}
          className="text-[10px] font-mono text-[#c85a32] hover:text-[#e4764d] transition-colors flex items-center gap-1 font-medium cursor-pointer"
          title="Abrir análise completa em nova aba"
        >
          <span>Análise Completa</span>
          <span>→</span>
        </button>
      </div>
    </header>
  );
};
