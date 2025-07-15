import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ScrapedHotel, ScrapingResult } from 'src/scraper/types';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class RoomCategory {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  hotelId: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DailyPrice {
  @Field(() => Int)
  id: number;

  @Field()
  date: Date;

  @Field(() => Float)
  price: number;

  @Field()
  currency: string;

  @Field()
  availability: boolean;

  @Field(() => Int)
  hotelId: number;

  @Field(() => Int, { nullable: true })
  roomCategoryId?: number;

  @Field({ nullable: true })
  roomCategory?: string;

  @Field()
  scrapedAt: Date;
}

@ObjectType()
export class Hotel {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  city: string;

  @Field(() => Float, { nullable: true })
  starRating?: number;

  @Field(() => Float, { nullable: true })
  userRating?: number;

  @Field(() => Int, { nullable: true })
  reviewCount?: number;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  amenities?: string[];

  @Field(() => [String], { nullable: true })
  images?: string[];

  @Field()
  isCompetitor: boolean;

  @Field(() => [DailyPrice], { nullable: true })
  dailyPrices?: DailyPrice[];

  @Field(() => [RoomCategory], { nullable: true })
  roomCategories?: RoomCategory[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => DailyPrice, { nullable: true })
  latestPrice?: DailyPrice;

  @Field(() => DailyPrice, { nullable: true })
  previousPrice?: DailyPrice;

  @Field(() => DailyPrice, { nullable: true })
  latestPriceAtDate?: DailyPrice;

  @Field(() => DailyPrice, { nullable: true })
  previousPriceAtDate?: DailyPrice;
}

@ObjectType()
export class BatchScrapingResultItem {
  @Field(() => Int)
  hotelId: number;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => GraphQLJSON, { nullable: true }) 
  data?: any;
}

@ObjectType()
export class BatchScrapingResult {
  @Field(() => [BatchScrapingResultItem])
  results: BatchScrapingResultItem[];

  @Field(() => Int)
  stored: number;

  @Field()
  message: string;
}
