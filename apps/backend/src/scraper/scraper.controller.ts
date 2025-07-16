import { Body, Controller, Post, Get, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { PriceStorageService } from './price-storage.service';
import { ScrapeHotelDto, ScrapeBatchDto, ScrapeBatchByIdDto, ScrapingResult, BatchScrapingResult } from './types';
import scrapeBooking from './scrape-booking';
import { PrismaService } from '../prisma/prisma.service'; // Adjust the path as needed

const batchProgress: Record<string, {
  total: number;
  done: number;
  hotels: { id: string; name: string; url: string }[];
  current?: { index: number; hotelId: string; name: string; url: string };
  results: { hotelId: string; name: string; url: string; success: boolean; error?: string; data?: any }[];
  finalResult?: any;
}> = {};

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scraperService: ScraperService,
    private readonly priceStorageService: PriceStorageService
  ) {}


  @Post('hotel')
  @ApiOperation({
    summary: 'Scrape hotel data from a Booking.com URL',
    description: 'Extracts hotel information including name, address, rating, description, amenities, images, and pricing data from a Booking.com hotel page.'
  })
  @ApiBody({
    type: ScrapeHotelDto,
    description: 'URL of the hotel page to scrape'
  })
  @ApiResponse({
    status: 200,
    description: 'Hotel data scraped successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided'
  })
  @ApiResponse({
    status: 500,
    description: 'Scraping failed'
  })
  async scrapeHotel(@Body() body: ScrapeHotelDto): Promise<ScrapingResult> {
    return this.scraperService.scrapeHotel(body.url);
  }

  @Post('hotel/scrape-and-store')
  @ApiOperation({
    summary: 'Scrape and store hotel data from a Booking.com URL',
    description: 'Scrapes hotel data and stores it in the database, preserving price history. Use ?isMyHotel=true for your own hotel.'
  })
  @ApiQuery({
    name: 'isMyHotel',
    required: false,
    type: Boolean,
    description: 'Set to true if this is your own hotel. Defaults to false (competitor).'
  })
  @ApiBody({
    type: ScrapeHotelDto,
    description: 'URL of the hotel page to scrape and store'
  })
  @ApiResponse({
    status: 200,
    description: 'Hotel data scraped and stored successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided or scraping failed'
  })
  @ApiResponse({
    status: 500,
    description: 'Scraping or storage failed'
  })
  async scrapeAndStoreHotel(
    @Query('hotelId') hotelId: string,
    @Query('isMyHotel') isMyHotel?: string,
  ) {

    const dbHotel = await this.prisma.hotel.findUnique({
      where: { id: Number(hotelId) },
    });
    if (!dbHotel) {
      throw new NotFoundException('Hotel not found');
    }

    const scrapeResult = await this.scraperService.scrapeHotel(dbHotel.url);
    if (!scrapeResult.success) {
      throw new BadRequestException(scrapeResult.error || 'Scraping failed');
    }
    await this.priceStorageService.saveHotelPricesOnly(dbHotel.id, scrapeResult.dailyPrices);
    return { success: true, message: 'Scraped and stored successfully', data: scrapeResult };
  }


  @Post('batch')
  @ApiOperation({
    summary: 'Scrape multiple hotels from Booking.com URLs',
    description: 'Extracts data from multiple hotel pages with a 1-second delay between requests.'
  })
  @ApiBody({
    type: ScrapeBatchDto,
    description: 'Array of hotel URLs to scrape'
  })
  @ApiResponse({
    status: 200,
    description: 'Batch scraping completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URLs provided'
  })
  @ApiResponse({
    status: 500,
    description: 'Batch scraping failed'
  })
  async scrapeBatch(@Body() body: ScrapeBatchDto): Promise<BatchScrapingResult> {
    return this.scraperService.scrapeMultipleHotels(body.urls);
  }
  // batchProgress is now a module-level variable above the class


  @Post('batch/scrape-and-store')
  @ApiOperation({
    summary: 'Scrape and store multiple hotels by IDs',
    description: 'Scrapes and stores data for multiple hotels by their IDs, preserving price history. Use ?isMyHotel=true for your own hotels.'
  })
  @ApiQuery({
    name: 'isMyHotel',
    required: false,
    type: Boolean,
    description: 'Set to true if these are your own hotels. Defaults to false (competitor).'
  })
  @ApiBody({
    type: ScrapeBatchByIdDto,
    description: 'Array of hotel IDs to scrape and store'
  })
  @ApiResponse({
    status: 200,
    description: 'Batch scraping and storing completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid hotel IDs provided or scraping failed'
  })
  @ApiResponse({
    status: 500,
    description: 'Batch scraping or storage failed'
  })
  async scrapeAndStoreBatch(
    @Body() body: ScrapeBatchByIdDto,
    @Query('isMyHotel') isMyHotel?: string
  ) {
    const batchId = Date.now().toString() + Math.random().toString(36).slice(2);
    const hotels = await this.prisma.hotel.findMany({
      where: { id: { in: body.hotelIds } },
      select: { id: true, name: true, url: true }
    });
    batchProgress[batchId] = {
      total: hotels.length,
      done: 0,
      hotels: hotels.map((hotel, idx) => ({
        id: hotel.id.toString(),
        name: hotel.name,
        url: hotel.url
      })),
      results: []
    };

    // Lance le traitement en tâche de fond
    (async () => {
      let stored = 0;
      let results: any[] = [];
      for (let i = 0; i < hotels.length; i++) {
        const hotel = hotels[i];
        batchProgress[batchId].current = { index: i, hotelId: hotel.id.toString(), name: hotel.name, url: hotel.url };
        const scrapeResult = await this.scraperService.scrapeHotel(hotel.url);
        if (scrapeResult.success) {
          await this.priceStorageService.saveHotelPricesOnly(hotel.id, scrapeResult.dailyPrices);
          stored++;
          results.push({ hotelId: hotel.id, name: hotel.name, url: hotel.url, success: true, data: scrapeResult });
        } else {
          results.push({ hotelId: hotel.id, name: hotel.name, url: hotel.url, success: false, error: scrapeResult.error });
        }
        batchProgress[batchId].done++;
        batchProgress[batchId].results = results;
      }
      batchProgress[batchId].finalResult = {
        batchId,
        stored,
        results,
        message: `Scraped and stored ${stored} hotels out of ${hotels.length}.`
      };
      delete batchProgress[batchId].current;
    })();

    // Retourne immédiatement le batchId
    return { batchId };
  }

  @Get('batch/progress')
  async getBatchProgress(@Query('batchId') batchId: string) {
    return batchProgress[batchId] || null;
  }

  @Get('scrapmyhotelfrombooking')
  async scrapMyHotelFromBooking(@Query('url') url: string) {
    if (!url || !url.includes('booking.com')) {
      throw new BadRequestException('URL Booking.com invalide');
    }
    try {
      const data = await scrapeBooking(url);
      return data;
    } catch (e) {
      throw new BadRequestException('Erreur lors du scraping: ' + e.message);
    }
  }
}