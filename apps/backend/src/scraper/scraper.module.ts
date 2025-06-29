import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperPuppeteerService } from './scraperPuppeteer.service';
import { ScraperController } from './scraper.controller';
import { ScraperPuppeteerController } from './scraperPuppeteer.controller';

@Module({
  providers: [ScraperService, ScraperPuppeteerService],
  controllers: [ScraperController, ScraperPuppeteerController],
  exports: [ScraperService, ScraperPuppeteerService],
})
export class ScraperModule {} 