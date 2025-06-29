import axios, { AxiosInstance } from 'axios';
import { ScrapedHotel, ScrapingResult } from './types.js';

export class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async saveHotelData(scrapedHotel: ScrapedHotel): Promise<boolean> {
    try {
      const response = await this.client.post('/api/hotels', {
        name: scrapedHotel.hotel.name,
        booking_url: scrapedHotel.hotel.url,
        address: scrapedHotel.hotel.address,
        user_rating: scrapedHotel.hotel.rating,
        user_rating_count: scrapedHotel.hotel.reviewCount,
        description: scrapedHotel.hotel.description,
        amenities: scrapedHotel.hotel.amenities || [],
      });

      console.log(`✅ Hotel data saved: ${scrapedHotel.hotel.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save hotel data:`, error);
      return false;
    }
  }

  async getHotels(): Promise<any[]> {
    try {
      const response = await this.client.get('/api/hotels');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get hotels:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/health');
      console.log('✅ API connection successful');
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error);
      return false;
    }
  }
} 