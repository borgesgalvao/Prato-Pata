import React, { useState, useEffect } from 'react';
import { Product, BlogPost, BlogComment } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { INITIAL_ARTICLES } from './data/articles';
import { Header } from './components/Header';
import { ShopSection } from './components/ShopSection';
import { BlogSection } from './components/BlogSection';
import { InteractiveFoodGuide } from './components/InteractiveFoodGuide';
import { ProductModal } from './components/ProductModal';
import { ArticleModal } from './components/ArticleModal';
import { Footer } from './components/Footer';
import { AffiliateAdminPage } from './components/AffiliateAdminPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'blog' | 'guide'>('blog');
  
  // Hidden Affiliate Admin Mode (accessible via ?admin=true, #admin, Alt+Shift+A or Footer button)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      return search.includes('admin') || search.includes('afiliado') || hash.includes('admin');
    }
    return false;
  });

  const [affiliateClicks, setAffiliateClicks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('pratoepata_ml_clicks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return { 'prod-1': 14, 'prod-2': 22, 'prod-3': 31, 'prod-5': 9 };
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const ELIMINATED_IDS = new Set([
      'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 
      'prod-6', 'prod-7', 'prod-8', 'prod-9', 'prod-10', 'prod-11', 'prod-12'
    ]);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pratoepata_custom_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out old legacy dummy items and ensure active Mercado Livre url
            const activeOnly = parsed.filter(
              (p: Product) => !ELIMINATED_IDS.has(p.id) && Boolean(p.affiliateUrl && p.affiliateUrl.trim().length > 0)
            );
            if (activeOnly.length > 0) {
              return activeOnly;
            }
          }
        } catch (e) {
          // fallback to INITIAL_PRODUCTS
        }
      }
    }
    return INITIAL_PRODUCTS;
  });
  const [articles, setArticles] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('pratoepata_articles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_ARTICLES; }
    }
    return INITIAL_ARTICLES;
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('pratoepata_articles', JSON.stringify(articles));
  }, [articles]);

  // Persist customized products with affiliate links to localStorage
  useEffect(() => {
    localStorage.setItem('pratoepata_custom_products', JSON.stringify(products));
  }, [products]);

  // Fetch persistent catalog from server or static /data/products.json on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        let remoteProducts: Product[] | null = null;
        // 1. Try Node API first
        try {
          const res = await fetch('/api/products');
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.products) && json.products.length > 0) {
              remoteProducts = json.products;
            }
          }
        } catch (apiErr) {}

        // 2. If API was unreachable (e.g. static hosting on Hostinger Apache), fetch static /data/products.json
        if (!remoteProducts) {
          try {
            const staticRes = await fetch('/data/products.json');
            if (staticRes.ok) {
              const staticJson = await staticRes.json();
              if (Array.isArray(staticJson) && staticJson.length > 0) {
                remoteProducts = staticJson;
              }
            }
          } catch (staticErr) {}
        }

        if (remoteProducts && remoteProducts.length > 0 && isMounted) {
          const validRemote = remoteProducts.filter((p) => Boolean(p.affiliateUrl && p.affiliateUrl.trim().length > 0));
          if (validRemote.length > 0) {
            setProducts((current) => {
              const remoteIds = new Set(validRemote.map((p) => p.id));
              const localCustomOnly = current.filter((p) => !remoteIds.has(p.id) && p.id.startsWith('ml-prod-'));
              return [...localCustomOnly, ...validRemote];
            });
          }
        }
      } catch (err) {
        console.warn('Catalog auto-fetch deferred:', err);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist affiliate clicks
  useEffect(() => {
    localStorage.setItem('pratoepata_ml_clicks', JSON.stringify(affiliateClicks));
  }, [affiliateClicks]);

  // Ensure designMode is disabled and purge old edit state
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.designMode = 'off';
      const oldStyle = document.getElementById('live-text-editor-styles');
      if (oldStyle) oldStyle.remove();
      try {
        localStorage.removeItem('pratoepata_edit_mode');
      } catch (e) {}
    }
  }, []);

  // Keyboard shortcut listener to toggle hidden admin mode (Alt + Shift + A or Ctrl + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.shiftKey && (e.key === 'a' || e.key === 'A')) ||
          (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        setIsAdminMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Affiliate Management Handlers
  const handleUpdateProductAffiliate = async (productId: string, affiliateUrl: string, isActive: boolean) => {
    let updatedProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProduct = {
            ...p,
            affiliateUrl: affiliateUrl || undefined,
            affiliatePlatform: 'mercado_livre' as const,
          };
          return updatedProduct;
        }
        return p;
      })
    );

    // Sync with backend API
    try {
      if (updatedProduct) {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        });
      }
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, affiliateUrl, isActive }),
      });
    } catch (e) {
      console.warn('Backend affiliate sync deferred:', e);
    }

    showToast('Link de afiliado Mercado Livre salvo com sucesso!');
  };

  const handleAddNewAffiliateProduct = async (newProductData: Partial<Product>) => {
    const newFullProduct: Product = {
      id: newProductData.id || `ml-prod-${Date.now()}`,
      name: newProductData.name || 'Novo Produto Mercado Livre',
      category: newProductData.category || 'snacks-naturais',
      targetAudience: newProductData.targetAudience || 'pet',
      price: newProductData.price || 49.90,
      originalPrice: newProductData.price ? newProductData.price * 1.2 : undefined,
      rating: 5.0,
      reviewsCount: 1,
      image: newProductData.image || 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80',
      shortDescription: newProductData.shortDescription || 'Produto recomendado com curadoria Prato & Pata no Mercado Livre.',
      fullDescription: newProductData.fullDescription || 'Item de alta qualidade selecionado para a alimentação e bem-estar de tutores e animais.',
      highlights: newProductData.highlights || ['Curadoria Oficial', 'Compra Segura Mercado Livre'],
      specs: newProductData.specs || {
        materialOuComposicao: 'Padrão do fabricante.',
        indicacao: 'Tutores e Pets',
        origem: 'Mercado Livre',
        cuidados: 'Ver embalagem'
      },
      inStock: true,
      affiliateUrl: newProductData.affiliateUrl,
      affiliatePlatform: 'mercado_livre',
    };

    setProducts((prev) => [newFullProduct, ...prev]);

    try {
      // 1. Write product to server persistent catalog file (products.json)
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFullProduct),
      });

      // 2. Register affiliate link tracking
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newFullProduct.id,
          affiliateUrl: newFullProduct.affiliateUrl,
          isActive: true,
        }),
      });
    } catch (e) {
      console.warn('Backend affiliate sync deferred:', e);
    }

    showToast('Novo item cadastrado e salvo no catálogo do site!');
  };

  const handleUpdateProductDetails = async (productId: string, updates: Partial<Product>) => {
    let updatedProduct: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          updatedProduct = { ...p, ...updates };
          return updatedProduct;
        }
        return p;
      })
    );

    if (updatedProduct) {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProduct),
        });
      } catch (e) {}
    }

    showToast('Dados do produto atualizados e salvos no catálogo!');
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
    } catch (e) {}
    showToast('Produto excluído com sucesso!');
  };

  const handleSyncAllProducts = async (newProductsList: Product[]) => {
    setProducts(newProductsList);
    try {
      const res = await fetch('/api/products/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProductsList }),
      });
      if (res.ok) {
        showToast('Catálogo salvo no arquivo permanente products.json!');
      } else {
        showToast('Catálogo atualizado no navegador!');
      }
    } catch (e) {
      showToast('Catálogo atualizado no navegador!');
    }
  };

  const handleTrackAffiliateClick = async (productId: string) => {
    setAffiliateClicks((prev) => {
      const updated = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      return updated;
    });

    try {
      fetch('/api/affiliates/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).catch(() => {});
    } catch (e) {}
  };

  // Blog operations
  const handleAddComment = (articleId: string, newComment: Omit<BlogComment, 'id' | 'likes'>) => {
    const commentWithId: BlogComment = {
      ...newComment,
      id: `comm-${Date.now()}`,
      likes: 0,
    };

    setArticles((prev) =>
      prev.map((art) =>
        art.id === articleId
          ? { ...art, comments: [commentWithId, ...art.comments] }
          : art
      )
    );

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle((prev) =>
        prev ? { ...prev, comments: [commentWithId, ...prev.comments] } : null
      );
    }
    showToast('Seu comentário foi publicado com sucesso!');
  };

  const handleReactToArticle = (
    articleId: string,
    reactionType: 'likes' | 'pawReactions' | 'usefulReactions'
  ) => {
    setArticles((prev) =>
      prev.map((art) =>
        art.id === articleId
          ? { ...art, [reactionType]: art[reactionType] + 1 }
          : art
      )
    );

    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle((prev) =>
        prev ? { ...prev, [reactionType]: prev[reactionType] + 1 } : null
      );
    }
  };

  if (isAdminMode) {
    return (
      <AffiliateAdminPage
        products={products}
        onUpdateProductAffiliate={handleUpdateProductAffiliate}
        onAddNewAffiliateProduct={handleAddNewAffiliateProduct}
        onUpdateProductDetails={handleUpdateProductDetails}
        onDeleteProduct={handleDeleteProduct}
        onSyncAllProducts={handleSyncAllProducts}
        onCloseAdmin={() => setIsAdminMode(false)}
        affiliateClicks={affiliateClicks}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#2D2A26]">
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2A26] text-white px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 animate-fadeIn">
          <span>🐾</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'shop' && (
          <ShopSection
            products={products}
            onSelectProduct={(product) => setSelectedProduct(product)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onTrackAffiliateClick={handleTrackAffiliateClick}
            onOpenAffiliateAdmin={() => setIsAdminMode(true)}
          />
        )}

        {activeTab === 'blog' && (
          <BlogSection
            articles={articles}
            onOpenArticle={(article) => setSelectedArticle(article)}
          />
        )}

        {activeTab === 'guide' && (
          <InteractiveFoodGuide />
        )}
      </main>

      {/* Product Details Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onTrackAffiliateClick={handleTrackAffiliateClick}
      />

      {/* Article Reader & Interactive Comments Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAddComment={handleAddComment}
        onReact={handleReactToArticle}
      />

      {/* Site Footer with hidden admin access */}
      <Footer 
        onNavigate={(tab) => setActiveTab(tab)} 
        onOpenAffiliateAdmin={() => setIsAdminMode(true)}
      />
    </div>
  );
}
