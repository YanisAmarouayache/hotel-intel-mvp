import { Body, Controller, Post, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { PriceStorageService } from './price-storage.service';
import { ScrapeHotelDto, ScrapeBatchDto, ScrapingResult, BatchScrapingResult } from './types';
import scrapeBooking from './scrape-booking';


@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(
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
    @Body() body: ScrapeHotelDto,
    @Query('isMyHotel') isMyHotel?: string
  ) {
    const scrapeResult = await this.scraperService.scrapeHotel(body.url);
    if (!scrapeResult.success || !scrapeResult.data) {
      throw new BadRequestException(scrapeResult.error || 'Scraping failed');
    }
    // Default to false if not provided
    const isMine = isMyHotel === 'true';
    await this.priceStorageService.saveHotelAndPrices(scrapeResult.data, isMine);
    return { success: true, message: 'Scraped and stored successfully', data: scrapeResult.data };
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

  @Post('batch/scrape-and-store')
  @ApiOperation({
    summary: 'Scrape and store multiple hotels from Booking.com URLs',
    description: 'Scrapes and stores data for multiple hotels, preserving price history. Use ?isMyHotel=true for your own hotel.'
  })
  @ApiQuery({
    name: 'isMyHotel',
    required: false,
    type: Boolean,
    description: 'Set to true if these are your own hotels. Defaults to false (competitor).'
  })
  @ApiBody({
    type: ScrapeBatchDto,
    description: 'Array of hotel URLs to scrape and store'
  })
  @ApiResponse({
    status: 200,
    description: 'Batch scraping and storing completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URLs provided or scraping failed'
  })
  @ApiResponse({
    status: 500,
    description: 'Batch scraping or storage failed'
  })
  async scrapeAndStoreBatch(
    @Body() body: ScrapeBatchDto,
    @Query('isMyHotel') isMyHotel?: string
  ) {
    const batchResult = await this.scraperService.scrapeMultipleHotels(body.urls);
    let stored = 0;
    const isMine = isMyHotel === 'true';
    for (const result of batchResult.results) {
      if (result.success && result.data) {
        await this.priceStorageService.saveHotelAndPrices(result.data, isMine);
        stored++;
      }
    }
    return {
      ...batchResult,
      stored,
      message: `Scraped ${batchResult.successfulScrapes} hotels, stored ${stored} in DB.`
    };
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