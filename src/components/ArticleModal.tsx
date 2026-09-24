import React, { useState, useEffect } from 'react';
import { BlogPost, BlogComment } from '../types';
import { 
  X, Heart, MessageCircle, Clock, Share2, Send, Check, 
  ThumbsUp, Loader2, Sparkles, CloudCheck 
} from 'lucide-react';
import { 
  subscribeToArticleComments, 
  addArticleComment, 
  likeArticleComment,
  subscribeToArticleReactions,
  incrementArticleReaction
} from '../lib/firebase';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);
  const [liveComments, setLiveComments] = useState<BlogComment[]>(article?.comments || []);
  const [liveReactions, setLiveReactions] = useState<{
    likes: number;
    pawReactions: number;
    usefulReactions: number;
  }>({
    likes: article?.likes || 0,
    pawReactions: article?.pawReactions || 0,
    usefulReactions: article?.usefulReactions || 0,
  });
  const [reactedTypes, setReactedTypes] = useState<{ [key: string]: boolean }>({});
  const [likedCommentIds, setLikedCommentIds] = useState<{ [key: string]: boolean }>({});
  const [shareCopied, setShareCopied] = useState(false);

  // Subscribe to real-time comments and reactions from Firebase Firestore
  useEffect(() => {
    if (!article) return;

    // Reset local reaction counts to article defaults
    setLiveReactions({
      likes: article.likes,
      pawReactions: article.pawReactions,
      usefulReactions: article.usefulReactions,
    });

    // 1. Subscribe to real-time comments
    const unsubscribeComments = subscribeToArticleComments(article.id, (firestoreComments) => {
      if (firestoreComments.length > 0) {
        // Merge Firestore comments with built-in initial comments avoiding duplicates
        const fsIds = new Set(firestoreComments.map((c) => c.id));
        const nonDuplicateInitial = (article.comments || []).filter(
          (c) => !fsIds.has(c.id) && !firestoreComments.some(fc => fc.content === c.content && fc.author === c.author)
        );
        setLiveComments([...firestoreComments, ...nonDuplicateInitial]);
      } else {
        setLiveComments(article.comments || []);
      }
    });

    // 2. Subscribe to real-time reactions
    const unsubscribeReactions = subscribeToArticleReactions(article.id, (reactions) => {
      setLiveReactions(prev => ({
        likes: Math.max(prev.likes, reactions.likes),
        pawReactions: Math.max(prev.pawReactions, reactions.pawReactions),
        usefulReactions: Math.max(prev.usefulReactions, reactions.usefulReactions),
      }));
    });

    return () => {
      unsubscribeComments();
      unsubscribeReactions();
    };
  }, [article?.id]);

  if (!article) return null;

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim() || isSubmitting) return;

    const newCommentData = {
      author: commentAuthor.trim(),
      petName: commentPet.trim() || undefined,
      date: 'Hoje',
      content: commentText.trim(),
    };

    setIsSubmitting(true);
    try {
      // 1. Save to cloud Firestore database (persists for all visitors)
      const firestoreDocId = await addArticleComment(article.id, newCommentData);

      // 2. Also notify parent App state for instant local update
      onAddComment(article.id, newCommentData);

      // Optimistically insert in local state
      setLiveComments(prev => [
        {
          id: firestoreDocId,
          ...newCommentData,
          likes: 0,
        },
        ...prev,
      ]);

      setCommentText('');
      setSubmitFeedback('Seu comentário foi salvo na nuvem e já está visível para todos!');
      setTimeout(() => setSubmitFeedback(null), 5000);
    } catch (err) {
      console.warn('Fallback local comment save:', err);
      onAddComment(article.id, newCommentData);
      setCommentText('');
      setSubmitFeedback('Comentário publicado com sucesso!');
      setTimeout(() => setSubmitFeedback(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactionClick = async (type: 'likes' | 'pawReactions' | 'usefulReactions') => {
    if (reactedTypes[type]) return;
    setReactedTypes(prev => ({ ...prev, [type]: true }));
    setLiveReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
    onReact(article.id, type);

    try {
      await incrementArticleReaction(article.id, type, liveReactions);
    } catch (e) {
      // Silent catch
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (likedCommentIds[commentId]) return;
    setLikedCommentIds(prev => ({ ...prev, [commentId]: true }));
    setLiveComments(prev =>
      prev.map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c)
    );

    try {
      await likeArticleComment(commentId);
    } catch (e) {}
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  reactedTypes['likes']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>❤️</span>
                <span>{liveReactions.likes}</span>
              </button>

              <button
                id="article-react-paw"
                onClick={() => handleReactionClick('pawReactions')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  reactedTypes['pawReactions']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>🐾 Pata Amiga</span>
                <span>{liveReactions.pawReactions}</span>
              </button>

              <button
                id="article-react-useful"
                onClick={() => handleReactionClick('usefulReactions')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                  reactedTypes['usefulReactions']
                    ? 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]'
                    : 'bg-white text-[#544F46] border-[#D5CDBD] hover:bg-[#EBE4D8]'
                }`}
              >
                <span>💡 Muito Útil</span>
                <span>{liveReactions.usefulReactions}</span>
              </button>
            </div>
          </div>

          {/* Interactive Comments Section */}
          <div className="pt-6 border-t border-[#F2ECE1]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#435B47]" />
                <h3 className="font-serif-brand font-bold text-lg text-[#2D2A26]">
                  Comentários & Dúvidas dos Tutores ({liveComments.length})
                </h3>
              </div>
              <span className="text-[11px] bg-[#E3EFE6] text-[#24572D] font-bold px-2.5 py-0.5 rounded-full border border-[#C2E0C8] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#24572D]" />
                Sincronizado na Nuvem
              </span>
            </div>

            {submitFeedback && (
              <div className="mb-4 bg-[#E3EFE6] border border-[#C2E0C8] text-[#24572D] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 text-[#24572D] shrink-0" />
                <span>{submitFeedback}</span>
              </div>
            )}

            {/* Comment composer */}
            <form onSubmit={handleCommentSubmit} className="bg-[#FAF7F0] p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] mb-6 space-y-3 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Seu nome completo *"
                  className="bg-white border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:outline-hidden"
                />
                <input
                  type="text"
                  value={commentPet}
                  onChange={(e) => setCommentPet(e.target.value)}
                  placeholder="Nome do seu pet (ex: Nina - Shih Tzu)"
                  className="bg-white border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:outline-hidden"
                />
              </div>

              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Compartilhe sua experiência, dúvida culinária ou relato sobre seu pet... Seu comentário ficará gravado e visível para todos os visitantes!"
                className="w-full bg-white border border-[#D5CDBD] rounded-xl p-3 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:outline-hidden resize-none"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#8C8375] hidden sm:inline">
                  Comentários públicos moderados pela comunidade Prato & Pata
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#435B47] hover:bg-[#344738] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Gravando na nuvem...' : 'Publicar Comentário'}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {liveComments.length === 0 ? (
                <div className="text-center py-8 px-4 bg-[#FAF7F0] rounded-2xl border border-dashed border-[#D5CDBD]">
                  <MessageCircle className="w-8 h-8 text-[#8C8375] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-[#544F46]">Ainda não há comentários nesta matéria.</p>
                  <p className="text-[11px] text-[#8C8375] mt-0.5">Seja o primeiro tutor a compartilhar uma dúvida ou experiência!</p>
                </div>
              ) : (
                liveComments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-2xl bg-white border border-[#EBE4D8] shadow-xs hover:border-[#D5CDBD] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-[#2D2A26]">{comment.author}</span>
                        {comment.petName && (
                          <span className="text-[10px] bg-[#FDF4EE] text-[#C87941] px-2 py-0.5 rounded-full border border-[#F6DECE] font-semibold">
                            🐾 {comment.petName}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8C8375] font-medium">{comment.date}</span>
                    </div>
                    <p className="text-xs text-[#544F46] leading-relaxed mb-2.5 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleLikeComment(comment.id)}
                        className={`text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                          likedCommentIds[comment.id]
                            ? 'bg-[#FDF4EE] text-[#C87941] border-[#F6DECE]'
                            : 'bg-[#FAF7F0] text-[#6B655B] border-[#E0D8C8] hover:bg-[#F2ECE1]'
                        }`}
                        title="Curtir este relato"
                      >
                        <Heart className={`w-3 h-3 ${likedCommentIds[comment.id] ? 'fill-[#C87941] text-[#C87941]' : 'text-[#8C8375]'}`} />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
