import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { ScrapeHotelDto, ScrapeBatchDto, ScrapingResult, BatchScrapingResult } from './types';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

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

  @Post('batch')
  @ApiOperation({ 
    summary: 'Scrape multiple hotels from Booking.com URLs',
    description: 'Extracts data from multiple hotel pages with a 2-second delay between requests to be respectful to the server.'
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
} 