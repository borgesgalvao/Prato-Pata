import React from 'react';
import { ShoppingBag, Utensils, Search, Heart, Sparkles, BookOpen } from 'lucide-react';
import headerLogoImg from '../assets/images/regenerated_image_1789517135446.png';

interface HeaderProps {
  activeTab: 'shop' | 'blog' | 'guide';
  setActiveTab: (tab: 'shop' | 'blog' | 'guide') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EBE4D8] transition-all">
      {/* Top Notification Bar */}
      <div className="bg-[#435B47] text-[#FAF7F0] px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E6C285]" />
        <span>🌿 Curadoria independente de nutrição e bem-estar para você e seu pet • Dicas, receitas e indicações selecionadas</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[88px] py-2 gap-4">
          {/* Brand Logo */}
          <button 
            id="header-logo-btn"
            onClick={() => setActiveTab('blog')} 
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-[85px] h-[75px] rounded-2xl bg-[#F4EFEA] border border-[#E7DFD4] flex items-center justify-center p-1 shadow-xs group-hover:border-[#C87941] group-hover:bg-[#FAF6F0] transition-all relative shrink-0 overflow-hidden">
              <img
                src={headerLogoImg}
                alt="Logotipo Prato & Pata"
                className="w-[75px] h-[65px] object-contain transition-transform group-hover:scale-105 duration-200"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-1.5 text-center text-[21px] leading-[24px]">
                <span className="font-serif-brand text-[21px] leading-[24px] font-bold tracking-tight text-[#2D2A26]">
                  Prato <span className="text-[#C87941] font-normal">&</span> Pata
                </span>
              </div>
              <p className="text-[15px] text-[#6B655B] font-medium leading-snug text-center w-[199.5px]">
                Nutrição e afeto pra quem divide o mesmo teto 🍲🐾
              </p>
            </div>
          </button>

          {/* Navigation Links: 1. Blog e Nutrição, 2. Pode ou Não Pode, 3. Loja Especializada */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F0ECE1]/70 p-1.5 rounded-full border border-[#E3DCCE]/60">
            <button
              id="nav-tab-blog"
              onClick={() => setActiveTab('blog')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'blog'
                  ? 'bg-[#435B47] text-white shadow-xs'
                  : 'text-[#544F46] hover:text-[#2D2A26] hover:bg-[#EAE4D6]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Blog & Nutrição</span>
            </button>

            <button
              id="nav-tab-guide"
              onClick={() => setActiveTab('guide')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'guide'
                  ? 'bg-[#435B47] text-white shadow-xs'
                  : 'text-[#544F46] hover:text-[#2D2A26] hover:bg-[#EAE4D6]'
              }`}
            >
              <span className="text-sm">🥕</span>
              <span>Pode ou Não Pode?</span>
            </button>

            <button
              id="nav-tab-shop"
              onClick={() => setActiveTab('shop')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'shop'
                  ? 'bg-[#435B47] text-white shadow-xs'
                  : 'text-[#544F46] hover:text-[#2D2A26] hover:bg-[#EAE4D6]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Lojinha</span>
            </button>
          </nav>

          {/* Search bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-44 sm:w-60">
              <input
                id="header-global-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar receitas, petiscos..."
                className="w-full bg-[#EFEAE1] border border-[#E0D8C8] rounded-full pl-8 pr-3 py-1.5 sm:py-2 text-xs text-[#2D2A26] placeholder-[#877E71] focus:outline-none focus:ring-2 focus:ring-[#435B47] focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-[#877E71] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#EBE4D8] gap-2">
          <button
            id="mobile-nav-tab-blog"
            onClick={() => setActiveTab('blog')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === 'blog' ? 'bg-[#435B47] text-white' : 'text-[#6B655B]'
            }`}
          >
            Blog & Nutrição
          </button>
          <button
            id="mobile-nav-tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === 'guide' ? 'bg-[#435B47] text-white' : 'text-[#6B655B]'
            }`}
          >
            Pode ou Não Pode?
          </button>
          <button
            id="mobile-nav-tab-shop"
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center ${
              activeTab === 'shop' ? 'bg-[#435B47] text-white' : 'text-[#6B655B]'
            }`}
          >
            Lojinha
          </button>
        </div>
      </div>
    </header>
  );
};
