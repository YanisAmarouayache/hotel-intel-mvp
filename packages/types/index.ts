import { z } from 'zod';

// Hotel schema
export const HotelSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis'),
  city: z.string().min(1, 'La ville est requise'),
  price: z.number().positive('Le prix doit être positif'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Create hotel schema
export const CreateHotelSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  city: z.string().min(1, 'La ville est requise'),
  price: z.number().positive('Le prix doit être positif'),
});

// Update hotel schema
export const UpdateHotelSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Le nom est requis').optional(),
  city: z.string().min(1, 'La ville est requise').optional(),
  price: z.number().positive('Le prix doit être positif').optional(),
});

// Type exports
export type Hotel = z.infer<typeof HotelSchema>;
export type CreateHotel = z.infer<typeof CreateHotelSchema>;
export type UpdateHotel = z.infer<typeof UpdateHotelSchema>;
