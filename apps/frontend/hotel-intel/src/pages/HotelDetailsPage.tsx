import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import { useHotels } from '../hooks/useHotels';

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { hotels } = useHotels();
  const hotel = hotels.find(h => h.id === Number(id));

  if (!hotel) {
    return <Typography>Hôtel introuvable.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{hotel.name}</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>{hotel.city}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{hotel.description}</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item>
            <Chip label={`${hotel.starRating || '-'} étoiles`} color="primary" />
          </Grid>
          <Grid item>
            <Chip label={`${hotel.userRating || '-'} / 10`} color="secondary" />
          </Grid>
          <Grid item>
            <Chip label={`${hotel.reviewCount || 0} avis`} variant="outlined" />
          </Grid>
        </Grid>
        {hotel.amenities && hotel.amenities.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Équipements</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {hotel.amenities.map((amenity, idx) => (
                <Chip key={idx} label={amenity} variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        )}
        {hotel.images && hotel.images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Photos</Typography>
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {hotel.images.map((img, idx) => (
                <Box key={idx} component="img" src={img} alt={`Image ${idx + 1}`} sx={{ width: 160, height: 110, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HotelDetailsPage;
