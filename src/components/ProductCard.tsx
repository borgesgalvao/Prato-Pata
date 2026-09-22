import React from 'react';
import { Product } from '../types';
import { Star, ArrowRight, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onTrackAffiliateClick?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onTrackAffiliateClick,
}) => {
  const getAudienceBadge = () => {
    switch (product.targetAudience) {
      case 'pet':
        return {
          label: 'Para Pets',
          bg: 'bg-[#E3EFE6] text-[#24572D] border-[#C2E0C8]',
          icon: '🐾',
        };
      case 'tutor':
        return {
          label: 'Cozinha',
          bg: 'bg-[#F9EDE4] text-[#914616] border-[#F2D4C0]',
          icon: '🍳',
        };
      case 'duo':
        return {
          label: 'Duo Tutor & Pet',
          bg: 'bg-[#EBF2F7] text-[#1E4D70] border-[#CCE0ED]',
          icon: '✨',
        };
    }
  };

  const badge = getAudienceBadge();

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-[#EBE4D8] hover:border-[#D0C5B4] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Image & Badges */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-[#F5F2EB] cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${badge.bg}`}>
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-[#C87941] text-white px-2 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}
        </div>

        {product.featured && (
          <div className="absolute top-3 right-3 bg-[#435B47] text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
            Destaque
          </div>
        )}

        {product.affiliateUrl && (
          <div className="absolute bottom-3 right-3 bg-[#FFE600] text-[#2D3277] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-[#E5CF00]">
            <span>⚡</span>
            <span>Mercado Livre</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1.5 text-xs text-[#6B655B]">
          <div className="flex items-center text-[#E5A93C]">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-bold text-[#2D2A26]">{product.rating.toFixed(1)}</span>
          <span className="text-[#8C8375]">({product.reviewsCount})</span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelectProduct(product)}
          className="font-serif-brand font-bold text-base text-[#2D2A26] line-clamp-2 leading-snug cursor-pointer hover:text-[#435B47] transition-colors mb-2"
        >
          {product.name}
        </h3>

        {/* Short description */}
        <p className="text-xs text-[#6B655B] line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.shortDescription}
        </p>

        {/* Pricing & Action */}
        <div className="pt-3 border-t border-[#F2ECE1] flex items-end justify-between gap-2 mt-auto">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-[#9E9588] line-through block leading-none mb-0.5">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="text-lg font-extrabold text-[#2D2A26] leading-none">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </div>
            <span className="text-[11px] text-[#8C8375] block mt-1">
              Preço de referência
            </span>
          </div>

          <button
            id={`view-details-btn-${product.id}`}
            onClick={() => {
              if (onTrackAffiliateClick && product.affiliateUrl) {
                onTrackAffiliateClick(product.id);
              }
              onSelectProduct(product);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-xs bg-[#435B47] hover:bg-[#344738] text-white active:scale-95"
            title="Ver detalhes do produto e onde comprar"
          >
            <span>Ver Produto</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
