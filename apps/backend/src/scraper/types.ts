import { IsString, IsArray, IsUrl, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  minLengthOfStay?: number;
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

export class ScrapeHotelDto {
  @ApiProperty({
    description: 'URL of the Booking.com hotel page to scrape',
    example: 'https://www.booking.com/hotel/fr/brach-paris.fr.html'
  })
  @IsString()
  @IsUrl()
  url: string;
}

export class ScrapeBatchDto {
  @ApiProperty({
    description: 'Array of Booking.com hotel URLs to scrape',
    example: [
      'https://www.booking.com/hotel/fr/brach-paris.fr.html',
      'https://www.booking.com/hotel/fr/bonne-nouvelle.fr.html'
    ],
    type: [String]
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  urls: string[];
} 