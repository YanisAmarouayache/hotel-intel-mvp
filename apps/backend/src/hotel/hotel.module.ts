import { Module } from '@nestjs/common';
import { HotelResolver } from './hotel.resolver';
import { HotelService } from './hotel.service';
import { ScraperService } from 'src/scraper';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [HotelResolver, HotelService, PrismaService, ScraperService],
})
export class HotelModule {} 