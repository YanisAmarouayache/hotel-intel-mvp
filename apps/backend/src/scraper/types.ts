import { IsString, IsArray, IsUrl, ArrayMinSize, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export interface HotelData {
  id: number; 
  name: string;
  url: string;
  address?: string;
  city: string;
  starRating?: number;
  userRating?: number;
  reviewCount?: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  isCompetitor?: boolean;
}

export interface RoomCategoryData {
  name: string;
  description?: string;
}

export interface DailyPriceData {
  date: string; // ISO date string
  price: number;
  currency: string;
  availability: boolean;
  roomCategory?: string; // Room category name
}

export interface ScrapedHotel {
  hotel: HotelData;
  roomCategories?: RoomCategoryData[];
  dailyPrices: DailyPriceData[];
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

// DTOs for hotel management
export class CreateHotelDto {
  @ApiProperty({ description: 'Hotel name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Booking.com URL' })
  @IsString()
  @IsUrl()
  url: string;

  @ApiProperty({ description: 'Hotel address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'City where the hotel is located' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Star rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  starRating?: number;

  @ApiProperty({ description: 'User rating (0-10)', required: false })
  @IsOptional()
  @IsNumber()
  userRating?: number;

  @ApiProperty({ description: 'Number of reviews', required: false })
  @IsOptional()
  @IsNumber()
  reviewCount?: number;

  @ApiProperty({ description: 'Hotel description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'List of amenities', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiProperty({ description: 'List of image URLs', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ description: 'Whether this is a competitor hotel', default: true })
  @IsOptional()
  @IsBoolean()
  isCompetitor?: boolean;
}

export class CreateDailyPriceDto {
  @ApiProperty({ description: 'Date for this price (ISO string)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Price for one night' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency code', default: 'EUR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Room availability', default: true })
  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @ApiProperty({ description: 'Room category name', required: false })
  @IsOptional()
  @IsString()
  roomCategory?: string;
} 