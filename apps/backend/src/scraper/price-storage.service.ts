import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScrapedHotel } from './types';

@Injectable()
export class PriceStorageService {
  private readonly logger = new Logger(PriceStorageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Enregistre un hôtel et ses prix journaliers en gardant l'historique des changements de prix.
   * @param scraped ScrapedHotel (données issues du scraping)
   * @param isMyHotel true si c'est ton propre hôtel, false pour un concurrent
   */
  async saveHotelAndPrices(scraped: ScrapedHotel, isMyHotel = false): Promise<void> {
    // 1. Upsert hotel (par url)
    const dbHotel = await this.prisma.hotel.upsert({
      where: { url: scraped.hotel.url },
      update: {
        ...scraped.hotel,
        isCompetitor: !isMyHotel,
      },
      create: {
        ...scraped.hotel,
        isCompetitor: !isMyHotel,
      },
    });

    // 2. Pour chaque prix journalier, n'insérer que si le prix a changé
    for (const daily of scraped.dailyPrices) {
      const existing = await this.prisma.dailyPrice.findFirst({
        where: {
          hotelId: dbHotel.id,
          roomCategoryId: null, // adapte si tu as la catégorie
          date: new Date(daily.date),
          price: daily.price,
        },
      });
      if (!existing) {
        await this.prisma.dailyPrice.create({
          data: {
            hotelId: dbHotel.id,
            roomCategoryId: null,
            date: new Date(daily.date),
            price: daily.price,
            currency: daily.currency,
            availability: daily.availability,
            scrapedAt: new Date(),
          },
        });
        this.logger.log(`💾 Nouveau prix inséré pour ${scraped.hotel.name} le ${daily.date}: ${daily.price} ${daily.currency}`);
      }
    }
  }
}
