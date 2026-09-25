import React, { useEffect, useState } from 'react';
import { getVerifierEnabled, setVerifierEnabled } from '../../services/storage.ts';

interface HeaderProps {
  onBack?: () => void;
  onGoHome?: () => void;
  canGoBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onGoHome, canGoBack }) => {
  const [isVerifierEnabled, setIsVerifierEnabled] = useState<boolean>(true);

  useEffect(() => {
    getVerifierEnabled().then(setIsVerifierEnabled);
  }, []);

  const handleToggleVerifier = async () => {
    const nextState = !isVerifierEnabled;
    setIsVerifierEnabled(nextState);
    await setVerifierEnabled(nextState);
  };

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

      <div className="flex items-center gap-3">
        {/* Toggle Switch de Liga/Desliga do Verificador */}
        <button
          onClick={handleToggleVerifier}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all border cursor-pointer ${
            isVerifierEnabled
              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 hover:bg-[#10B981]/25'
              : 'bg-[#282B34] text-[#94A3B8] border-[#383B44] hover:bg-[#383B44]'
          }`}
          title={isVerifierEnabled ? 'Verificador Ativo (Clique para Desativar)' : 'Verificador Desativado (Clique para Ativar)'}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              isVerifierEnabled ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#64748B]'
            }`}
          />
          <span>{isVerifierEnabled ? 'LIGADO' : 'DESLIGADO'}</span>
        </button>

        <button
          onClick={handleOpenExpanded}
          className="text-[10px] font-mono text-[#a1a1aa] hover:text-[#c85a32] transition-colors flex items-center gap-1 font-medium cursor-pointer uppercase tracking-widest"
          title="Abrir análise completa em nova aba"
        >
          <span>Painel</span>
          <span>→</span>
        </button>
      </div>
    </header>
  );
};

