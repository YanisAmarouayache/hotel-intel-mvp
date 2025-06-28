export interface HotelData {
  name: string;
  url: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
}

export interface PricingData {
  date: string;
  price: number;
  currency: string;
  availability: boolean;
  roomType?: string;
}

export interface ScrapedHotel {
  hotel: HotelData;
  pricing: PricingData[];
  scrapedAt: string;
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedHotel;
  error?: string;
  url: string;
}

export interface BatchScrapingResult {
  results: ScrapingResult[];
  totalHotels: number;
  successfulScrapes: number;
  failedScrapes: number;
  duration: number;
} 