import React, { useState } from 'react';
import { Utensils, Heart, Mail, ShieldCheck, Truck, RefreshCw, Sparkles, Check } from 'lucide-react';
import footerLogoImg from '../assets/images/regenerated_image_1789517135446.png';

interface FooterProps {
  onNavigate: (tab: 'shop' | 'blog' | 'guide') => void;
  onOpenAffiliateAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAffiliateAdmin }) => {
  const [newsEmail, setNewsEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    setSubscribed(true);
    setNewsEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-[#262422] text-[#EDE8E1] pt-14 pb-10 border-t border-[#3A3632]">
      {/* Highlights Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#3A3632]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#435B47] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Curadoria Independente</h4>
              <p className="text-xs text-[#ABA396] leading-relaxed">
                Seleção cuidadosa de itens saudáveis e práticos com indicações diretas para plataformas parceiras seguras.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C87941] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Qualidade & Procedência</h4>
              <p className="text-xs text-[#ABA396] leading-relaxed">
                Petiscos monoproteicos sem aditivos químicos e utensílios alimentares 100% livres de BPA.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#52725A] text-white flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white mb-1">Aprovado por Veterinários</h4>
              <p className="text-xs text-[#ABA396] leading-relaxed">
                Conteúdos e produtos validados por nutrólogos para a longevidade da família toda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#35312C] border border-[#48423B] flex items-center justify-center p-1 overflow-hidden">
              <img
                src={footerLogoImg}
                alt="Logotipo Prato & Pata"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif-brand text-2xl font-bold tracking-tight text-white">
              Prato <span className="text-[#C87941] font-normal">&</span> Pata
            </span>
          </div>
          <p className="text-xs text-[#ABA396] leading-relaxed">
            O primeiro portal brasileiro unindo culinária saudável para tutores e nutrição natural e bem-estar para cães e gatos.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-serif-brand text-base font-bold text-white mb-3">
            Navegação
          </h4>
          <ul className="space-y-2 text-xs text-[#ABA396]">
            <li>
              <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                Blog de Nutrição & Bem-Estar
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('guide')} className="hover:text-white transition-colors">
                Guia: Pode ou Não Pode?
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
                Lojinha
              </button>
            </li>
            <li>
              <span className="text-[#6D6559]">Receitas Compartilhadas</span>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-serif-brand text-base font-bold text-white mb-3">
            Categorias
          </h4>
          <ul className="space-y-2 text-xs text-[#ABA396]">
            <li>Snacks Desidratados 100% Naturais</li>
            <li>Comedouros Lentos de Cerâmica</li>
            <li>Marmitas Herméticas de Vidro Borossilicato</li>
            <li>Balanças Digitais de Alta Precisão</li>
            <li>Kits Duo Piquenique & Caminhada</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-serif-brand text-base font-bold text-white mb-3">
            Receitas & Dicas no seu E-mail
          </h4>
          <p className="text-xs text-[#ABA396] mb-3 leading-relaxed">
            Receba semanalmente uma nova receita saudável para o seu jantar e um petisco natural para o seu pet.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="w-full bg-[#1C1B19] border border-[#3A3632] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#787063] focus:ring-2 focus:ring-[#435B47] focus:outline-none"
            />
            <button
              type="submit"
              className="w-full bg-[#435B47] hover:bg-[#344738] text-white py-2 rounded-xl text-xs font-bold transition-colors"
            >
              {subscribed ? 'Inscrito com sucesso!' : 'Quero Receber Receitas'}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#3A3632] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#787063]">
        <p>© 2026 Prato e Pata Comércio e Conteúdo Ltda. Todos os direitos reservados.</p>
        <div className="flex items-center gap-4">
          <span>Privacidade & Termos</span>
          <span>•</span>
          <span>Certificação Veterinária</span>
          <span>•</span>
          <span>CNPJ 48.912.304/0001-92</span>
          {onOpenAffiliateAdmin && (
            <>
              <span>•</span>
              <button
                id="footer-hidden-admin-btn"
                onClick={onOpenAffiliateAdmin}
                className="text-[#524B42] hover:text-[#A89F91] transition-colors cursor-pointer"
                title="Acesso restrito ao Gestor de Afiliados"
              >
                🔒 Gestor Afiliados
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
