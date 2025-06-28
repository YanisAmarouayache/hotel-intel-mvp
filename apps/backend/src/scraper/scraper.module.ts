import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperPlaywrightService } from './scraperPlaywright.service';
import { ScraperController } from './scraper.controller';
import { ScraperPlaywrightController } from './scraperPlaywright.controller';

@Module({
  providers: [ScraperService, ScraperPlaywrightService],
  controllers: [ScraperController, ScraperPlaywrightController],
  exports: [ScraperService, ScraperPlaywrightService],
})
export class ScraperModule {} 