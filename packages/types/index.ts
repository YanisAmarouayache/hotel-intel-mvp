import { z } from 'zod';

export const HotelSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
});

export type Hotel = z.infer<typeof HotelSchema>;
