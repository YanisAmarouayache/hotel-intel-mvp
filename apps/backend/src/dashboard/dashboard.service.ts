import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const hotelsCount = await this.prisma.hotel.count();
    const avgPrice = await this.prisma.dailyPrice.aggregate({ _avg: { price: true } });
    const priceEvolution = await this.prisma.dailyPrice.groupBy({
      by: ['date'],
      _avg: { price: true },
      orderBy: { date: 'asc' },
    });
    const totalPrices = await this.prisma.dailyPrice.count();
    const minPrice = await this.prisma.dailyPrice.aggregate({ _min: { price: true } });
    const maxPrice = await this.prisma.dailyPrice.aggregate({ _max: { price: true } });
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayPrices = await this.prisma.dailyPrice.count({
      where: { date: new Date(todayStr) },
    });
    const citiesGroup = await this.prisma.hotel.groupBy({
      by: ['city'],
    });
    const citiesCount = citiesGroup.length;
    const daysGroup = await this.prisma.dailyPrice.groupBy({ by: ['date'] });
    const daysCount = daysGroup.length;
    // const analysesCount = await this.prisma.analysis.count(); // si tu as la table

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
        trend: { value: Number(evolution.toFixed(2)), isPositive: evolution >= 0 },
      },
      {
        title: 'Villes couvertes',
        value: citiesCount.toString(),
        icon: 'Hotel',
        color: 'secondary.main',
      },
      {
        title: 'Prix Moyen',
        value: avgPrice._avg.price ? `€${Math.round(avgPrice._avg.price)}` : 'N/A',
        icon: 'Euro',
        color: 'success.main',
        trend: { value: Number(evolution.toFixed(2)), isPositive: evolution >= 0 },
      },
      {
        title: 'Prix Minimum',
        value: minPrice._min.price ? `€${minPrice._min.price}` : 'N/A',
        icon: 'Euro',
        color: 'info.main',
      },
      {
        title: 'Prix Maximum',
        value: maxPrice._max.price ? `€${maxPrice._max.price}` : 'N/A',
        icon: 'Euro',
        color: 'warning.main',
      },
      {
        title: 'Prix du jour',
        value: todayPrices.toString(),
        icon: 'TrendingUp',
        color: 'secondary.main',
      },
      {
        title: 'Nombre total de prix',
        value: totalPrices.toString(),
        icon: 'Analytics',
        color: 'info.main',
      },
      {
        title: 'Évolution Prix',
        value: evolution ? `${evolution > 0 ? '+' : ''}${evolution.toFixed(1)}%` : '0%',
        icon: 'TrendingUp',
        color: 'warning.main',
        trend: { value: evolution.toFixed(4), isPositive: evolution >= 0 },
      },
      {
        title: 'Analyses Actives',
        value: '0', // Remplace par analysesCount.toString() si tu as la table
        icon: 'Analytics',
        color: 'info.main',
      },
    ];
  }
}