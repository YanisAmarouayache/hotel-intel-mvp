import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HotelModule } from './hotel/hotel.module';
import { ScraperModule } from './scraper/scraper.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
    }),
    PrismaModule,
    HotelModule,
    ScraperModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}