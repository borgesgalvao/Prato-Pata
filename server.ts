import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static serving for user-uploaded media (/updates directory)
const updatesDirPath = path.join(process.cwd(), 'public', 'updates');
if (!fs.existsSync(updatesDirPath)) {
  fs.mkdirSync(updatesDirPath, { recursive: true });
}
app.use('/updates', express.static(updatesDirPath));

// Legacy /uploads static serving fallback
const uploadsDirPath = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDirPath)) {
  fs.mkdirSync(uploadsDirPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsDirPath));

// Static serving for persistent catalog data (/data directory)
const dataDirPath = path.join(process.cwd(), 'public', 'data');
if (!fs.existsSync(dataDirPath)) {
  fs.mkdirSync(dataDirPath, { recursive: true });
}
app.use('/data', express.static(dataDirPath));

// ==========================================
// Persistent Products Catalog File Handlers
// ==========================================
function readProductsCatalog(): any[] {
  const publicJsonPath = path.join(process.cwd(), 'public', 'data', 'products.json');
  if (fs.existsSync(publicJsonPath)) {
    try {
      const content = fs.readFileSync(publicJsonPath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.warn('Error reading products.json:', e);
    }
  }
  return [];
}

function saveProductsCatalog(products: any[]) {
  const publicDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicJsonPath = path.join(publicDir, 'products.json');
  fs.writeFileSync(publicJsonPath, JSON.stringify(products, null, 2), 'utf-8');

  // Also update dist/data/products.json if dist folder exists
  const distDir = path.join(process.cwd(), 'dist', 'data');
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    try {
      fs.writeFileSync(path.join(distDir, 'products.json'), JSON.stringify(products, null, 2), 'utf-8');
    } catch (e) {}
  }

  // Also update src/data/products.ts so future Vite builds automatically embed latest products
  try {
    const tsCode = `import { Product } from '../types';\n\nexport const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'products.ts'), tsCode, 'utf-8');
  } catch (e) {
    console.warn('Error syncing src/data/products.ts:', e);
  }
}

// GET /api/products: Returns products list from persistent storage
app.get('/api/products', (req, res) => {
  const products = readProductsCatalog();
  res.json({ success: true, products });
});

// POST /api/products: Add or update a product in persistent storage
app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  if (!newProduct || !newProduct.id) {
    res.status(400).json({ success: false, error: 'Dados inválidos do produto.' });
    return;
  }

  const list = readProductsCatalog();
  const existingIdx = list.findIndex((p: any) => p.id === newProduct.id);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...newProduct };
  } else {
    list.unshift(newProduct);
  }

  saveProductsCatalog(list);
  res.json({ success: true, product: newProduct, count: list.length });
});

// POST /api/products/sync-all: Overwrite the entire catalog with new array
app.post('/api/products/sync-all', (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    res.status(400).json({ success: false, error: 'Array de produtos esperado.' });
    return;
  }

  saveProductsCatalog(products);
  res.json({ success: true, count: products.length });
});

// DELETE /api/products/:id: Delete a product from persistent storage
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const list = readProductsCatalog();
  const updatedList = list.filter((p: any) => p.id !== id);
  saveProductsCatalog(updatedList);
  res.json({ success: true, count: updatedList.length });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Prato e Pata' });
});

// Gemini Client Lazy Initializer
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Customer Support Info Endpoint (WhatsApp: 31992141182)
app.get('/api/support-info', (req, res) => {
  res.json({
    channel: 'whatsapp',
    phone: '31992141182',
    formattedPhone: '(31) 99214-1182',
    link: 'https://wa.me/5531992141182',
  });
});

// Orders creation endpoint
app.post('/api/orders', (req, res) => {
  const { orderId, tutorName, total, items } = req.body;
  res.json({
    success: true,
    orderId: orderId || `PP-${Date.now()}`,
    message: 'Pedido registrado com sucesso no sistema Prato & Pata',
  });
});

// Mercado Livre Affiliate Links storage in memory and file fallback
interface StoredAffiliate {
  productId: string;
  affiliateUrl: string;
  isActive: boolean;
  clicks?: number;
}

let affiliateLinksMap: Record<string, StoredAffiliate> = {
  'prod-1': {
    productId: 'prod-1',
    affiliateUrl: 'https://mercadolivre.com.br/sec/pratoepata-petisco-desidratado',
    isActive: true,
    clicks: 14,
  },
  'prod-2': {
    productId: 'prod-2',
    affiliateUrl: 'https://mercadolivre.com.br/sec/pratoepata-comedouro-ceramica',
    isActive: true,
    clicks: 22,
  },
  'prod-3': {
    productId: 'prod-3',
    affiliateUrl: 'https://mercadolivre.com.br/sec/pratoepata-balanca-precisao',
    isActive: true,
    clicks: 31,
  },
  'prod-5': {
    productId: 'prod-5',
    affiliateUrl: 'https://mercadolivre.com.br/sec/pratoepata-marmita-borossilicato',
    isActive: true,
    clicks: 9,
  },
};

// GET affiliate links
app.get('/api/affiliates', (req, res) => {
  res.json({ affiliates: affiliateLinksMap });
});

// POST affiliate links update
app.post('/api/affiliates', (req, res) => {
  const { productId, affiliateUrl, isActive } = req.body;
  if (!productId) {
    res.status(400).json({ error: 'productId é obrigatório' });
    return;
  }

  affiliateLinksMap[productId] = {
    productId,
    affiliateUrl: affiliateUrl || '',
    isActive: isActive !== undefined ? isActive : Boolean(affiliateUrl),
    clicks: affiliateLinksMap[productId]?.clicks || 0,
  };

  res.json({ success: true, updated: affiliateLinksMap[productId] });
});

// POST affiliate link click tracking
app.post('/api/affiliates/click', (req, res) => {
  const { productId } = req.body;
  if (productId && affiliateLinksMap[productId]) {
    affiliateLinksMap[productId].clicks = (affiliateLinksMap[productId].clicks || 0) + 1;
    res.json({ success: true, clicks: affiliateLinksMap[productId].clicks });
    return;
  }
  res.json({ success: true });
});

// Helper to decode HTML entities and whitespace
function cleanScrapedText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// POST endpoint to scrape product details from Mercado Livre
app.post('/api/scrape-mercadolivre', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ success: false, error: 'URL do produto é obrigatória' });
      return;
    }

    let rawUrl = url.trim();
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    let resolvedUrl = rawUrl;
    let html = '';

    // Follow redirects and fetch page headers/body
    try {
      const response = await fetch(rawUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
      });

      resolvedUrl = response.url || rawUrl;
      if (response.ok) {
        html = await response.text();
      }
    } catch (fetchErr) {
      console.warn('Direct fetch error, will proceed to URL extraction fallback:', fetchErr);
    }

    // Identify MLB item ID if present in rawUrl, resolvedUrl, or HTML
    let mlbId: string | null = null;
    const mlbMatch =
      resolvedUrl.match(/MLB-?(\d{7,15})/i) ||
      rawUrl.match(/MLB-?(\d{7,15})/i) ||
      html.match(/MLB-?(\d{7,15})/i) ||
      html.match(/"item_id"\s*:\s*"MLB(\d{7,15})"/i) ||
      html.match(/items\/MLB(\d{7,15})/i);

    if (mlbMatch && mlbMatch[1]) {
      mlbId = `MLB${mlbMatch[1]}`;
    }

    let title = '';
    let price: number | null = null;
    let image = '';
    let description = '';
    let source: 'ml_api' | 'ml_html' | 'ml_fallback' = 'ml_fallback';

    // Step 1: If MLB ID exists, query official Mercado Livre public items API
    if (mlbId) {
      try {
        const itemRes = await fetch(`https://api.mercadolibre.com/items/${mlbId}`, {
          headers: { 'Accept': 'application/json' },
        });

        if (itemRes.ok) {
          const itemData = await itemRes.json();
          if (itemData.title) {
            title = cleanScrapedText(itemData.title);
          }
          if (typeof itemData.price === 'number') {
            price = itemData.price;
          }
          if (Array.isArray(itemData.pictures) && itemData.pictures.length > 0) {
            image = itemData.pictures[0]?.secure_url || itemData.pictures[0]?.url;
          } else if (itemData.thumbnail) {
            image = itemData.thumbnail.replace('-I.jpg', '-O.jpg').replace('http://', 'https://');
          }
          source = 'ml_api';

          // Attempt to fetch item description
          try {
            const descRes = await fetch(`https://api.mercadolibre.com/items/${mlbId}/description`, {
              headers: { 'Accept': 'application/json' },
            });
            if (descRes.ok) {
              const descData = await descRes.json();
              if (descData.plain_text) {
                description = cleanScrapedText(descData.plain_text);
              }
            }
          } catch (descErr) {
            console.warn('Description fetch non-fatal error:', descErr);
          }
        }
      } catch (apiErr) {
        console.warn('Mercado Livre public API request non-fatal error:', apiErr);
      }
    }

    // Step 2: Fallback to HTML meta tags and structured schema if API missed any field
    if (html && (!title || !image || price === null || !description)) {
      // Title extraction
      if (!title) {
        const ogTitle =
          html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
        if (ogTitle && ogTitle[1]) {
          title = cleanScrapedText(ogTitle[1]);
        } else {
          const pageTitle = html.match(/<title>([^<]+)<\/title>/i);
          if (pageTitle && pageTitle[1]) {
            title = cleanScrapedText(pageTitle[1].split('|')[0]);
          }
        }
      }

      // Image extraction
      if (!image) {
        const ogImage =
          html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+property=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
        if (ogImage && ogImage[1]) {
          image = ogImage[1];
        } else {
          const mlImg =
            html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[^\s"'<>]+\.webp/i) ||
            html.match(/https:\/\/http2\.mlstatic\.com\/D_NQ_NP_[^\s"'<>]+\.jpg/i);
          if (mlImg && mlImg[0]) {
            image = mlImg[0];
          }
        }
      }

      // Price extraction
      if (price === null) {
        const metaPrice =
          html.match(/<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+itemprop=["']price["']\s+content=["']([^"']+)["']/i);
        if (metaPrice && metaPrice[1]) {
          const parsed = parseFloat(metaPrice[1].replace(',', '.'));
          if (!isNaN(parsed) && parsed > 0) {
            price = parsed;
          }
        }
      }

      // Check Schema JSON-LD for price
      if (price === null) {
        const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = jsonLdRegex.exec(html)) !== null) {
          try {
            const data = JSON.parse(match[1]);
            const offers = data.offers || data.hasOfferCatalog?.itemListElement;
            if (offers) {
              const offerPrice = Array.isArray(offers) ? offers[0]?.price : offers?.price;
              if (offerPrice) {
                const parsed = parseFloat(String(offerPrice).replace(',', '.'));
                if (!isNaN(parsed) && parsed > 0) {
                  price = parsed;
                  break;
                }
              }
            }
            if (data.price) {
              const parsed = parseFloat(String(data.price).replace(',', '.'));
              if (!isNaN(parsed) && parsed > 0) {
                price = parsed;
                break;
              }
            }
          } catch (e) {}
        }
      }

      // Check Andes UI classes in HTML for price
      if (price === null) {
        const fractionMatch = html.match(/class=["'][^"']*andes-money-amount__fraction[^"']*["']>([^<]+)<\/span>/i);
        const centsMatch = html.match(/class=["'][^"']*andes-money-amount__cents[^"']*["']>([^<]+)<\/span>/i);
        if (fractionMatch && fractionMatch[1]) {
          const rawNum = fractionMatch[1].replace(/\./g, '');
          const cents = centsMatch && centsMatch[1] ? `.${centsMatch[1]}` : '.00';
          const parsed = parseFloat(`${rawNum}${cents}`);
          if (!isNaN(parsed) && parsed > 0) {
            price = parsed;
          }
        }
      }

      // Description extraction
      if (!description) {
        const ogDesc =
          html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        if (ogDesc && ogDesc[1]) {
          description = cleanScrapedText(ogDesc[1]);
        }
      }

      if (title || image) {
        source = 'ml_html';
      }
    }

    // Step 3: Polish and normalize extracted fields
    if (title) {
      title = title
        .replace(/\s*\|\s*Mercado\s*Livre.*$/i, '')
        .replace(/\s*\|\s*Frete\s*gr[áa]tis.*$/i, '')
        .replace(/\s*\|\s*Parcelamento\s*sem\s*juros.*$/i, '')
        .trim();
    }

    // If title was still not found, derive readable title from URL slug
    if (!title) {
      try {
        const parsed = new URL(resolvedUrl);
        const parts = parsed.pathname.split('/').filter(Boolean);
        const last = parts[parts.length - 1] || '';
        if (last && !last.startsWith('MLB')) {
          title = last
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .trim();
        }
      } catch (e) {}
    }

    if (!title) {
      title = 'Produto Selecionado Mercado Livre';
    }

    if (!price || price <= 0) {
      price = 69.90;
    }

    if (!image) {
      image = 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?auto=format&fit=crop&w=800&q=80';
    }

    // Truncate and clean description to readable length
    if (!description) {
      description = `Produto de alta qualidade selecionado no Mercado Livre. Indicado para a alimentação, saúde e bem-estar animal e de seus tutores. Curadoria Prato & Pata.`;
    } else if (description.length > 320) {
      description = description.substring(0, 310) + '...';
    }

    // Step 4: Infer targetAudience & category from text
    const textCorpus = `${title} ${description}`.toLowerCase();
    let targetAudience: 'pet' | 'tutor' | 'duo' = 'pet';
    let category: string = 'snacks-naturais';

    const petKeywords = [
      'cão', 'caes', 'cachorro', 'gato', 'felino', 'pet', 'mordedor',
      'ração', 'antipulgas', 'bifinho', 'petisco', 'coleira', 'comedouro',
      'desidratado', 'probiótico', 'brinquedo pet', 'tapete higiênico'
    ];
    const tutorKeywords = [
      'panela', 'cozinha', 'marmita', 'balança', 'vidro', 'airfryer',
      'pote', 'silicone', 'chá', 'facas', 'tutor', 'fitness', 'saudável',
      'borossilicato', 'cerâmica cozinha', 'frigideira'
    ];

    const petScore = petKeywords.filter((k) => textCorpus.includes(k)).length;
    const tutorScore = tutorKeywords.filter((k) => textCorpus.includes(k)).length;

    if (petScore > 0 && tutorScore > 0) {
      targetAudience = 'duo';
      category = 'kits-duo';
    } else if (tutorScore > petScore) {
      targetAudience = 'tutor';
      if (
        textCorpus.includes('marmita') ||
        textCorpus.includes('pote') ||
        textCorpus.includes('silicone') ||
        textCorpus.includes('vidro') ||
        textCorpus.includes('borossilicato')
      ) {
        category = 'utensilios-ecologicos';
      } else {
        category = 'cozinha-saudavel';
      }
    } else {
      targetAudience = 'pet';
      if (textCorpus.includes('gato') || textCorpus.includes('felino')) {
        category = 'pet-gatos';
      } else if (
        textCorpus.includes('petisco') ||
        textCorpus.includes('snack') ||
        textCorpus.includes('bifinho') ||
        textCorpus.includes('desidratado')
      ) {
        category = 'snacks-naturais';
      } else {
        category = 'pet-caes';
      }
    }

    res.json({
      success: true,
      data: {
        title,
        price,
        priceFormatted: price.toFixed(2).replace('.', ','),
        image,
        description,
        targetAudience,
        category,
        mlbId,
        source,
        affiliateUrl: rawUrl,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/scrape-mercadolivre:', error);
    res.status(500).json({
      success: false,
      error: 'Ocorreu um erro ao processar o link do Mercado Livre.',
    });
  }
});

// ==========================================
// User Image Upload & Media Bank Endpoints
// ==========================================

// POST /api/upload-image: Receive Base64 image from user's computer
app.post('/api/upload-image', async (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ success: false, error: 'Nenhuma imagem enviada ou formato inválido.' });
      return;
    }

    // Extract mime type and base64 payload
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';
      else ext = 'jpg';
    } else {
      base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const updatesDir = path.join(process.cwd(), 'public', 'updates');
    if (!fs.existsSync(updatesDir)) {
      fs.mkdirSync(updatesDir, { recursive: true });
    }

    const cleanBaseName = (filename || 'imagem')
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 40) || 'foto';

    const uniqueFilename = `${Date.now()}-${cleanBaseName}.${ext}`;
    const filePath = path.join(updatesDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    // Also mirror to uploadsDir for backward compatibility with any earlier references
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      try {
        fs.writeFileSync(path.join(uploadsDir, uniqueFilename), buffer);
      } catch (e) {
        // ignore mirror error
      }
    }

    const imageUrl = `/updates/${uniqueFilename}`;

    // Update manifest.json in /updates
    const manifestPath = path.join(updatesDir, 'manifest.json');
    let manifest: any[] = [];
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      } catch (e) {
        manifest = [];
      }
    }

    const newItem = {
      id: `img-${Date.now()}`,
      filename: uniqueFilename,
      url: imageUrl,
      originalName: filename || uniqueFilename,
      sizeBytes: buffer.length,
      mimeType,
      uploadedAt: new Date().toISOString(),
    };

    manifest.unshift(newItem);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    res.json({
      success: true,
      data: newItem,
      url: imageUrl,
    });
  } catch (error: any) {
    console.error('Error in /api/upload-image:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar e salvar a imagem no servidor.',
    });
  }
});

// GET /api/uploaded-images: List all images saved in media library (/updates directory)
app.get('/api/uploaded-images', (req, res) => {
  try {
    const updatesDir = path.join(process.cwd(), 'public', 'updates');
    const manifestPath = path.join(updatesDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      res.json({ success: true, data: manifest });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao listar banco de imagens.' });
  }
});

// DELETE /api/upload-image/:filename: Delete an image from media library (/updates directory)
app.delete('/api/upload-image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const updatesDir = path.join(process.cwd(), 'public', 'updates');
    const targetFile = path.join(updatesDir, safeFilename);

    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }

    // Also remove from legacy uploads dir if exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const legacyTargetFile = path.join(uploadsDir, safeFilename);
    if (fs.existsSync(legacyTargetFile)) {
      try {
        fs.unlinkSync(legacyTargetFile);
      } catch (e) {
        // ignore
      }
    }

    const manifestPath = path.join(updatesDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        manifest = manifest.filter((item: any) => item.filename !== safeFilename);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      } catch (e) {
        // ignore
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao remover imagem.' });
  }
});

async function startServer() {
  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Prato e Pata server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
