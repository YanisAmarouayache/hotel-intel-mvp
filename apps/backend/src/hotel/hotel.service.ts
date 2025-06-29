import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from './hotel.model';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Hotel[]> {
    return this.prisma.hotel.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Hotel | null> {
    return this.prisma.hotel.findUnique({
      where: { id },
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
    });
  }

  async delete(id: number): Promise<Hotel> {
    return this.prisma.hotel.delete({
      where: { id },
    });
  }
} 