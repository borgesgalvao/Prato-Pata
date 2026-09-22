import React, { useState } from 'react';
import { BlogPost, BlogComment } from '../types';
import { X, Heart, MessageCircle, Clock, Share2, Send, Sparkles, Check, ThumbsUp } from 'lucide-react';

interface ArticleModalProps {
  article: BlogPost | null;
  onClose: () => void;
  onAddComment: (articleId: string, comment: Omit<BlogComment, 'id' | 'likes'>) => void;
  onReact: (articleId: string, reactionType: 'likes' | 'pawReactions' | 'usefulReactions') => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onAddComment,
  onReact,
}) => {
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentPet, setCommentPet] = useState('');
  const [commentText, setCommentText] = useState('');
  const [reactedTypes, setReactedTypes] = useState<{ [key: string]: boolean }>({});
  const [shareCopied, setShareCopied] = useState(false);

  if (!article) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    onAddComment(article.id, {
      author: commentAuthor.trim(),
      petName: commentPet.trim() || undefined,
      date: 'Agora mesmo',
      content: commentText.trim(),
    });

    setCommentText('');
  };

  const handleReactionClick = (type: 'likes' | 'pawReactions' | 'usefulReactions') => {
    if (reactedTypes[type]) return;
    onReact(article.id, type);
    setReactedTypes(prev => ({ ...prev, [type]: true }));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="article-modal-container"
        className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-[#EBE4D8] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs px-6 py-4 border-b border-[#EBE4D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#C87941] uppercase tracking-wider bg-[#FAF7F0] px-3 py-1 rounded-full border border-[#EBE4D8]">
              {article.category.replace('-', ' ')}
            </span>
            <span className="text-xs text-[#8C8375] hidden sm:inline flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.readTimeMinutes} min de leitura
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#FAF7F0] text-[#544F46] border border-[#EBE4D8] transition-colors text-xs font-semibold flex items-center gap-1"
              title="Compartilhar link"
            >
              {shareCopied ? <Check className="w-3.5 h-3.5 text-[#24572D]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{shareCopied ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
            <button
              id="article-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#EBE4D8] flex items-center justify-center text-[#544F46] border border-[#E0D8C8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Reader */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
          {/* Article Header */}
          <div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D2A26] leading-tight mb-4">
              {article.title}
            </h1>

            {/* Author bar */}
            <div className="flex items-center gap-3 py-3 border-y border-[#F2ECE1]">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[#FAF7F0] shadow-xs"
              />
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#2D2A26]">
                  {article.author.name}
                </div>
                <div className="text-[11px] text-[#6B655B]">
                  {article.author.role} • Publicado em {article.publishedAt}
                </div>
              </div>
            </div>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl overflow-hidden aspect-video max-h-96 w-full bg-[#FAF7F0]">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Paragraphs */}
          <div className="space-y-4 text-[#3E3A35] text-sm sm:text-base leading-relaxed">
            {article.content.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-[#F2ECE1] flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#FAF7F0] text-[#544F46] px-3 py-1 rounded-full text-xs font-semibold border border-[#EBE4D8]">
                #{tag}
              </span>
            ))}
          </div>

          {/* Interactive Reactions Bar */}
          <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#EBE4D8] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#2D2A26] block">
                O que você achou desta matéria?
              </span>
              <span className="text-[11px] text-[#6B655B]">
                Reaja para ajudar a comunidade Prato & Pata
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="article-react-heart"
                onClick={() => handleReactionClick('likes')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  reactedTypes['likes']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>❤️</span>
                <span>{article.likes}</span>
              </button>

              <button
                id="article-react-paw"
                onClick={() => handleReactionClick('pawReactions')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  reactedTypes['pawReactions']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>🐾 Pata Amiga</span>
                <span>{article.pawReactions}</span>
              </button>

              <button
                id="article-react-useful"
                onClick={() => handleReactionClick('usefulReactions')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  reactedTypes['usefulReactions']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>💡 Muito Útil</span>
                <span>{article.usefulReactions}</span>
              </button>
            </div>
          </div>

          {/* Interactive Comments Section */}
          <div className="pt-6 border-t border-[#F2ECE1]">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-[#435B47]" />
              <h3 className="font-serif-brand font-bold text-lg text-[#2D2A26]">
                Comentários & Dúvidas dos Tutores ({article.comments.length})
              </h3>
            </div>

            {/* Comment composer */}
            <form onSubmit={handleCommentSubmit} className="bg-[#FAF7F0] p-4 rounded-2xl border border-[#EBE4D8] mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Seu nome completo *"
                  className="bg-white border border-[#D5CDBD] rounded-xl px-3 py-1.5 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
                />
                <input
                  type="text"
                  value={commentPet}
                  onChange={(e) => setCommentPet(e.target.value)}
                  placeholder="Nome do seu pet (ex: Nina - Shih Tzu)"
                  className="bg-white border border-[#D5CDBD] rounded-xl px-3 py-1.5 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
                />
              </div>

              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Compartilhe sua experiência, dúvida culinária ou relato sobre seu pet..."
                className="w-full bg-white border border-[#D5CDBD] rounded-xl p-3 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#435B47] hover:bg-[#344738] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Comentário</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {article.comments.map((comment) => (
                <div key={comment.id} className="p-4 rounded-2xl bg-white border border-[#EBE4D8]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2D2A26]">{comment.author}</span>
                      {comment.petName && (
                        <span className="text-[10px] bg-[#FDF4EE] text-[#C87941] px-2 py-0.5 rounded-full border border-[#F6DECE] font-medium">
                          🐾 {comment.petName}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8C8375]">{comment.date}</span>
                  </div>
                  <p className="text-xs text-[#544F46] leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
