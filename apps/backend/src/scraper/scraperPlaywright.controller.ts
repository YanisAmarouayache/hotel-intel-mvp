import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScraperPlaywrightService } from './scraperPlaywright.service';
import { ScrapeHotelDto, ScrapeBatchDto } from './types';
import { ScrapingResult, BatchScrapingResult } from './types';

@ApiTags('scraper-playwright')
@Controller('scraper-playwright')
export class ScraperPlaywrightController {
  constructor(private readonly scraperPlaywrightService: ScraperPlaywrightService) {}

  @Post('hotel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape a single hotel using Playwright',
    description: 'Extract hotel details and pricing information from a Booking.com URL using Playwright browser automation (Render-optimized)',
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
    return this.scraperPlaywrightService.scrapeHotel(scrapeHotelDto.url);
  }

  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scrape multiple hotels using Playwright',
    description: 'Extract hotel details and pricing information from multiple Booking.com URLs using Playwright browser automation (Render-optimized)',
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
    return this.scraperPlaywrightService.scrapeMultipleHotels(scrapeBatchDto.urls);
  }
} 