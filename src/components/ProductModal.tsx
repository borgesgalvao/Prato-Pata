import React, { useEffect } from 'react';
import { Product } from '../types';
import { Star, CheckCircle2, ExternalLink } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onTrackAffiliateClick?: (productId: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onTrackAffiliateClick,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn cursor-pointer"
      onClick={onClose}
    >
      <div 
        id="product-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EBE4D8] relative cursor-default"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image and Button Directly Below */}
          <div className="bg-[#F5F2EB] p-6 flex flex-col justify-between gap-5 border-b md:border-b-0 md:border-r border-[#EBE4D8]">
            <div className="relative aspect-square flex items-center justify-center overflow-hidden rounded-2xl bg-white border border-[#EBE4D8]">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover max-h-80 shadow-xs"
              />
            </div>

            {/* Recommendation Button directly below the image */}
            <div className="w-full">
              {product.affiliateUrl ? (
                <>
                  <a
                    id={`modal-recommendation-link-${product.id}`}
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (onTrackAffiliateClick) {
                        onTrackAffiliateClick(product.id);
                      }
                    }}
                    className="w-full py-3.5 px-5 bg-[#FFE600] hover:bg-[#F2DA00] text-[#2D3277] font-extrabold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs border border-[#E5CF00] active:scale-95 cursor-pointer"
                  >
                    <span>Ver no Mercado Livre</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[11px] text-[#8C8375] text-center mt-2.5 leading-tight">
                    Indicação Prato & Pata • Você será direcionado para o produto na plataforma parceira.
                  </p>
                </>
              ) : (
                <div className="py-3 px-4 bg-white/80 border border-[#EBE4D8] rounded-xl text-center text-xs font-medium text-[#6B655B]">
                  Produto selecionado e indicado pela curadoria independente Prato & Pata.
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C87941] bg-[#FDF4EE] px-2.5 py-1 rounded-full border border-[#F6DECE]">
                {product.targetAudience === 'pet' ? '🐾 Para Pet' : product.targetAudience === 'tutor' ? '🍳 Cozinha' : '✨ Duo Tutor & Pet'}
              </span>
              <div className="flex items-center gap-1 text-xs text-[#6B655B]">
                <Star className="w-3.5 h-3.5 fill-[#E5A93C] text-[#E5A93C]" />
                <span className="font-bold text-[#2D2A26]">{product.rating}</span>
                <span>({product.reviewsCount} avaliações)</span>
              </div>
            </div>

            <h2 className="font-serif-brand text-2xl font-bold text-[#2D2A26] mb-3 leading-snug">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mb-4 pb-4 border-b border-[#F2ECE1]">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#2D2A26]">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#9E9588] line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B655B] mt-0.5">
                Ou em até 3x de R$ {(product.price / 3).toFixed(2).replace('.', ',')} sem juros
              </p>
            </div>

            {/* Full description */}
            <div className="text-xs sm:text-sm text-[#544F46] leading-relaxed mb-5">
              {product.fullDescription}
            </div>

            {/* Highlights */}
            <div className="mb-6 bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#ECE5D8]">
              <h4 className="text-xs font-bold text-[#2D2A26] uppercase tracking-wider mb-2">
                Destaques Saudáveis
              </h4>
              <ul className="space-y-1.5 text-xs text-[#4E4940]">
                {product.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#435B47] shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specs */}
            <div className="text-[11px] text-[#6B655B] space-y-1">
              <p><strong>Composição/Material:</strong> {product.specs.materialOuComposicao}</p>
              <p><strong>Indicação:</strong> {product.specs.indicacao}</p>
              <p><strong>Cuidados:</strong> {product.specs.cuidados}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
