import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperPuppeteerService } from './scraperPuppeteer.service';
import { ScrapeHotelDto, ScrapeBatchDto } from './types';
import { ScrapingResult, BatchScrapingResult } from './types';

@ApiTags('scraper-puppeteer')
@Controller('scraper-puppeteer')
export class ScraperPuppeteerController {
  constructor(private readonly scraperPuppeteerService: ScraperPuppeteerService) {}

  @Post('hotel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape a single hotel using Puppeteer',
    description: 'Extract hotel details and pricing information from a Booking.com URL using Puppeteer browser automation',
  })
  @ApiResponse({
    status: 200,
    description: 'Hotel data successfully scraped',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            hotel: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                url: { type: 'string' },
                address: { type: 'string' },
                rating: { type: 'number' },
                reviewCount: { type: 'number' },
              },
            },
            pricing: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  price: { type: 'number' },
                  currency: { type: 'string' },
                  availability: { type: 'boolean' },
                  roomType: { type: 'string' },
                  minLengthOfStay: { type: 'number' },
                },
              },
            },
            scrapedAt: { type: 'string' },
          },
        },
        url: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Scraping failed',
  })
  async scrapeHotel(@Body() scrapeHotelDto: ScrapeHotelDto): Promise<ScrapingResult> {
    return this.scraperPuppeteerService.scrapeHotel(scrapeHotelDto.url);
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape multiple hotels using Puppeteer',
    description: 'Extract hotel details and pricing information from multiple Booking.com URLs using Puppeteer browser automation',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch scraping completed',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              error: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        totalHotels: { type: 'number' },
        successfulScrapes: { type: 'number' },
        failedScrapes: { type: 'number' },
        duration: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URLs provided',
  })
  @ApiResponse({
    status: 500,
    description: 'Batch scraping failed',
  })
  async scrapeMultipleHotels(@Body() scrapeBatchDto: ScrapeBatchDto): Promise<BatchScrapingResult> {
    return this.scraperPuppeteerService.scrapeMultipleHotels(scrapeBatchDto.urls);
  }
} 