import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductCategory, TargetAudience } from '../types';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Search, Check, RefreshCw } from 'lucide-react';

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
  const [headerHeight, setHeaderHeight] = useState<number>(120);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos os Itens', icon: '🌟' },
    { id: 'pet-caes', label: 'Coisinhas pro cão', icon: '🐕' },
    { id: 'pet-gatos', label: 'Coisinhas pro gato', icon: '🐈' },
    { id: 'cozinha-saudavel', label: 'Cozinha', icon: '🍳' },
    { id: 'snacks-naturais', label: 'Comidas', icon: '🥩' },
    { id: 'utensilios-ecologicos', label: 'Coisas', icon: '🥣' },
    { id: 'kits-duo', label: 'Kits Duo Tutor & Pet', icon: '🎁' },
  ];

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
      {/* Sticky Header with Target Audience, Categories, and Search/Filters Toolbar */}
      <div
        id="shop-fixed-header"
        style={{ top: `${headerHeight}px` }}
        className="sticky z-20 bg-[#FBF9F5]/95 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pt-3 pb-3 mb-6 border-b border-[#EBE4D8] transition-all shadow-xs"
      >
        {/* Target Audience Switcher Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-[#2D2A26] leading-tight">
              Lojinha Prato & Pata
            </h2>
            <p className="text-[11px] text-[#6B655B]">
              Navegue por quem vai desfrutar da alimentação saudável hoje
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#EFEAE1] p-1 rounded-xl border border-[#E0D8C8] overflow-x-auto shrink-0">
            <button
              id="filter-audience-todos"
              onClick={() => setSelectedAudience('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedAudience === 'todos'
                  ? 'bg-white text-[#2D2A26] shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              Todos os Públicos
            </button>
            <button
              id="filter-audience-pet"
              onClick={() => setSelectedAudience('pet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                selectedAudience === 'pet'
                  ? 'bg-[#24572D] text-white shadow-xs'
                  : 'text-[#6B655B] hover:text-[#2D2A26]'
              }`}
            >
              <span>🐾</span>
              <span>Para Pets</span>
            </button>
            <button
              id="filter-audience-tutor"
              onClick={() => setSelectedAudience('tutor')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
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
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
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

        {/* Category Horizontal Scrolling List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-[#435B47] text-white border-[#435B47] shadow-xs'
                  : 'bg-white text-[#544F46] border-[#EBE4D8] hover:border-[#D5CDBD] hover:bg-[#FAF7F0]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Toolbar: Search input, Price Slider & Sort */}
        <div className="bg-white/95 p-2.5 sm:p-3 rounded-xl border border-[#EBE4D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search inside shop */}
          <div className="relative flex-1 max-w-md">
            <input
              id="shop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por ingrediente, comedouro, marmita..."
              className="w-full bg-[#FAF7F0] border border-[#E0D8C8] rounded-xl pl-8 pr-14 py-1.5 text-xs text-[#2D2A26] placeholder-[#877E71] focus:outline-none focus:ring-2 focus:ring-[#435B47] focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-[#877E71] absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#877E71] hover:text-[#2D2A26] font-semibold"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Controls: Max price & Sorting */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#6B655B] font-medium text-[11px]">Preço até:</span>
              <input
                id="shop-price-slider"
                type="range"
                min="30"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 accent-[#435B47] cursor-pointer"
              />
              <span className="font-bold text-[#2D2A26] min-w-[50px] text-xs">
                R$ {maxPrice}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#6B655B] font-medium text-[11px]">Ordenar:</span>
              <select
                id="shop-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF7F0] border border-[#E0D8C8] rounded-lg px-2 py-1 text-xs text-[#2D2A26] font-semibold focus:outline-none focus:ring-2 focus:ring-[#435B47]"
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
            className="flex items-center gap-1 text-[#C87941] hover:underline font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
