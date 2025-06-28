import React from 'react';
import { Grid } from '@mui/material';
import HotelCard from '../HotelCard';
import type { Hotel } from '../../hooks/useHotels';

interface HotelsGridProps {
  hotels: Hotel[];
  onBook?: (hotelId: number) => void;
}

const HotelsGrid: React.FC<HotelsGridProps> = ({ hotels, onBook }) => {
  return (
    <Grid container spacing={3}>
      {hotels.map((hotel) => (
        <Grid item xs={12} sm={6} md={4} key={hotel.id}>
          <HotelCard hotel={hotel} onBook={onBook} />
        </Grid>
      ))}
    </Grid>
  );
};

export default HotelsGrid; 