import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Check, RotateCcw, Eye, Sparkles, HelpCircle, X } from 'lucide-react';

export const LiveTextEditor: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pratoepata_edit_mode') === 'true';
    }
    return false;
  });
  const [showHelper, setShowHelper] = useState<boolean>(true);
  const [hasSavedNotice, setHasSavedNotice] = useState<boolean>(false);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);

  // Apply or remove document.designMode and helper styles
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (isEditing) {
      document.designMode = 'on';
      localStorage.setItem('pratoepata_edit_mode', 'true');

      // Inject custom editing visual cues so the user easily sees what's editable
      if (!styleTagRef.current) {
        const style = document.createElement('style');
        style.id = 'live-text-editor-styles';
        style.innerHTML = `
          /* Visual highlight for editable text elements */
          h1, h2, h3, h4, h5, h6, p, span, a, button, label, li, blockquote {
            transition: outline 0.15s ease, background-color 0.15s ease;
          }
          h1:hover, h2:hover, h3:hover, h4:hover, p:hover, span:hover, label:hover, li:hover {
            outline: 1px dashed rgba(200, 121, 65, 0.6) !important;
            outline-offset: 2px;
            cursor: text !important;
          }
          h1:focus, h2:focus, h3:focus, h4:focus, p:focus, span:focus, label:focus, li:focus {
            outline: 2px solid #435B47 !important;
            outline-offset: 3px;
            background-color: rgba(227, 239, 230, 0.35) !important;
            border-radius: 4px;
          }
        `;
        document.head.appendChild(style);
        styleTagRef.current = style;
      }
    } else {
      document.designMode = 'off';
      localStorage.setItem('pratoepata_edit_mode', 'false');

      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    }

    return () => {
      if (styleTagRef.current) {
        styleTagRef.current.remove();
        styleTagRef.current = null;
      }
    };
  }, [isEditing]);

  // Keyboard shortcut: Ctrl+E or Cmd+E to toggle editing mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEditing((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveNotice = () => {
    setHasSavedNotice(true);
    setTimeout(() => setHasSavedNotice(false), 2500);
  };

  const handleReload = () => {
    if (window.confirm('Deseja recarregar a página para restaurar os textos originais do site?')) {
      window.location.reload();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2.5 font-sans">
      {/* Active Mode Floating Banner */}
      {isEditing && (
        <div className="bg-[#2D2A26] text-[#FAF7F0] rounded-2xl shadow-xl border border-[#435B47]/40 p-3.5 sm:p-4 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4E8B5B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
              </span>
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Modo Edição de Texto Ativo
              </span>
            </div>
            <button
              onClick={() => setShowHelper(false)}
              className="text-[#A39B8E] hover:text-white transition-colors"
              title="Minimizar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {showHelper && (
            <p className="text-[12px] text-[#D8D1C4] leading-relaxed mb-3">
              Clique ou selecione qualquer título, parágrafo, botão ou legenda na tela para editar diretamente o conteúdo.
            </p>
          )}

          <div className="flex items-center gap-2 pt-1 border-t border-[#443F38]">
            <button
              id="save-text-changes-btn"
              onClick={handleSaveNotice}
              className="px-2.5 py-1.5 rounded-lg bg-[#435B47] hover:bg-[#344737] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5 text-[#A1D9AB]" />
              <span>{hasSavedNotice ? 'Texto Salvo na Tela!' : 'Concluir Edição'}</span>
            </button>

            <button
              id="restore-original-text-btn"
              onClick={handleReload}
              className="px-2.5 py-1.5 rounded-lg bg-[#3A352F] hover:bg-[#4E4840] text-[#D8D1C4] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Restaurar textos padrão recarregando a página"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar</span>
            </button>

            <button
              id="exit-edit-mode-btn"
              onClick={() => setIsEditing(false)}
              className="ml-auto px-2 py-1 text-xs text-[#C87941] hover:text-[#E08D52] font-semibold underline underline-offset-2"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Main Toggle Button */}
      <button
        id="toggle-live-text-editor-btn"
        onClick={() => setIsEditing((prev) => !prev)}
        className={`px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-bold transition-all transform active:scale-95 border ${
          isEditing
            ? 'bg-[#C87941] text-white border-[#B56730] shadow-[#C87941]/25 hover:bg-[#B56730]'
            : 'bg-white text-[#2D2A26] border-[#D5CDBD] hover:border-[#435B47] hover:bg-[#FAF7F0] shadow-md'
        }`}
        title="Ativar/Desativar edição manual de qualquer texto no site (Atalho: Ctrl+E)"
      >
        {isEditing ? (
          <>
            <Eye className="w-4 h-4 text-white animate-pulse" />
            <span>Desativar Edição de Texto</span>
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4 text-[#435B47]" />
            <span>Editar Textos do Site</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded-md bg-[#F2ECE1] text-[#6B655B] font-mono border border-[#E0D8C8]">
              Ctrl+E
            </span>
          </>
        )}
      </button>
    </div>
  );
};
