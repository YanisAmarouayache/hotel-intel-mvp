import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard-stats')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getStats() {
    try {
      const hotelsCount = await this.prisma.hotel.count();
      const avgPrice = await this.prisma.dailyPrice.aggregate({
        _avg: { price: true },
      });
      const priceEvolution = await this.prisma.dailyPrice.groupBy({
        by: ['date'],
        _avg: { price: true },
        orderBy: { date: 'asc' },
      });
      // Uncomment if you have an analysis table
      // const analysesCount = await this.prisma.analysis.count();

      let evolution = 0;
      if (priceEvolution.length > 1) {
        const first = priceEvolution[0]._avg.price ?? 0;
        const last = priceEvolution[priceEvolution.length - 1]._avg.price ?? 0;
        if (first > 0) {
          evolution = ((last - first) / first) * 100;
        }
      }

      return [
        {
          title: 'Hôtels Surveillés',
          value: hotelsCount.toString(),
          icon: 'Hotel',
          color: 'primary.main',
          trend: { value: evolution, isPositive: evolution >= 0 },
        },
        {
          title: 'Prix Moyen',
          value: avgPrice._avg.price ? `€${Math.round(avgPrice._avg.price)}` : 'N/A',
          icon: 'Euro',
          color: 'success.main',
          trend: { value: evolution, isPositive: evolution >= 0 },
        },
        {
          title: 'Évolution Prix',
          value: evolution ? `${evolution > 0 ? '+' : ''}${evolution.toFixed(1)}%` : '0%',
          icon: 'TrendingUp',
          color: 'warning.main',
          trend: { value: evolution, isPositive: evolution >= 0 },
        },
        {
          title: 'Analyses Actives',
          value: '0', // Replace with analysesCount.toString() if available
          icon: 'Analytics',
          color: 'info.main',
        },
      ];
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch dashboard stats');
    }
  }

    @Get('latest-prices')
    async getLatestPrices() {
        const hotels = await this.prisma.hotel.findMany({
            include: {
                dailyPrices: {
                    orderBy: { date: 'desc' },
                    take: 1,
                },
            },
        });
        return hotels.map(hotel => ({
            id: hotel.id,
            name: hotel.name,
            latestPrice: hotel.dailyPrices[0]?.price ?? null,
            latestDate: hotel.dailyPrices[0]?.date ?? null,
        }));
    }
}