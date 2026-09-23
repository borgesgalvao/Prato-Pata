import React, { useState } from 'react';
import { BlogPost } from '../types';
import { Clock, ArrowRight, Sparkles, Search, X } from 'lucide-react';

interface BlogSectionProps {
  articles: BlogPost[];
  onOpenArticle: (article: BlogPost) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  articles,
  onOpenArticle,
  searchQuery = '',
  onClearSearch,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const categories = [
    { id: 'todos', label: 'Todos os Artigos', icon: '📖' },
    { id: 'nutricao-humana', label: 'Nutrição Humana & Fit', icon: '🥗' },
    { id: 'bem-estar-animal', label: 'Bem-Estar Animal', icon: '🐾' },
    { id: 'receitas-compartilhadas', label: 'Receitas Compartilhadas', icon: '🥕' },
    { id: 'saude-integrada', label: 'Saúde Integrada & Prevenção', icon: '🌿' },
  ];

  const filteredArticles = articles.filter((post) => {
    if (selectedCategory !== 'todos' && post.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt.toLowerCase().includes(q);
      const matchContent = post.content.toLowerCase().includes(q);
      const matchTags = post.tags.some(t => t.toLowerCase().includes(q));
      const matchAuthor = post.author.name.toLowerCase().includes(q) || post.author.role.toLowerCase().includes(q);
      if (!matchTitle && !matchExcerpt && !matchContent && !matchTags && !matchAuthor) return false;
    }
    return true;
  });

  const featured = articles[0];

  return (
    <section id="blog-main-section" className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Blog Intro */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-[#E3EFE6] text-[#24572D] px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 border border-[#C2E0C8]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Conteúdo Científico com Amor Familiar</span>
        </div>
        <h1 className="font-serif-brand text-3xl sm:text-4xl font-bold text-[#2D2A26] mb-3">
          Prato & Pata: Conexão Nutricional
        </h1>
        <p className="text-xs sm:text-sm text-[#6B655B] leading-relaxed">
          Artigos elaborados por nutricionistas clínicos e veterinários nutrólogos para ajudar você a cuidar da sua saúde e da longevidade do seu companheiro de quatro patas.
        </p>
      </div>

      {/* Hero Featured Article */}
      {featured && selectedCategory === 'todos' && !searchQuery && (
        <div 
          onClick={() => onOpenArticle(featured)}
          className="group cursor-pointer bg-white rounded-3xl border border-[#EBE4D8] overflow-hidden shadow-xs hover:shadow-md transition-all mb-[36px] flex flex-col lg:flex-row max-w-[1084px] mx-auto"
        >
          <div className="w-full lg:w-[600px] shrink-0 relative aspect-video lg:aspect-auto overflow-hidden bg-[#F5F2EB]">
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 bg-[#C87941] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Artigo em Destaque
            </span>
          </div>

          <div className="w-full lg:w-[484px] shrink-0 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-[#6B655B] mb-3">
                <span className="bg-[#FAF7F0] text-[#435B47] px-2.5 py-1 rounded-full font-bold border border-[#EBE4D8]">
                  Receitas Compartilhadas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8C8375]" /> {featured.readTimeMinutes} min de leitura
                </span>
              </div>

              <h2 className="font-serif-brand text-xl sm:text-2xl font-bold text-[#2D2A26] group-hover:text-[#435B47] transition-colors leading-snug mb-3">
                {featured.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#6B655B] leading-relaxed mb-4">
                {featured.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#F2ECE1] flex items-center justify-end">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C87941] group-hover:translate-x-1 transition-transform">
                <span>Ler Matéria</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Active Search Indicator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              id={`blog-category-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#435B47] text-white shadow-xs'
                  : 'bg-white text-[#544F46] border border-[#EBE4D8] hover:bg-[#FAF7F0]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {searchQuery.trim() !== '' && (
          <div className="flex items-center gap-2 bg-[#EFEAE1] px-3.5 py-1.5 rounded-full text-xs text-[#2D2A26] border border-[#E0D8C8] self-start sm:self-auto">
            <Search className="w-3.5 h-3.5 text-[#435B47]" />
            <span>
              Resultados para: <strong className="text-[#435B47]">"{searchQuery}"</strong> ({filteredArticles.length})
            </span>
            {onClearSearch && (
              <button
                type="button"
                onClick={onClearSearch}
                className="text-[#877E71] hover:text-[#2D2A26] text-xs font-bold ml-1 p-0.5 rounded-full hover:bg-[#E0D8C8] transition-colors cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Article Grid or Empty State */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EBE4D8] p-10 text-center max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#EBE4D8] flex items-center justify-center mx-auto mb-3 text-xl">
            🔍
          </div>
          <h3 className="font-serif-brand font-bold text-lg text-[#2D2A26] mb-1">
            Nenhum artigo encontrado
          </h3>
          <p className="text-xs text-[#6B655B] mb-4">
            Não encontramos matérias para <strong className="text-[#2D2A26]">"{searchQuery}"</strong> nesta categoria.
          </p>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="bg-[#435B47] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#344837] transition-colors cursor-pointer"
            >
              Limpar busca e ver todos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((post) => (
            <article
              key={post.id}
              id={`blog-card-${post.id}`}
              onClick={() => onOpenArticle(post)}
              className="group cursor-pointer bg-white rounded-2xl border border-[#EBE4D8] hover:border-[#D5CDBD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden bg-[#F5F2EB]">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 bg-[#FAF7F0]/90 backdrop-blur-xs text-[#435B47] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#EBE4D8]">
                  {post.category === 'nutricao-humana' ? 'Nutrição Humana' : post.category === 'bem-estar-animal' ? 'Bem-Estar Animal' : post.category === 'receitas-compartilhadas' ? 'Receitas Duo' : 'Saúde & Cuidados'}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[11px] text-[#8C8375] mb-2">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTimeMinutes} min
                  </span>
                </div>

                <h3 className="font-serif-brand font-bold text-base text-[#2D2A26] group-hover:text-[#435B47] transition-colors leading-snug line-clamp-2 mb-2">
                  {post.title}
                </h3>

                <p className="text-xs text-[#6B655B] line-clamp-2 leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {post.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-[#FAF7F0] text-[#6B655B] px-2 py-0.5 rounded-md border border-[#EBE4D8]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
