import React from 'react';
import { Grid } from '@mui/material';
import HotelCard from '../HotelCard';
import type { Hotel } from '../../types';

interface HotelsGridProps {
  hotels: Hotel[];
  onDelete?: (hotelId: number) => void;
}

const HotelsGrid: React.FC<HotelsGridProps> = ({ hotels, onDelete }) => {
  return (
    <Grid container spacing={3}>
      {hotels.map((hotel) => (
        <Grid item xs={36} sm={24} md={12} key={hotel.id}>
          <HotelCard hotel={hotel}  onDelete={onDelete} />
        </Grid>
      ))}
    </Grid>
  );
};

export default HotelsGrid; 