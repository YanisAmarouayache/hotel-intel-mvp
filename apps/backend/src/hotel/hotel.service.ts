import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from './hotel.model';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({
      include: {
        dailyPrices: {
          orderBy: {
            date: 'asc',
          },
        },
        roomCategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
      include: {
        dailyPrices: {
          orderBy: {
            date: 'asc',
          },
        },
        roomCategories: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }

  async create(data: { 
    name: string; 
    url: string; 
    city: string; 
    address?: string;
    starRating?: number;
    userRating?: number;
    reviewCount?: number;
    description?: string;
    amenities?: string[];
    images?: string[];
    isCompetitor?: boolean;
  }): Promise<Hotel> {
    return this.prisma.hotel.create({
      data: {
        ...data,
        isCompetitor: data.isCompetitor ?? true, // Default to competitor
        amenities: data.amenities ?? [],
        images: data.images ?? []
      },
      include: {
        dailyPrices: true,
        roomCategories: true,
      },
    });
  }

  async update(id: number, data: { 
    name?: string; 
    url?: string;
    city?: string; 
    address?: string;
    starRating?: number;
    userRating?: number;
    reviewCount?: number;
    description?: string;
    amenities?: string[];
    images?: string[];
    isCompetitor?: boolean;
  }): Promise<Hotel> {
    return this.prisma.hotel.update({
      where: { id },
      data,
      include: {
        dailyPrices: true,
        roomCategories: true,
      },
    });
  }

  async delete(id: number): Promise<Hotel> {
    return this.prisma.hotel.delete({
      where: { id },
      include: {
        dailyPrices: true,
        roomCategories: true,
      },
    });
  }
} 