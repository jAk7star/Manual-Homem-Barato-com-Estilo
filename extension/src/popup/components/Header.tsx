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
    <header className="bg-[#0e0f12] px-4 py-3 border-b border-[#22242b] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {canGoBack && onBack ? (
          <button
            onClick={onBack}
            className="p-1 rounded bg-[#14151a] text-[#71717a] hover:text-white transition-colors text-xs font-mono"
            title="Voltar"
          >
            ←
          </button>
        ) : null}

        <div
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-6 h-6 rounded bg-[#16181f] border border-[#c85a32]/60 flex items-center justify-center text-white font-mono font-bold text-xs">
            <span className="text-[#c85a32]">E</span>
          </div>
          <span className="text-xs font-bold tracking-[0.2em] text-white font-display uppercase">
            ELITE<span className="text-[#c85a32]">BOT</span>
          </span>
        </div>
      </div>

      <button
        onClick={handleOpenExpanded}
        className="text-[10px] font-mono text-[#a1a1aa] hover:text-[#c85a32] transition-colors flex items-center gap-1 font-medium cursor-pointer uppercase tracking-widest"
        title="Abrir análise completa em nova aba"
      >
        <span>Análise Completa</span>
        <span>→</span>
      </button>
    </header>
  );
};
