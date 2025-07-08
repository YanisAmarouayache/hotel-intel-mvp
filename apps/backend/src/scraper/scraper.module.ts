import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { PriceStorageService } from './price-storage.service';
import { ScraperController } from './scraper.controller';

@Module({
  providers: [ScraperService, PriceStorageService],
  controllers: [ScraperController],
  exports: [ScraperService, PriceStorageService],
})
export class ScraperModule {} 