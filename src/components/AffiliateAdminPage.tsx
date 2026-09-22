import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { 
  Link2, Check, ExternalLink, Sparkles, Shield, 
  ArrowLeft, Search, Save, Plus, AlertCircle, Trash2, Eye, EyeOff, BarChart2,
  Loader2, RefreshCw, Zap, Image as ImageIcon, Upload, FolderOpen
} from 'lucide-react';
import { ImageBankModal } from './ImageBankModal';

interface AffiliateAdminPageProps {
  products: Product[];
  onUpdateProductAffiliate: (productId: string, affiliateUrl: string, isActive: boolean) => void;
  onAddNewAffiliateProduct: (newProduct: Partial<Product>) => void;
  onUpdateProductDetails?: (productId: string, updates: Partial<Product>) => void;
  onDeleteProduct?: (productId: string) => void;
  onCloseAdmin: () => void;
  affiliateClicks: Record<string, number>;
}

export const AffiliateAdminPage: React.FC<AffiliateAdminPageProps> = ({
  products,
  onUpdateProductAffiliate,
  onAddNewAffiliateProduct,
  onUpdateProductDetails,
  onDeleteProduct,
  onCloseAdmin,
  affiliateClicks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('todos');
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [editUrls, setEditUrls] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    products.forEach((p) => {
      initial[p.id] = p.affiliateUrl || '';
    });
    return initial;
  });

  // Global affiliate campaign parameter
  const [globalAffiliateTag, setGlobalAffiliateTag] = useState(() => {
    return localStorage.getItem('pratoepata_ml_tag') || 'pratoepata_ml2026';
  });
  const [globalTagSaved, setGlobalTagSaved] = useState(false);

  // Image Bank & Computer Upload States
  const [isImageBankOpen, setIsImageBankOpen] = useState(false);
  const [imageBankTargetProductId, setImageBankTargetProductId] = useState<string | null>(null);
  const [isUploadingLocalImage, setIsUploadingLocalImage] = useState(false);
  const [localUploadSuccess, setLocalUploadSuccess] = useState<string | null>(null);
  const [localUploadError, setLocalUploadError] = useState<string | null>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);

  // New product form
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdUrl, setNewProdUrl] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdAudience, setNewProdAudience] = useState<'pet' | 'tutor' | 'duo'>('pet');
  const [newProdCategory, setNewProdCategory] = useState<any>('snacks-naturais');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');

  // Auto-fetch states
  const [isFetchingMlData, setIsFetchingMlData] = useState(false);
  const [fetchMlError, setFetchMlError] = useState<string | null>(null);
  const [fetchMlSuccess, setFetchMlSuccess] = useState<string | null>(null);
  const [lastFetchedData, setLastFetchedData] = useState<{
    title?: string;
    priceFormatted?: string;
    image?: string;
    description?: string;
    source?: string;
    targetAudience?: string;
  } | null>(null);

  const [isSyncingExistingId, setIsSyncingExistingId] = useState<string | null>(null);

  // Upload image file directly from user's computer
  const handleUploadFromComputer = async (file: File, targetProductId?: string) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalUploadError('Selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG ou GIF).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setLocalUploadError('A foto excede o limite máximo de 15MB.');
      return;
    }

    setIsUploadingLocalImage(true);
    setLocalUploadError(null);
    setLocalUploadSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await fetch('/api/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64,
              filename: file.name,
            }),
          });

          const json = await res.json();
          if (json.success && json.url) {
            if (targetProductId && onUpdateProductDetails) {
              onUpdateProductDetails(targetProductId, { image: json.url });
              setLocalUploadSuccess(`Foto do produto atualizada com sucesso!`);
            } else {
              setNewProdImage(json.url);
              setLocalUploadSuccess(`Foto "${file.name}" enviada com sucesso do seu computador para o banco de imagens!`);
            }
          } else {
            setLocalUploadError(json.error || 'Erro ao enviar foto para o servidor.');
          }
        } catch (e) {
          setLocalUploadError('Falha ao conectar com o servidor para salvar a imagem.');
        } finally {
          setIsUploadingLocalImage(false);
        }
      };

      reader.onerror = () => {
        setLocalUploadError('Não foi possível ler o arquivo do seu computador.');
        setIsUploadingLocalImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setLocalUploadError('Erro ao iniciar processamento da imagem.');
      setIsUploadingLocalImage(false);
    }
  };

  // Automatic Mercado Livre Scraper Function
  const fetchProductDataFromUrl = async (urlToFetch: string) => {
    const targetUrl = urlToFetch.trim();
    if (!targetUrl) return;

    setIsFetchingMlData(true);
    setFetchMlError(null);
    setFetchMlSuccess(null);

    try {
      const response = await fetch('/api/scrape-mercadolivre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const json = await response.json();

      if (json.success && json.data) {
        const item = json.data;
        if (item.title) setNewProdName(item.title);
        if (item.priceFormatted) setNewProdPrice(item.priceFormatted);
        if (item.image) setNewProdImage(item.image);
        if (item.description) setNewProdDescription(item.description);
        if (item.targetAudience) setNewProdAudience(item.targetAudience);
        if (item.category) setNewProdCategory(item.category);

        setLastFetchedData(item);
        setFetchMlSuccess('Foto, título, preço e descrição buscados e preenchidos automaticamente do Mercado Livre!');
      } else {
        setFetchMlError(json.error || 'Não foi possível extrair dados desse link automaticamente. Você pode preencher os campos manualmente.');
      }
    } catch (err) {
      setFetchMlError('Falha ao conectar com o serviço de busca. Você pode preencher os dados manualmente.');
    } finally {
      setIsFetchingMlData(false);
    }
  };

  // Trigger when pasting or leaving the URL field
  const handleUrlPasteOrBlur = (url: string) => {
    if (url && (url.includes('mercadolivre') || url.includes('meli.la') || url.startsWith('http'))) {
      fetchProductDataFromUrl(url);
    }
  };

  const handleSyncExistingProduct = async (product: Product) => {
    const url = editUrls[product.id] || '';
    if (!url.trim()) return;

    setIsSyncingExistingId(product.id);
    try {
      const response = await fetch('/api/scrape-mercadolivre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await response.json();
      if (json.success && json.data) {
        const item = json.data;
        const updates: Partial<Product> = {
          affiliateUrl: url.trim(),
        };
        if (item.title) updates.name = item.title;
        if (item.priceFormatted) {
          const numPrice = parseFloat(item.priceFormatted.replace(',', '.'));
          if (!isNaN(numPrice) && numPrice > 0) updates.price = numPrice;
        }
        if (item.image) updates.image = item.image;
        if (item.description) {
          updates.shortDescription = item.description;
          updates.fullDescription = item.description;
        }
        if (onUpdateProductDetails) {
          onUpdateProductDetails(product.id, updates);
        }
        onUpdateProductAffiliate(product.id, url.trim(), true);
        setSavedStatus((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setSavedStatus((prev) => ({ ...prev, [product.id]: false }));
        }, 3000);
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncingExistingId(null);
    }
  };

  const handleUrlChange = (productId: string, val: string) => {
    setEditUrls((prev) => ({ ...prev, [productId]: val }));
  };

  const handleSaveSingle = (product: Product) => {
    const url = editUrls[product.id] || '';
    onUpdateProductAffiliate(product.id, url.trim(), !!url.trim());
    setSavedStatus((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setSavedStatus((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  const handleSaveGlobalTag = () => {
    localStorage.setItem('pratoepata_ml_tag', globalAffiliateTag);
    setGlobalTagSaved(true);
    setTimeout(() => setGlobalTagSaved(false), 2000);
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdUrl.trim()) return;

    const parsedPrice = parseFloat(newProdPrice.replace(',', '.')) || 49.90;
    const defaultImage = newProdImage.trim() || (
      newProdAudience === 'tutor' 
        ? 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80'
    );

    onAddNewAffiliateProduct({
      id: `ml-prod-${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      targetAudience: newProdAudience,
      price: parsedPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: defaultImage,
      shortDescription: newProdDescription.trim() || 'Produto selecionado com curadoria Prato & Pata no Mercado Livre.',
      fullDescription: newProdDescription.trim() || 'Produto recomendado com garantia de procedência e entrega rápida pelo Mercado Livre.',
      highlights: ['Curadoria Prato & Pata', 'Compra segura Mercado Livre', 'Envio Full garantido'],
      specs: {
        materialOuComposicao: 'Especificações originais do fabricante.',
        indicacao: newProdAudience === 'pet' ? 'Pets' : newProdAudience === 'tutor' ? 'Tutores' : 'Família e Pets',
        origem: 'Mercado Livre Oficial',
        cuidados: 'Ver orientações na embalagem do fabricante.'
      },
      inStock: true,
      affiliateUrl: newProdUrl.trim(),
      affiliatePlatform: 'mercado_livre',
    });

    setNewProdName('');
    setNewProdUrl('');
    setNewProdPrice('');
    setNewProdDescription('');
    setNewProdImage('');
    setLastFetchedData(null);
    setFetchMlSuccess(null);
    setFetchMlError(null);
    setIsAddingNew(false);
  };

  const filteredProducts = products.filter((p) => {
    if (selectedAudience !== 'todos' && p.targetAudience !== selectedAudience) {
      return false;
    }
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q);
    }
    return true;
  });

  const totalWithAffiliate = products.filter((p) => Boolean(p.affiliateUrl)).length;
  const totalClicks = Object.values(affiliateClicks).reduce((acc: number, curr: number) => acc + Number(curr || 0), 0);

  return (
    <div id="affiliate-admin-page" className="min-h-screen bg-[#F7F4EC] text-[#2D2A26] pb-16">
      {/* Top Admin Notice Bar */}
      <div className="bg-[#2D2A26] text-[#EDE8E1] px-4 py-2.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] animate-pulse" />
            <span className="font-bold text-[#FFE600]">Painel Administrativo Oculto:</span>
            <span className="text-[#ABA396] hidden sm:inline">
              Gestor de Links de Afiliados Mercado Livre • Prato & Pata
            </span>
          </div>

          <button
            id="exit-admin-btn"
            onClick={onCloseAdmin}
            className="bg-[#435B47] hover:bg-[#344738] text-white px-3.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Site Público</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Title */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE4D8] shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FFFDE6] text-[#6B5700] px-3.5 py-1 rounded-full text-xs font-bold mb-3 border border-[#FBEB98]">
              <span className="text-sm">⚡</span>
              <span>Integração de Afiliado Mercado Livre</span>
            </div>
            <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#2D2A26]">
              Gestor de Links de Afiliado Mercado Livre
            </h1>
            <p className="text-xs sm:text-sm text-[#6B655B] mt-1.5 max-w-2xl leading-relaxed">
              Insira e atualize com facilidade os links de afiliado do Mercado Livre para qualquer produto da loja. 
              Ao preencher, o visitante verá a opção de compra direta e rápida pelo Mercado Livre ou atendimento via WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-open-image-bank-btn"
              type="button"
              onClick={() => {
                setImageBankTargetProductId(null);
                setIsImageBankOpen(true);
              }}
              className="bg-white hover:bg-[#FAF7F0] text-[#435B47] border border-[#D5CDBD] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Abrir banco de imagens e subir fotos do computador"
            >
              <ImageIcon className="w-4 h-4 text-[#435B47]" />
              <span>Banco de Imagens & Upload 📤</span>
            </button>

            <button
              id="admin-add-new-product-btn"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="bg-[#FFE600] hover:bg-[#F2DA00] text-[#2D3277] border border-[#E5CF00] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#2D3277]" />
              <span>{isAddingNew ? 'Cancelar Cadastro' : 'Cadastrar Novo Item ML'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F0] border border-[#EBE4D8] flex items-center justify-center text-xl">
              📦
            </div>
            <div>
              <div className="text-xs text-[#8C8375] font-medium">Produtos no Catálogo</div>
              <div className="text-2xl font-bold text-[#2D2A26]">{products.length}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFFDE6] border border-[#FBEB98] text-[#2D3277] flex items-center justify-center text-xl font-bold">
              ⚡
            </div>
            <div>
              <div className="text-xs text-[#8C8375] font-medium">Com Links Mercado Livre</div>
              <div className="text-2xl font-bold text-[#2D3277]">
                {totalWithAffiliate} <span className="text-xs font-normal text-[#6B655B]">({Math.round((totalWithAffiliate / (products.length || 1)) * 100)}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E3EFE6] border border-[#C2E0C8] text-[#24572D] flex items-center justify-center">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#8C8375] font-medium">Cliques de Afiliado Rastreados</div>
              <div className="text-2xl font-bold text-[#24572D]">{totalClicks}</div>
            </div>
          </div>
        </div>

        {/* Global Tag Configuration Box */}
        <div className="bg-white p-6 rounded-3xl border border-[#EBE4D8] shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif-brand font-bold text-base text-[#2D2A26] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#435B47]" />
                <span>Identificador / Tag Padrão de Afiliado (Opcional)</span>
              </h3>
              <p className="text-xs text-[#6B655B] mt-0.5">
                Essa tag ajuda a identificar a procedência das suas comissões no painel de relatórios do Mercado Livre.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={globalAffiliateTag}
                onChange={(e) => setGlobalAffiliateTag(e.target.value)}
                placeholder="Ex: pratoepata_ml"
                className="bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:bg-white"
              />
              <button
                onClick={handleSaveGlobalTag}
                className="bg-[#435B47] hover:bg-[#344738] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
              >
                {globalTagSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{globalTagSaved ? 'Salvo!' : 'Salvar Tag'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Add New Product Form with Automatic Mercado Livre Fetching */}
        {isAddingNew && (
          <form onSubmit={handleCreateNewProduct} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#FFE600] shadow-md mb-8 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFE600] border border-[#E5CF00] flex items-center justify-center text-base font-bold text-[#2D3277]">
                  ⚡
                </div>
                <div>
                  <h3 className="font-serif-brand font-bold text-lg text-[#2D2A26]">
                    Cadastrar Novo Produto com Busca Automática do Mercado Livre
                  </h3>
                  <p className="text-xs text-[#6B655B]">
                    Cole o link do produto abaixo: o sistema busca automaticamente a foto, o preço, a descrição e o título!
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-[#FFFDE6] text-[#2D3277] font-bold px-3 py-1 rounded-full border border-[#FBEB98] hidden sm:inline-block">
                Curadoria Automática ML
              </span>
            </div>

            {/* STEP 1: Highlighted Affiliate URL Input with Instant Auto-Fetch */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDE6] border-2 border-[#E5CF00] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-extrabold text-[#2D3277] flex items-center gap-1.5">
                  <span className="text-base">1️⃣</span>
                  <span>Cole o Link de Afiliado ou Link do Produto no Mercado Livre:</span>
                </label>
                <span className="text-[11px] text-[#6B5700] font-medium">
                  Suporta links curtos (/sec/...) e links diretos (MLB)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="new-product-ml-url-input"
                    type="url"
                    required
                    value={newProdUrl}
                    onChange={(e) => {
                      setNewProdUrl(e.target.value);
                      if (fetchMlError) setFetchMlError(null);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        setTimeout(() => handleUrlPasteOrBlur(pasted), 100);
                      }
                    }}
                    onBlur={() => {
                      if (newProdUrl && !newProdName && !isFetchingMlData) {
                        handleUrlPasteOrBlur(newProdUrl);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        fetchProductDataFromUrl(newProdUrl);
                      }
                    }}
                    placeholder="https://mercadolivre.com.br/sec/... ou https://produto.mercadolivre.com.br/MLB-..."
                    className="w-full bg-white border-2 border-[#FFE600] rounded-xl pl-3.5 pr-10 py-3 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#2D3277] font-mono shadow-inner"
                  />
                  {newProdUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewProdUrl('');
                        setLastFetchedData(null);
                        setFetchMlSuccess(null);
                        setFetchMlError(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C8375] hover:text-[#2D2A26] font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  id="fetch-ml-data-btn"
                  type="button"
                  disabled={isFetchingMlData || !newProdUrl.trim()}
                  onClick={() => fetchProductDataFromUrl(newProdUrl)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 ${
                    isFetchingMlData || !newProdUrl.trim()
                      ? 'bg-[#EAE4D5] text-[#8C8375] cursor-not-allowed'
                      : 'bg-[#2D3277] hover:bg-[#1F2356] text-[#FFE600] active:scale-95 cursor-pointer'
                  }`}
                >
                  {isFetchingMlData ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FFE600]" />
                      <span>Buscando Dados no ML...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#FFE600]" />
                      <span>Buscar Dados Automaticamente</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Notifications */}
              {isFetchingMlData && (
                <div className="flex items-center gap-2 text-xs text-[#2D3277] font-medium bg-white/80 p-2.5 rounded-xl border border-[#FBEB98] animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2D3277]" />
                  <span>Acessando o Mercado Livre para extrair foto em alta resolução, preço atualizado, descrição e título...</span>
                </div>
              )}

              {fetchMlSuccess && (
                <div className="flex items-center justify-between text-xs text-[#1C4E23] font-bold bg-[#E6F4EA] p-2.5 rounded-xl border border-[#C2E0C8] animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1C4E23]" />
                    <span>{fetchMlSuccess}</span>
                  </div>
                  <span className="text-[10px] bg-white text-[#1C4E23] px-2 py-0.5 rounded-md border border-[#C2E0C8]">
                    100% Preenchido
                  </span>
                </div>
              )}

              {fetchMlError && (
                <div className="flex items-center gap-2 text-xs text-[#8A2626] font-medium bg-[#FDE8E8] p-2.5 rounded-xl border border-[#F8B4B4] animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-[#8A2626] shrink-0" />
                  <span>{fetchMlError}</span>
                </div>
              )}

              {/* Quick sample test links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-[#6B5700] font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#2D3277]" /> Testar com links de exemplo:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://mercadolivre.com.br/sec/pratoepata-petisco-desidratado';
                    setNewProdUrl(sample);
                    fetchProductDataFromUrl(sample);
                  }}
                  className="text-[11px] bg-white hover:bg-[#FAF7F0] border border-[#E5CF00] text-[#2D3277] px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  🥩 Petisco Bovino Desidratado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://mercadolivre.com.br/sec/pratoepata-comedouro-ceramica';
                    setNewProdUrl(sample);
                    fetchProductDataFromUrl(sample);
                  }}
                  className="text-[11px] bg-white hover:bg-[#FAF7F0] border border-[#E5CF00] text-[#2D3277] px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  🥣 Comedouro Cerâmica Anti-refluxo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = 'https://mercadolivre.com.br/sec/pratoepata-balanca-precisao';
                    setNewProdUrl(sample);
                    fetchProductDataFromUrl(sample);
                  }}
                  className="text-[11px] bg-white hover:bg-[#FAF7F0] border border-[#E5CF00] text-[#2D3277] px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  ⚖️ Balança de Precisão Digital
                </button>
              </div>
            </div>

            {/* Live Visual Preview Card (if data fetched or entered) */}
            {(newProdName || newProdImage || newProdPrice) && (
              <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#D5CDBD] shadow-xs animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#6B655B] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#435B47]" />
                    <span>Prévia Visual do Card na Loja</span>
                  </span>
                  <span className="text-[11px] text-[#24572D] font-bold">
                    Pronto para publicação
                  </span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#EBE4D8] flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#FAF7F0] border border-[#EBE4D8] shrink-0">
                    <img
                      src={newProdImage || 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80'}
                      alt="Prévia do produto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80');
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-[#FFE600] text-[#2D3277] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                      ⚡ Mercado Livre
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#435B47] border border-[#EBE4D8]">
                        {newProdAudience === 'pet' ? '🐾 Para Pets' : newProdAudience === 'tutor' ? '🍳 Para Tutores' : '✨ Duo Tutor & Pet'}
                      </span>
                      <span className="text-xs text-[#8C8375]">
                        Categoria: {newProdCategory}
                      </span>
                    </div>

                    <h4 className="font-serif-brand font-bold text-sm text-[#2D2A26] leading-snug line-clamp-1 mb-1">
                      {newProdName || 'Nome do Produto...'}
                    </h4>

                    <p className="text-xs text-[#6B655B] line-clamp-2 mb-2 leading-relaxed">
                      {newProdDescription || 'Descrição curta do benefício do produto para nutrição e saúde...'}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-[#24572D]">
                        R$ {newProdPrice || '0,00'}
                      </span>
                      <span className="text-[11px] text-[#6B5700] bg-[#FFFDE6] px-2 py-0.5 rounded-md border border-[#FBEB98] font-bold">
                        ⚡ Frete Full • Compra Segura
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Editable details (already auto-filled, editable if needed) */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-[#4E4940] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>2️⃣</span>
                  <span>Revise ou edite os dados extraídos:</span>
                </span>
                <span className="text-[11px] text-[#8C8375] font-normal">
                  Campos preenchidos automaticamente via busca
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#4E4940] mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ex: Suplemento Probiótico Natural para Cães e Gatos"
                    className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl px-3.5 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4E4940] mb-1">
                    Preço de Referência (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    placeholder="69,90"
                    className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl px-3.5 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#4E4940] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#435B47]" />
                      <span>Foto / Imagem do Produto *</span>
                    </label>
                    <span className="text-[11px] text-[#8C8375]">
                      Upload do computador ou URL direta
                    </span>
                  </div>

                  {/* Hidden File Input for Computer Upload */}
                  <input
                    ref={formFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadFromComputer(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Upload Action Buttons Box */}
                  <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#D5CDBD] space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        id="btn-upload-from-computer"
                        type="button"
                        disabled={isUploadingLocalImage}
                        onClick={() => formFileInputRef.current?.click()}
                        className="bg-[#435B47] hover:bg-[#344738] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isUploadingLocalImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Enviando foto...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Subir Imagem do meu Computador</span>
                          </>
                        )}
                      </button>

                      <button
                        id="btn-open-image-bank-form"
                        type="button"
                        onClick={() => {
                          setImageBankTargetProductId(null);
                          setIsImageBankOpen(true);
                        }}
                        className="bg-white hover:bg-[#FAF7F0] text-[#544F46] border border-[#D5CDBD] px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 text-[#435B47]" />
                        <span>Banco de Imagens da Loja</span>
                      </button>

                      {newProdImage && (
                        <button
                          type="button"
                          onClick={() => setNewProdImage('')}
                          className="text-xs text-[#9B1C1C] hover:underline ml-auto font-medium"
                        >
                          Limpar foto
                        </button>
                      )}
                    </div>

                    {/* Feedback Messages */}
                    {localUploadSuccess && (
                      <div className="p-2.5 rounded-xl bg-[#E3EFE6] border border-[#C2E0C8] text-[#24572D] text-xs flex items-center gap-2 animate-fadeIn">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{localUploadSuccess}</span>
                      </div>
                    )}
                    {localUploadError && (
                      <div className="p-2.5 rounded-xl bg-[#FDF2F2] border border-[#F8D7D7] text-[#9B1C1C] text-xs flex items-center gap-2 animate-fadeIn">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{localUploadError}</span>
                      </div>
                    )}

                    {/* Drag-and-drop / Preview Box */}
                    {newProdImage ? (
                      <div className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-[#EBE4D8]">
                        <img
                          src={newProdImage}
                          alt="Foto selecionada"
                          className="w-16 h-16 rounded-lg object-cover border border-[#EBE4D8] bg-[#FAF7F0] shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80');
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#24572D] bg-[#E3EFE6] px-2 py-0.5 rounded-md">
                            Foto pronta para o produto
                          </span>
                          <p className="text-xs font-mono text-[#6B655B] truncate mt-1" title={newProdImage}>
                            {newProdImage}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            handleUploadFromComputer(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => formFileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#D5CDBD] hover:border-[#435B47] rounded-xl p-4 text-center cursor-pointer bg-white hover:bg-[#FDFBF7] transition-colors"
                      >
                        <p className="text-xs font-semibold text-[#544F46]">
                          Ou arraste uma foto do seu computador diretamente para este quadro
                        </p>
                        <p className="text-[10px] text-[#8C8375] mt-0.5">
                          PNG, JPG, WEBP até 15MB
                        </p>
                      </div>
                    )}

                    {/* Direct URL input fallback */}
                    <div>
                      <label className="block text-[11px] font-medium text-[#6B655B] mb-1">
                        Ou cole um link direto de foto (opcional):
                      </label>
                      <input
                        type="url"
                        value={newProdImage}
                        onChange={(e) => setNewProdImage(e.target.value)}
                        placeholder="https://... ou /updates/sua-foto.jpg"
                        className="w-full bg-white border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-[#4E4940] mb-1">
                    Descrição do Produto & Benefício Nutricional *
                  </label>
                  <textarea
                    rows={3}
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    placeholder="Descrição do item, benefícios nutricionais e composição..."
                    className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl p-3 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4E4940] mb-1">
                    Público Alvo
                  </label>
                  <select
                    value={newProdAudience}
                    onChange={(e) => setNewProdAudience(e.target.value as any)}
                    className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
                  >
                    <option value="pet">🐾 Para Pets (Cães / Gatos)</option>
                    <option value="tutor">🍳 Cozinha Saudável do Tutor</option>
                    <option value="duo">✨ Duo Tutor & Pet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4E4940] mb-1">
                    Categoria na Loja
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl px-3 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47]"
                  >
                    <option value="snacks-naturais">Comidas</option>
                    <option value="pet-caes">Coisinhas pro cão</option>
                    <option value="pet-gatos">Coisinhas pro gato</option>
                    <option value="cozinha-saudavel">Cozinha</option>
                    <option value="utensilios-ecologicos">Coisas</option>
                    <option value="kits-duo">Kits Duo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE4D8]">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setLastFetchedData(null);
                  setFetchMlSuccess(null);
                  setFetchMlError(null);
                }}
                className="px-4 py-2 text-xs font-bold text-[#6B655B] hover:text-[#2D2A26]"
              >
                Cancelar
              </button>
              <button
                id="save-new-ml-product-btn"
                type="submit"
                disabled={!newProdName.trim() || !newProdUrl.trim()}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                  !newProdName.trim() || !newProdUrl.trim()
                    ? 'bg-[#D5CDBD] text-[#8C8375] cursor-not-allowed'
                    : 'bg-[#2D3277] hover:bg-[#1F2356] text-white active:scale-95 cursor-pointer'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>Salvar e Cadastrar Produto na Loja</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#EBE4D8] shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produto pelo nome..."
              className="w-full bg-[#FAF7F0] border border-[#D5CDBD] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D2A26] focus:ring-2 focus:ring-[#435B47] focus:bg-white"
            />
            <Search className="w-4 h-4 text-[#8C8375] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedAudience('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedAudience === 'todos' ? 'bg-[#435B47] text-white' : 'bg-[#FAF7F0] text-[#6B655B]'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setSelectedAudience('pet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedAudience === 'pet' ? 'bg-[#435B47] text-white' : 'bg-[#FAF7F0] text-[#6B655B]'
              }`}
            >
              🐾 Para Pets
            </button>
            <button
              onClick={() => setSelectedAudience('tutor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedAudience === 'tutor' ? 'bg-[#435B47] text-white' : 'bg-[#FAF7F0] text-[#6B655B]'
              }`}
            >
              🍳 Cozinha
            </button>
            <button
              onClick={() => setSelectedAudience('duo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedAudience === 'duo' ? 'bg-[#435B47] text-white' : 'bg-[#FAF7F0] text-[#6B655B]'
              }`}
            >
              ✨ Duo
            </button>
          </div>
        </div>

        {/* Product Affiliate Link Insertion Table / Cards */}
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const currentUrl = editUrls[product.id] || '';
            const isSaved = savedStatus[product.id];
            const hasActiveUrl = Boolean(product.affiliateUrl);
            const clicks = affiliateClicks[product.id] || 0;
            const isMLUrl = currentUrl.includes('mercadolivre.com') || currentUrl.includes('mercadolivre.com.br');

            return (
              <div
                key={product.id}
                id={`admin-affiliate-row-${product.id}`}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  hasActiveUrl ? 'border-[#EBE4D8]' : 'border-[#EBE4D8] bg-[#FDFAF5]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 min-w-[280px]">
                    <div className="relative group/thumb shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#EBE4D8] bg-[#FAF7F0]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageBankTargetProductId(product.id);
                          setIsImageBankOpen(true);
                        }}
                        title="Trocar foto pelo computador ou banco de imagens"
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center text-white text-[9px] font-bold gap-0.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Trocar Foto</span>
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#FAF7F0] text-[#6B655B] border border-[#EBE4D8]">
                          {product.targetAudience === 'pet' ? '🐾 Pet' : product.targetAudience === 'tutor' ? '🍳 Tutor' : '✨ Duo'}
                        </span>
                        <span className="text-xs font-bold text-[#2D2A26]">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setImageBankTargetProductId(product.id);
                            setIsImageBankOpen(true);
                          }}
                          className="text-[10px] text-[#435B47] hover:underline font-bold ml-1 flex items-center gap-1"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          <span>Subir foto</span>
                        </button>
                      </div>
                      <h4 className="font-serif-brand font-bold text-sm text-[#2D2A26] leading-tight line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="text-[11px] text-[#8C8375] mt-0.5 flex items-center gap-2">
                        <span>ID: {product.id}</span>
                        {clicks > 0 && (
                          <span className="text-[#24572D] font-bold">
                            • {clicks} {clicks === 1 ? 'clique' : 'cliques'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Mercado Livre Link Input */}
                  <div className="flex-1 max-w-2xl">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#2D2A26] flex items-center gap-1.5">
                        <span className="text-sm">⚡</span>
                        <span>Link de Afiliado do Mercado Livre:</span>
                        {isMLUrl && (
                          <span className="text-[10px] bg-[#E3EFE6] text-[#24572D] px-2 py-0.2 rounded-md font-bold">
                            Link Válido ML
                          </span>
                        )}
                      </label>
                      {hasActiveUrl ? (
                        <span className="text-[10px] text-[#24572D] font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Ativo na Loja
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8C8375] flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Sem Link Ativo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          id={`input-affiliate-url-${product.id}`}
                          type="url"
                          value={currentUrl}
                          onChange={(e) => handleUrlChange(product.id, e.target.value)}
                          placeholder="Cole aqui: https://mercadolivre.com/sec/... ou link do produto"
                          className={`w-full text-xs font-mono rounded-xl px-3 py-2.5 transition-all focus:outline-none focus:ring-2 ${
                            hasActiveUrl
                              ? 'bg-[#FFFDE6] border border-[#E5CF00] text-[#2D2A26] focus:ring-[#FFE600]'
                              : 'bg-[#FAF7F0] border border-[#D5CDBD] text-[#544F46] focus:ring-[#435B47] focus:bg-white'
                          }`}
                        />
                        {currentUrl && (
                          <button
                            type="button"
                            onClick={() => handleUrlChange(product.id, '')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8C8375] hover:text-[#2D2A26]"
                            title="Limpar campo"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Sync Data Button from Mercado Livre */}
                      {currentUrl && (
                        <button
                          type="button"
                          onClick={() => handleSyncExistingProduct(product)}
                          disabled={isSyncingExistingId === product.id}
                          className="bg-[#FFFDE6] hover:bg-[#FFE600] border border-[#E5CF00] text-[#2D3277] p-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1 text-xs font-bold"
                          title="Buscar foto, preço e descrição atualizada deste link no Mercado Livre"
                        >
                          {isSyncingExistingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#2D3277]" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-[#2D3277]" />
                          )}
                        </button>
                      )}

                      {/* Test Link Button */}
                      {currentUrl && (
                        <a
                          id={`test-affiliate-link-${product.id}`}
                          href={currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white hover:bg-[#FAF7F0] border border-[#D5CDBD] text-[#544F46] p-2.5 rounded-xl transition-colors shrink-0"
                          title="Testar se o link abre no Mercado Livre"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}

                      {/* Save Button */}
                      <button
                        id={`save-affiliate-btn-${product.id}`}
                        type="button"
                        onClick={() => handleSaveSingle(product)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-xs ${
                          isSaved
                            ? 'bg-[#24572D] text-white'
                            : 'bg-[#435B47] hover:bg-[#344738] text-white active:scale-95'
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'Salvo!' : 'Salvar'}</span>
                      </button>

                      {/* Delete Product Button */}
                      {onDeleteProduct && (
                        <button
                          id={`delete-affiliate-btn-${product.id}`}
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja eliminar "${product.name}"?`)) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="p-2.5 rounded-xl text-xs font-bold text-[#8C8375] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0"
                          title="Eliminar produto da seleção"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Helper Box for User */}
        <div className="mt-10 bg-white p-6 sm:p-8 rounded-3xl border border-[#EBE4D8] shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFDE6] border border-[#FBEB98] text-[#6B5700] flex items-center justify-center text-lg shrink-0">
              💡
            </div>
            <div className="space-y-2 text-xs text-[#544F46] leading-relaxed">
              <h4 className="font-serif-brand font-bold text-sm text-[#2D2A26]">
                Como funciona o Sistema de Afiliados Mercado Livre no Prato & Pata:
              </h4>
              <ul className="list-disc pl-4 space-y-1.5 text-[#6B655B]">
                <li>
                  <strong>Privacidade & Ocultação:</strong> Esta página é restrita e não é exibida na barra de navegação pública do site para os clientes comuns. Ela pode ser acessada adicionando <code>?admin=true</code> ao endereço da URL ou pelo atalho seguro de gestão.
                </li>
                <li>
                  <strong>Experiência do Cliente na Loja:</strong> Quando um produto possui um link cadastrado aqui, um botão estilizado em amarelo Mercado Livre (<em>Comprar no Mercado Livre ⚡</em>) é exibido no card e no modal de detalhes do produto.
                </li>
                <li>
                  <strong>Conversão Direta:</strong> O visitante tem a agilidade de comprar diretamente pelo Mercado Livre (com frete Full rápido e seguro) gerando comissão de afiliado para você, ou tirar dúvidas e fazer pedidos diretamente pelo canal do WhatsApp.
                </li>
                <li>
                  <strong>Persistência Garantida:</strong> Todos os links inseridos são salvos automaticamente no armazenamento persistente do projeto e sincronizados.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Image Bank & Computer Upload Modal */}
      <ImageBankModal
        isOpen={isImageBankOpen}
        onClose={() => {
          setIsImageBankOpen(false);
          setImageBankTargetProductId(null);
        }}
        onSelectImage={(imageUrl) => {
          if (imageBankTargetProductId && onUpdateProductDetails) {
            onUpdateProductDetails(imageBankTargetProductId, { image: imageUrl });
            setImageBankTargetProductId(null);
          } else {
            setNewProdImage(imageUrl);
          }
        }}
        title={
          imageBankTargetProductId
            ? `Trocar Foto do Produto (ID: ${imageBankTargetProductId})`
            : 'Banco de Imagens do Site & Upload do Computador'
        }
      />
    </div>
  );
};
