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

  async create(data: { name: string; city: string; price: number }): Promise<Hotel> {
    return this.prisma.hotel.create({
      data,
    });
  }

  async update(id: number, data: { name?: string; city?: string; price?: number }): Promise<Hotel> {
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