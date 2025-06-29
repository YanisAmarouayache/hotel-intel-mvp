import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Hotel {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  city: string;

  @Field()
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
} 