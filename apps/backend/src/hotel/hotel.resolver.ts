import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { HotelService } from './hotel.service';
import { Hotel } from './hotel.model';

@Resolver(() => Hotel)
export class HotelResolver {
  constructor(private readonly hotelService: HotelService) {}

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
    @Args('city') city: string,
    @Args('price') price: number,
  ): Promise<Hotel> {
    return this.hotelService.create({ name, city, price });
  }

  @Mutation(() => Hotel)
  async updateHotel(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { nullable: true }) name?: string,
    @Args('city', { nullable: true }) city?: string,
    @Args('price', { nullable: true }) price?: number,
  ): Promise<Hotel> {
    return this.hotelService.update(id, { name, city, price });
  }

  @Mutation(() => Hotel)
  async deleteHotel(@Args('id', { type: () => Int }) id: number): Promise<Hotel> {
    return this.hotelService.delete(id);
  }
} 