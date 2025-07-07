// Types pour les prix quotidiens
export interface DailyPrice {
  id: number;
  date: string;
  price: number;
  currency: string;
  availability: boolean;
  hotelId: number;
  roomCategoryId?: number;
  scrapedAt: string;
}

// Types pour les catégories de chambres
export interface RoomCategory {
  id: number;
  name: string;
  description?: string;
  hotelId: number;
  createdAt: string;
  updatedAt: string;
}

// Types pour les hôtels
export interface Hotel {
  id: number;
  name: string;
  url: string;
  city: string;
  address?: string;
  starRating?: number;
  userRating?: number;
  reviewCount?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  isCompetitor: boolean;
  dailyPrices?: DailyPrice[];
  roomCategories?: RoomCategory[];
  createdAt: string;
  updatedAt: string;
}

// Types pour les compétiteurs
export interface Competitor {
  id: number;
  name: string;
  city: string;
  bookingUrl: string;
  currentPrice: number;
  starRating: number;
  userRating: number;
  amenities: string[];
  lastUpdated: string;
}

// Types pour les statistiques
export interface DashboardStats {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Types pour les événements
export interface Event {
  id: number;
  name: string;
  city: string;
  startDate: string;
  endDate: string;
  type: 'conference' | 'festival' | 'sport' | 'other';
  impact: 'low' | 'medium' | 'high';
}

// Types pour les critères de pondération
export interface CriteriaWeight {
  id: number;
  name: string;
  summerWeight: number;
  winterWeight: number;
  springWeight: number;
  autumnWeight: number;
}

// Types pour les recommandations de yield
export interface YieldRecommendation {
  id: number;
  type: 'pricing' | 'discount' | 'promotion';
  message: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  createdAt: string;
} 