import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

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
} 