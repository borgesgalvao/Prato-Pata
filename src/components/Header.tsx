import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShoppingBag, Utensils, Search, Heart, Sparkles, BookOpen, X, ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import headerLogoImg from '../assets/images/regenerated_image_1789517135446.png';
import { BlogPost, Product, FoodCheckItem } from '../types';
import { FOOD_CHECK_DATABASE } from '../data/foodChecker';

interface HeaderProps {
  activeTab: 'shop' | 'blog' | 'guide';
  setActiveTab: (tab: 'shop' | 'blog' | 'guide') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  products?: Product[];
  articles?: BlogPost[];
  onSelectProduct?: (product: Product) => void;
  onSelectArticle?: (article: BlogPost) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  products = [],
  articles = [],
  onSelectProduct,
  onSelectArticle,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchSectionFilter, setSearchSectionFilter] = useState<'all' | 'blog' | 'guide' | 'shop'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live search matches across the whole site
  const { matchingArticles, matchingFoods, matchingProducts, totalMatches } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { matchingArticles: [], matchingFoods: [], matchingProducts: [], totalMatches: 0 };
    }

    // 1. Search in Blog Articles
    const matchedArts = articles.filter((post) => {
      const title = post.title.toLowerCase();
      const excerpt = post.excerpt.toLowerCase();
      const tags = post.tags.join(' ').toLowerCase();
      const content = Array.isArray(post.content) ? post.content.join(' ').toLowerCase() : '';
      const author = post.author?.name?.toLowerCase() || '';
      return title.includes(q) || excerpt.includes(q) || tags.includes(q) || content.includes(q) || author.includes(q);
    });

    // 2. Search in Food Checker Guide
    const matchedFoods = FOOD_CHECK_DATABASE.filter((item) => {
      const name = item.name.toLowerCase();
      const petNotes = item.petNotes.toLowerCase();
      const human = item.humanBenefits.toLowerCase();
      const prep = item.preparationTip.toLowerCase();
      const category = item.category.toLowerCase();
      return name.includes(q) || petNotes.includes(q) || human.includes(q) || prep.includes(q) || category.includes(q);
    });

    // 3. Search in Shop Products
    const matchedProds = products.filter((prod) => {
      const name = prod.name.toLowerCase();
      const desc = (prod.shortDescription + ' ' + (prod.fullDescription || '')).toLowerCase();
      const highlights = (prod.highlights || []).join(' ').toLowerCase();
      const category = prod.category.toLowerCase();
      const material = prod.specs?.materialOuComposicao?.toLowerCase() || '';
      const indicacao = prod.specs?.indicacao?.toLowerCase() || '';
      return name.includes(q) || desc.includes(q) || highlights.includes(q) || category.includes(q) || material.includes(q) || indicacao.includes(q);
    });

    const total = matchedArts.length + matchedFoods.length + matchedProds.length;
    return {
      matchingArticles: matchedArts,
      matchingFoods: matchedFoods,
      matchingProducts: matchedProds,
      totalMatches: total,
    };
  }, [searchQuery, articles, products]);

  const handleSelectArticleItem = (article: BlogPost) => {
    setActiveTab('blog');
    if (onSelectArticle) {
      onSelectArticle(article);
    }
    setIsDropdownOpen(false);
  };

  const handleSelectFoodItem = (food: FoodCheckItem) => {
    setActiveTab('guide');
    setSearchQuery(food.name);
    setIsDropdownOpen(false);
  };

  const handleSelectProductItem = (product: Product) => {
    setActiveTab('shop');
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsDropdownOpen(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const getSafetyBadgeInfo = (status: 'seguro' | 'com-moderacao' | 'proibido') => {
    switch (status) {
      case 'seguro':
        return { label: 'Seguro', color: 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]' };
      case 'com-moderacao':
        return { label: 'Com Moderação', color: 'bg-[#FFF6E5] text-[#916216] border-[#FBE3B5]' };
      case 'proibido':
        return { label: 'Proibido / Tóxico', color: 'bg-[#FDEBEB] text-[#A62424] border-[#F7C6C6]' };
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#EBE4D8] transition-all">
      {/* Top Notification Bar */}
      <div className="bg-[#435B47] text-[#FAF7F0] px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#E6C285]" />
        <span>🌿 Curadoria independente de nutrição e bem-estar para você e seu pet • Dicas, receitas e indicações selecionadas</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[96px] py-3 gap-4">
          {/* Brand Logo & Search Underneath */}
          <div className="flex flex-col items-start gap-2" ref={searchContainerRef}>
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

            {/* Global Search bar below the logo button */}
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              <input
                id="header-global-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Buscar em todo o site (receitas, petiscos, alimentos)..."
                className="w-full bg-[#EFEAE1] border border-[#E0D8C8] rounded-full pl-8 pr-8 py-1.5 sm:py-2 text-xs text-[#2D2A26] placeholder-[#877E71] focus:outline-none focus:ring-2 focus:ring-[#435B47] focus:bg-white transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 text-[#877E71] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#877E71] hover:text-[#2D2A26] rounded-full hover:bg-[#D5CDBD] transition-colors cursor-pointer"
                  title="Limpar pesquisa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* LIVE GLOBAL SEARCH DROPDOWN OVERLAY */}
              {isDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-[320px] sm:w-[460px] md:w-[520px] max-w-[90vw] bg-white rounded-2xl border border-[#D5CDBD] shadow-2xl z-50 overflow-hidden animate-fadeIn">
                  {/* Dropdown Header */}
                  <div className="p-3 bg-[#FAF7F0] border-b border-[#EBE4D8] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-[#435B47]" />
                      <span className="text-xs font-bold text-[#2D2A26]">
                        {totalMatches > 0
                          ? `${totalMatches} resultado${totalMatches > 1 ? 's' : ''} em todo o site`
                          : 'Nenhum resultado encontrado'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[#877E71] hover:text-[#2D2A26] p-1 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-[#EBE4D8] transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Fechar</span>
                    </button>
                  </div>

                  {/* Section Filter Pills */}
                  {totalMatches > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b border-[#F2ECE1] overflow-x-auto no-scrollbar text-xs">
                      <button
                        type="button"
                        onClick={() => setSearchSectionFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                          searchSectionFilter === 'all'
                            ? 'bg-[#435B47] text-white'
                            : 'bg-[#F2ECE1] text-[#6B655B] hover:text-[#2D2A26]'
                        }`}
                      >
                        Todos ({totalMatches})
                      </button>

                      {matchingArticles.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchSectionFilter('blog')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                            searchSectionFilter === 'blog'
                              ? 'bg-[#435B47] text-white'
                              : 'bg-[#F2ECE1] text-[#6B655B] hover:text-[#2D2A26]'
                          }`}
                        >
                          📖 Blog & Dicas ({matchingArticles.length})
                        </button>
                      )}

                      {matchingFoods.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchSectionFilter('guide')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                            searchSectionFilter === 'guide'
                              ? 'bg-[#435B47] text-white'
                              : 'bg-[#F2ECE1] text-[#6B655B] hover:text-[#2D2A26]'
                          }`}
                        >
                          🥕 Guia Pet ({matchingFoods.length})
                        </button>
                      )}

                      {matchingProducts.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSearchSectionFilter('shop')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                            searchSectionFilter === 'shop'
                              ? 'bg-[#435B47] text-white'
                              : 'bg-[#F2ECE1] text-[#6B655B] hover:text-[#2D2A26]'
                          }`}
                        >
                          🛍️ Lojinha ({matchingProducts.length})
                        </button>
                      )}
                    </div>
                  )}

                  {/* Results List */}
                  <div className="max-h-[340px] overflow-y-auto divide-y divide-[#F2ECE1] p-1.5">
                    {totalMatches === 0 ? (
                      <div className="p-6 text-center text-xs text-[#6B655B]">
                        <p className="font-semibold text-[#2D2A26] mb-1">
                          Nenhum conteúdo encontrado para "{searchQuery}"
                        </p>
                        <p className="text-[11px] text-[#877E71]">
                          Tente buscar por termos como <em>"cenoura"</em>, <em>"frango"</em>, <em>"abacate"</em>, <em>"comedouro"</em> ou <em>"potes"</em>.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* 1. Blog Articles */}
                        {(searchSectionFilter === 'all' || searchSectionFilter === 'blog') &&
                          matchingArticles.length > 0 && (
                            <div className="py-2">
                              <div className="px-2.5 py-1 text-[11px] font-bold text-[#8C8375] uppercase tracking-wider flex items-center justify-between">
                                <span>📖 Blog & Nutrição</span>
                                <span className="text-[10px] font-normal">{matchingArticles.length} matérias</span>
                              </div>
                              <div className="space-y-1">
                                {matchingArticles.slice(0, 4).map((art) => (
                                  <div
                                    key={art.id}
                                    onClick={() => handleSelectArticleItem(art)}
                                    className="p-2 rounded-xl hover:bg-[#FAF7F0] cursor-pointer transition-colors flex items-start gap-2.5 group"
                                  >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#EFEAE1] shrink-0 border border-[#E0D8C8]">
                                      <img
                                        src={art.coverImage}
                                        alt={art.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-bold text-[#2D2A26] group-hover:text-[#435B47] transition-colors line-clamp-1">
                                        {art.title}
                                      </h4>
                                      <p className="text-[11px] text-[#6B655B] line-clamp-1">
                                        {art.excerpt}
                                      </p>
                                      <span className="text-[10px] text-[#8C8375]">
                                        {art.publishedAt} • {art.readTimeMinutes} min de leitura
                                      </span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#C87941] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity self-center" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* 2. Food Guide */}
                        {(searchSectionFilter === 'all' || searchSectionFilter === 'guide') &&
                          matchingFoods.length > 0 && (
                            <div className="py-2">
                              <div className="px-2.5 py-1 text-[11px] font-bold text-[#8C8375] uppercase tracking-wider flex items-center justify-between">
                                <span>🥕 Guia Pode ou Não Pode?</span>
                                <span className="text-[10px] font-normal">{matchingFoods.length} alimentos</span>
                              </div>
                              <div className="space-y-1">
                                {matchingFoods.slice(0, 4).map((food) => {
                                  const badge = getSafetyBadgeInfo(food.safeForDogs);
                                  return (
                                    <div
                                      key={food.id}
                                      onClick={() => handleSelectFoodItem(food)}
                                      className="p-2 rounded-xl hover:bg-[#FAF7F0] cursor-pointer transition-colors flex items-start justify-between gap-2.5 group"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-xs font-bold text-[#2D2A26] group-hover:text-[#435B47] transition-colors">
                                            {food.name}
                                          </h4>
                                          <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                                          >
                                            {badge.label}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-[#6B655B] line-clamp-1 mt-0.5">
                                          {food.petNotes}
                                        </p>
                                      </div>
                                      <span className="text-[11px] font-bold text-[#435B47] shrink-0 self-center group-hover:underline">
                                        Ver no Guia →
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {/* 3. Shop Products */}
                        {(searchSectionFilter === 'all' || searchSectionFilter === 'shop') &&
                          matchingProducts.length > 0 && (
                            <div className="py-2">
                              <div className="px-2.5 py-1 text-[11px] font-bold text-[#8C8375] uppercase tracking-wider flex items-center justify-between">
                                <span>🛍️ Lojinha Prato & Pata</span>
                                <span className="text-[10px] font-normal">{matchingProducts.length} itens</span>
                              </div>
                              <div className="space-y-1">
                                {matchingProducts.slice(0, 4).map((prod) => (
                                  <div
                                    key={prod.id}
                                    onClick={() => handleSelectProductItem(prod)}
                                    className="p-2 rounded-xl hover:bg-[#FAF7F0] cursor-pointer transition-colors flex items-center gap-2.5 group"
                                  >
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#E0D8C8] p-1 flex items-center justify-center">
                                      <img
                                        src={prod.image}
                                        alt={prod.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-bold text-[#2D2A26] group-hover:text-[#435B47] transition-colors line-clamp-1">
                                        {prod.name}
                                      </h4>
                                      <p className="text-[11px] text-[#6B655B] line-clamp-1">
                                        {prod.shortDescription}
                                      </p>
                                      <span className="text-xs font-bold text-[#435B47]">
                                        R$ {prod.price.toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#C87941] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>

                  {/* Dropdown Footer Actions */}
                  {totalMatches > 0 && (
                    <div className="p-2.5 bg-[#FAF7F0] border-t border-[#EBE4D8] flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#6B655B]">
                        Navegar para a página:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('blog');
                            setIsDropdownOpen(false);
                          }}
                          className="bg-white border border-[#D5CDBD] hover:bg-[#EFEAE1] px-2 py-1 rounded-lg text-[11px] font-bold text-[#2D2A26] transition-colors cursor-pointer"
                        >
                          Ver no Blog
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('guide');
                            setIsDropdownOpen(false);
                          }}
                          className="bg-white border border-[#D5CDBD] hover:bg-[#EFEAE1] px-2 py-1 rounded-lg text-[11px] font-bold text-[#2D2A26] transition-colors cursor-pointer"
                        >
                          Ver no Guia
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('shop');
                            setIsDropdownOpen(false);
                          }}
                          className="bg-[#435B47] text-white hover:bg-[#344837] px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          Ver na Loja
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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

