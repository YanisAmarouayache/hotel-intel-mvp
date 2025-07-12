import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent } from '@nestjs/graphql';
import { HotelService } from './hotel.service';
import { DailyPrice, Hotel } from './hotel.model';
import { PrismaService } from '../prisma/prisma.service';
import { endOfDay, startOfDay } from 'date-fns';

@Resolver(() => Hotel)
export class HotelResolver {
  constructor(private readonly hotelService: HotelService, private readonly prisma: PrismaService) { }

  @Query(() => [Hotel])
  async hotels(): Promise<Hotel[]> {
    return this.hotelService.findAll();
  }

  @Query(() => Hotel, { nullable: true })
  async hotel(@Args('id', { type: () => Int }) id: number): Promise<Hotel | null> {
    return this.hotelService.findOne(id);
  }

  @Mutation(() => Hotel)
  async createHotel(
    @Args('name') name: string,
    @Args('url') url: string,
    @Args('city') city: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('starRating', { nullable: true }) starRating?: number,
    @Args('userRating', { nullable: true }) userRating?: number,
    @Args('reviewCount', { type: () => Int,  nullable: true }) reviewCount?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('amenities', { type: () => [String], nullable: true }) amenities?: string[],
    @Args('images', { type: () => [String], nullable: true }) images?: string[],
    @Args('isCompetitor', { nullable: true }) isCompetitor?: boolean,
  ): Promise<Hotel> {
    return this.hotelService.create({ 
      name, 
      url, 
      city, 
      address, 
      starRating, 
      userRating, 
      reviewCount, 
      description, 
      amenities, 
      images, 
      isCompetitor 
    });
  }

  @Mutation(() => Hotel)
  async updateHotel(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('url', { nullable: true }) url?: string,
    @Args('city', { nullable: true }) city?: string,
    @Args('address', { nullable: true }) address?: string,
    @Args('starRating', { nullable: true }) starRating?: number,
    @Args('userRating', { nullable: true }) userRating?: number,
    @Args('reviewCount', { type: () => Int, nullable: true }) reviewCount?: number,
    @Args('description', { nullable: true }) description?: string,
    @Args('amenities', { type: () => [String], nullable: true }) amenities?: string[],
    @Args('images', { type: () => [String], nullable: true }) images?: string[],
    @Args('isCompetitor', { nullable: true }) isCompetitor?: boolean,
  ): Promise<Hotel> {
    return this.hotelService.update(id, { 
      name, 
      url, 
      city, 
      address, 
      starRating, 
      userRating, 
      reviewCount, 
      description, 
      amenities, 
      images, 
      isCompetitor 
    });
  }

  @Mutation(() => Hotel)
  async deleteHotel(@Args('id', { type: () => Int }) id: number): Promise<Hotel> {
    return this.hotelService.delete(id);
  }

  @ResolveField('latestPrice', () => DailyPrice, { nullable: true })
  async getLatestPrice(@Parent() hotel: Hotel) {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    return this.prisma.dailyPrice.findFirst({
      where: {
        hotelId: hotel.id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { scrapedAt: 'desc' },
    });
  }

  @ResolveField('previousPrice', () => DailyPrice, { nullable: true })
  async getPreviousPrice(@Parent() hotel: Hotel) {
    const today = startOfDay(new Date());
    return this.prisma.dailyPrice.findFirst({
      where: {
        hotelId: hotel.id,
        date: { lt: today },
      },
      orderBy: { date: 'desc' },
    });
  }
}