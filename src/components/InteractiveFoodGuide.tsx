import React, { useState } from 'react';
import { FOOD_CHECK_DATABASE } from '../data/foodChecker';
import { FoodCheckItem } from '../types';
import { Search, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Filter, X } from 'lucide-react';

interface InteractiveFoodGuideProps {
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const InteractiveFoodGuide: React.FC<InteractiveFoodGuideProps> = ({
  searchQuery = '',
  onClearSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [safetyFilter, setSafetyFilter] = useState<'todos' | 'seguro' | 'proibido'>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Alimentos' },
    { id: 'vegetais', label: 'Vegetais & Legumes' },
    { id: 'frutas', label: 'Frutas' },
    { id: 'carnes-proteinas', label: 'Carnes & Proteínas' },
    { id: 'temperos-ervas', label: 'Temperos & Doces' },
  ];

  const filteredFoods = FOOD_CHECK_DATABASE.filter((item) => {
    if (selectedCategory !== 'todos' && item.category !== selectedCategory) {
      return false;
    }
    if (safetyFilter !== 'todos') {
      if (safetyFilter === 'seguro' && (item.safeForDogs === 'proibido' || item.safeForCats === 'proibido')) {
        return false;
      }
      if (safetyFilter === 'proibido' && item.safeForDogs !== 'proibido' && item.safeForCats !== 'proibido') {
        return false;
      }
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchPet = item.petNotes.toLowerCase().includes(q);
      const matchHuman = item.humanBenefits.toLowerCase().includes(q);
      const matchPrep = item.preparationTip.toLowerCase().includes(q);
      if (!matchName && !matchPet && !matchHuman && !matchPrep) return false;
    }
    return true;
  });

  const getSafetyBadge = (status: 'seguro' | 'com-moderacao' | 'proibido') => {
    switch (status) {
      case 'seguro':
        return {
          label: 'Seguro',
          bg: 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'com-moderacao':
        return {
          label: 'Com Moderação',
          bg: 'bg-[#FFF6E5] text-[#916216] border-[#FBE3B5]',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
      case 'proibido':
        return {
          label: 'Tóxico / Proibido',
          bg: 'bg-[#FDEBEB] text-[#A62424] border-[#F7C6C6]',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <section id="interactive-food-guide-section" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-[#FAF7F0] text-[#C87941] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border border-[#EBE4D8]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ferramenta Interativa Prato & Pata</span>
        </div>
        <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#2D2A26] mb-3">
          Guia Interativo: Pode ou Não Pode para Pets?
        </h1>
        <p className="text-xs sm:text-sm text-[#6B655B] leading-relaxed">
          Tem um alimento na sua geladeira e quer saber se pode compartilhar com seu cão ou gato? Pesquise abaixo e veja a compatibilidade veterinária e o benefício para a sua saúde de tutor!
        </p>
      </div>

      {/* Interactive Search & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#EBE4D8] shadow-xs mb-8 space-y-4">
        {searchQuery.trim() !== '' && (
          <div className="flex items-center justify-between bg-[#EFEAE1] border border-[#E0D8C8] rounded-2xl px-4 py-2.5 text-xs text-[#2D2A26]">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#435B47]" />
              <span>
                Filtrando alimentos por: <strong className="text-[#435B47]">"{searchQuery}"</strong> ({filteredFoods.length} encontrados)
              </span>
            </div>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="flex items-center gap-1 text-[#877E71] hover:text-[#2D2A26] font-bold text-xs bg-white px-2.5 py-1 rounded-full border border-[#D5CDBD] shadow-2xs hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpar filtro</span>
              </button>
            )}
          </div>
        )}

        {/* Filter Categories */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#435B47] text-white'
                    : 'bg-[#FAF7F0] text-[#6B655B] hover:text-[#2D2A26] border border-[#EBE4D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Safety status quick filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#8C8375] font-medium mr-1">Status Pet:</span>
            <button
              onClick={() => setSafetyFilter('todos')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                safetyFilter === 'todos' ? 'bg-[#2D2A26] text-white' : 'text-[#6B655B]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSafetyFilter('seguro')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                safetyFilter === 'seguro' ? 'bg-[#24572D] text-white' : 'text-[#24572D]'
              }`}
            >
              Seguros
            </button>
            <button
              onClick={() => setSafetyFilter('proibido')}
              className={`px-2.5 py-1 rounded-lg font-bold ${
                safetyFilter === 'proibido' ? 'bg-[#A62424] text-white' : 'text-[#A62424]'
              }`}
            >
              Proibidos
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food) => {
          const dogBadge = getSafetyBadge(food.safeForDogs);
          const catBadge = getSafetyBadge(food.safeForCats);

          return (
            <div
              key={food.id}
              id={`food-card-${food.id}`}
              className="bg-white rounded-3xl border border-[#EBE4D8] p-5 shadow-xs flex flex-col justify-between hover:border-[#D5CDBD] transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-serif-brand font-bold text-lg text-[#2D2A26]">
                    {food.name}
                  </h3>
                  <span className="text-[11px] text-[#8C8375] capitalize bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-[#EBE4D8]">
                    {food.category.replace('-', ' ')}
                  </span>
                </div>

                {/* Badges for Dogs & Cats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className={`p-2 rounded-xl border text-center ${dogBadge.bg}`}>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mb-0.5">
                      🐶 Para Cães
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      {dogBadge.icon}
                      <span>{dogBadge.label}</span>
                    </div>
                  </div>

                  <div className={`p-2 rounded-xl border text-center ${catBadge.bg}`}>
                    <div className="text-[10px] uppercase font-extrabold tracking-wider mb-0.5">
                      🐱 Para Gatos
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold">
                      {catBadge.icon}
                      <span>{catBadge.label}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 text-xs text-[#544F46]">
                  <div>
                    <strong className="text-[#2D2A26] block font-bold mb-0.5">
                      🍳 Para a Sua Saúde (Tutor):
                    </strong>
                    <p className="text-[#6B655B] leading-relaxed">
                      {food.humanBenefits}
                    </p>
                  </div>

                  <div>
                    <strong className="text-[#2D2A26] block font-bold mb-0.5">
                      🐾 Orientações para Pets:
                    </strong>
                    <p className="text-[#6B655B] leading-relaxed">
                      {food.petNotes}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preparation tip callout */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE1] bg-[#FAF7F0] -mx-5 -mb-5 p-4 rounded-b-3xl text-[11px] text-[#435B47]">
                <strong>Dica de Preparo:</strong> {food.preparationTip}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
