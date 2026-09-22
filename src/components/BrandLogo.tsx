import React from 'react';
import brandLogoImg from '../assets/images/regenerated_image_1789517135446.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  // Dimensions mapping
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Logo Container with the exact Prato & Pata official logo */}
      <div
        className={`${sizeMap[size]} rounded-2xl bg-[#F4EFEA] border border-[#E7DFD4] flex items-center justify-center p-1.5 shadow-xs group-hover:border-[#C87941] group-hover:bg-[#FAF6F0] transition-all relative shrink-0 overflow-hidden`}
        title="Prato & Pata - Logotipo Oficial"
      >
        <img
          src={brandLogoImg}
          alt="Prato & Pata - Logotipo Oficial"
          className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-200"
        />
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif-brand text-2xl font-bold tracking-tight text-[#2D2A26]">
              Prato <span className="text-[#C87941] font-normal">&</span> Pata
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-[#6B655B] font-semibold">
            Nutrição Saudável Tutor & Pet
          </p>
        </div>
      )}
    </div>
  );
};
