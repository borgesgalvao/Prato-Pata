export type TargetAudience = 'pet' | 'tutor' | 'duo';

export type ProductCategory = 
  | 'todos'
  | 'snacks-naturais'
  | 'suplementos'
  | 'higiene'
  | 'pet-caes'
  | 'pet-gatos'
  | 'cozinha-saudavel'
  | 'utensilios-ecologicos'
  | 'kits-duo';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  targetAudience: TargetAudience;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  shortDescription: string;
  fullDescription: string;
  highlights: string[];
  specs: {
    materialOuComposicao: string;
    indicacao: string;
    origem: string;
    cuidados: string;
  };
  inStock: boolean;
  featured?: boolean;
  affiliateUrl?: string;
  affiliatePlatform?: 'mercado_livre' | 'outro';
}

export interface AffiliateLinkConfig {
  productId: string;
  mercadoLivreUrl: string;
  isActive: boolean;
  notes?: string;
  clickCount?: number;
  lastUpdated?: string;
}

export interface BlogComment {
  id: string;
  author: string;
  petName?: string;
  date: string;
  content: string;
  likes: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  category: 'nutricao-humana' | 'bem-estar-animal' | 'receitas-compartilhadas' | 'saude-integrada';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  coverImage: string;
  tags: string[];
  likes: number;
  pawReactions: number;
  usefulReactions: number;
  comments: BlogComment[];
}

export interface FoodCheckItem {
  id: string;
  name: string;
  category: 'frutas' | 'vegetais' | 'carnes-proteinas' | 'temperos-ervas' | 'laticinios-graos';
  safeForDogs: 'seguro' | 'com-moderacao' | 'proibido';
  safeForCats: 'seguro' | 'com-moderacao' | 'proibido';
  humanBenefits: string;
  petNotes: string;
  preparationTip: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
