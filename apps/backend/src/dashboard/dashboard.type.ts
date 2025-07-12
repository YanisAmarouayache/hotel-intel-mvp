import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Trend {
  @Field(() => Float)
  value: number;

  @Field()
  isPositive: boolean;
}

@ObjectType()
export class DashboardStat {
  @Field()
  title: string;

  @Field()
  value: string;

  @Field()
  icon: string;

  @Field()
  color: string;

  @Field(() => Trend, { nullable: true })
  trend?: Trend;
}