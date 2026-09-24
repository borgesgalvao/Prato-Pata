import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory, TargetAudience } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Search, Check, RefreshCw, X } from 'lucide-react';

interface ShopSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTrackAffiliateClick?: (productId: string) => void;
  onOpenAffiliateAdmin?: () => void;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  products,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  onTrackAffiliateClick,
  onOpenAffiliateAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');
  const [maxPrice, setMaxPrice] = useState<number>(500);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos os Itens', icon: '🌟' },
    { id: 'snacks-naturais', label: 'Snacks Naturais', icon: '🥩' },
    { id: 'suplementos', label: 'Suplementos', icon: '💊' },
    { id: 'higiene', label: 'Higiene & Cuidados', icon: '🧼' },
    { id: 'pet-caes', label: 'Cães & Acessórios', icon: '🐕' },
    { id: 'pet-gatos', label: 'Gatos & Bem-Estar', icon: '🐈' },
    { id: 'cozinha-saudavel', label: 'Cozinha Saudável', icon: '🍳' },
    { id: 'utensilios-ecologicos', label: 'Comedouros & Potes', icon: '🥣' },
    { id: 'kits-duo', label: 'Kits Duo Tutor & Pet', icon: '🎁' },
  ];

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { todos: 0 };
    products.forEach((p) => {
      if (!p.affiliateUrl || p.affiliateUrl.trim() === '') return;
      counts.todos = (counts.todos || 0) + 1;
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const handleSelectCategory = (catId: ProductCategory) => {
    setSelectedCategory(catId);
    // If the category has items belonging to another audience filter currently selected,
    // harmonize by setting selectedAudience to 'todos' so products immediately show
    if (catId !== 'todos' && selectedAudience !== 'todos') {
      const match = products.some(
        (p) => p.category === catId && p.targetAudience === selectedAudience
      );
      if (!match) {
        setSelectedAudience('todos');
      }
    }
  };

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Eliminar produtos sem link ativo no Mercado Livre
      if (!product.affiliateUrl || product.affiliateUrl.trim() === '') {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'todos' && product.category !== selectedCategory) {
        return false;
      }
      // Audience filter
      if (selectedAudience !== 'todos' && product.targetAudience !== selectedAudience) {
        return false;
      }
      // Max price
      if (product.price > maxPrice) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.shortDescription.toLowerCase().includes(query);
        const matchHighlights = product.highlights.some(h => h.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchHighlights) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, selectedAudience, maxPrice, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('todos');
    setSelectedAudience('todos');
    setMaxPrice(500);
    setSearchQuery('');
    setSortBy('relevance');
  };

  return (
    <section id="shop-main-section" className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Shop Header with Target Audience, Categories, and Search/Filters Toolbar (Scrolls naturally with content on mobile) */}
      <div
        id="shop-fixed-header"
        className="relative w-full bg-[#FBF9F5]/95 backdrop-blur-md -mx-4 px-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-2.5 sm:py-3.5 mb-3 sm:mb-6 border-b border-[#EBE4D8] transition-all shadow-xs"
      >
        {/* Target Audience Switcher Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-brand text-base sm:text-2xl font-bold text-[#2D2A26] leading-tight">
              Lojinha Prato & Pata
            </h2>
            <p className="text-[11px] text-[#6B655B] hidden sm:block">
              Navegue por quem vai desfrutar da alimentação saudável hoje
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#EFEAE1] p-0.5 sm:p-1 rounded-xl border border-[#E0D8C8] overflow-x-auto no-scrollbar shrink-0">
            <button
              id="filter-audience-todos"
              onClick={() => setSelectedAudience('todos')}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedAudience === 'todos'
                  ? 'bg-white text-[#2D2A26] shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              Todos
            </button>
            <button
              id="filter-audience-pet"
              onClick={() => setSelectedAudience('pet')}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedAudience === 'pet'
                  ? 'bg-[#24572D] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              <span>🐾</span>
              <span>Pets</span>
            </button>
            <button
              id="filter-audience-tutor"
              onClick={() => setSelectedAudience('tutor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedAudience === 'tutor'
                  ? 'bg-[#C87941] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              <span>🍳</span>
              <span>Cozinha</span>
            </button>
            <button
              id="filter-audience-duo"
              onClick={() => setSelectedAudience('duo')}
              className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                selectedAudience === 'duo'
                  ? 'bg-[#1E4D70] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              <span>✨</span>
              <span>Kits Duplos</span>
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="mb-2 sm:mb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5 px-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B655B] flex items-center gap-1">
              <span>Filtrar por Categoria:</span>
            </span>
            {selectedCategory !== 'todos' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className="text-[11px] text-[#C87941] hover:underline font-bold cursor-pointer"
              >
                Ver todas as categorias
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-1.5 no-scrollbar scroll-smooth">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              return (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.id}`}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border transition-all duration-200 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#435B47] text-white border-[#435B47] shadow-xs scale-[1.02]'
                      : 'bg-white text-[#454037] border-[#E2DAD0] hover:border-[#C8BFB2] hover:bg-[#FAF7F0] active:scale-95'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F2ECE1] text-[#787062]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Active Search Indicator, Price Slider & Sort */}
        <div className="bg-white/95 px-2.5 py-1.5 sm:p-3 rounded-xl border border-[#EBE4D8] shadow-xs flex flex-wrap items-center justify-between gap-2">
          {/* Active search filter status */}
          {searchQuery ? (
            <div className="inline-flex items-center gap-1.5 bg-[#EFEAE1] border border-[#E0D8C8] px-2.5 py-1 rounded-full text-[11px] text-[#2D2A26]">
              <Search className="w-3 h-3 text-[#435B47]" />
              <span className="line-clamp-1 max-w-[140px] sm:max-w-none">
                Filtrando: <strong className="text-[#435B47]">"{searchQuery}"</strong> ({filteredProducts.length})
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#877E71] hover:text-[#2D2A26] font-bold text-xs p-0.5 rounded-full hover:bg-[#E0D8C8] transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-[#877E71] font-medium hidden sm:inline">
              Filtrar por valor e relevância:
            </span>
          )}

          {/* Controls: Max price & Sorting in one compact line */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs ml-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B655B] font-medium text-[11px] whitespace-nowrap">Até:</span>
              <input
                id="shop-price-slider"
                type="range"
                min="30"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-16 sm:w-20 accent-[#435B47] cursor-pointer"
              />
              <span className="font-bold text-[#2D2A26] text-[11px] whitespace-nowrap min-w-[46px]">
                R$ {maxPrice}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[#6B655B] font-medium text-[11px] hidden sm:inline">Ordenar:</span>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-lg px-2 py-1 text-[11px] sm:text-xs text-[#2D2A26] font-semibold focus:outline-none focus:ring-1 focus:ring-[#435B47] cursor-pointer"
              >
                <option value="relevance">Destaques</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhor Avaliados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Results Counter & Reset */}
      <div className="flex items-center justify-between text-xs text-[#6B655B] mb-4 px-1">
        <span>
          Mostrando <strong>{filteredProducts.length}</strong> produtos selecionados
        </span>
        {(selectedCategory !== 'todos' || selectedAudience !== 'todos' || searchQuery || maxPrice < 500) && (
          <button
            id="shop-reset-filters-btn"
            onClick={resetFilters}
            className="flex items-center gap-1 text-[#C87941] hover:underline font-bold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      {/* Products Grid - 2 columns on mobile, 3 on md, 4 on lg */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onTrackAffiliateClick={onTrackAffiliateClick}
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty Catalog State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#EBE4D8] my-4">
          <div className="w-16 h-16 bg-[#FFFDE6] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl border border-[#FBEB98]">
            🛒
          </div>
          <h3 className="font-serif-brand text-xl font-bold text-[#2D2A26] mb-2">
            Nenhum produto cadastrado no momento
          </h3>
          <p className="text-xs sm:text-sm text-[#6B655B] max-w-md mx-auto mb-6">
            Os itens de exemplo foram eliminados com sucesso. Novos produtos com curadoria e link de afiliado ativo do Mercado Livre podem ser adicionados a qualquer momento.
          </p>
          {onOpenAffiliateAdmin && (
            <button
              id="empty-shop-add-btn"
              onClick={onOpenAffiliateAdmin}
              className="bg-[#24572D] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#1b4322] transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Cadastrar Novos Produtos no Painel</span>
            </button>
          )}
        </div>
      ) : (
        /* Filtered Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#EBE4D8] my-4">
          <div className="w-16 h-16 bg-[#FAF7F0] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🥣
          </div>
          <h3 className="font-serif-brand text-xl font-bold text-[#2D2A26] mb-2">
            Nenhum produto encontrado com esses filtros
          </h3>
          <p className="text-xs sm:text-sm text-[#6B655B] max-w-md mx-auto mb-6">
            Tente ajustar o termo de pesquisa, aumentar a faixa de preço ou alternar as categorias de tutor e pet.
          </p>
          <button
            id="empty-shop-reset-btn"
            onClick={resetFilters}
            className="bg-[#435B47] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#344738] transition-colors shadow-xs"
          >
            Ver todos os produtos
          </button>
        </div>
      )}
    </section>
  );
};
