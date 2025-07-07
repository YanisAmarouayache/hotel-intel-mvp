import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { LocationOn, Euro, CalendarToday } from '@mui/icons-material';
import type { Hotel } from '../../types';

interface HotelCardProps {
  hotel: Hotel;
  onBook?: (hotelId: number) => void;
  onDelete?: (hotelId: number) => void;
}

import DeleteIcon from '@mui/icons-material/Delete';
const HotelCard: React.FC<HotelCardProps> = ({ hotel, onBook, onDelete }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(hotel.id);
  };
  const handleBookClick = () => {
    onBook?.(hotel.id);
  };

  // Obtenir le prix le plus récent
  const getLatestPrice = () => {
    if (!hotel.dailyPrices || hotel.dailyPrices.length === 0) {
      return null;
    }
    
    // Trier par date et prendre le plus récent
    const sortedPrices = [...hotel.dailyPrices].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedPrices[0];
  };

  const latestPrice = getLatestPrice();

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main'
          }}
        >
          {hotel.name}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <LocationOn color="primary" sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {hotel.city}
          </Typography>
        </Box>
        
        {latestPrice ? (
          <Box display="flex" alignItems="center" mb={2}>
            <Euro color="success" sx={{ mr: 1, fontSize: 20 }} />
            <Typography 
              variant="h6" 
              color="success.main"
              sx={{ fontWeight: 700 }}
            >
              {latestPrice.price.toFixed(2)} {latestPrice.currency}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              ({new Date(latestPrice.date).toLocaleDateString('fr-FR')})
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" mb={2}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontStyle: 'italic' }}
            >
              Aucun prix disponible
            </Typography>
          </Box>
        )}
        
        <Box 
          sx={{ 
            mt: 'auto',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Chip
            icon={<CalendarToday />}
            label={new Date(hotel.createdAt).toLocaleDateString('fr-FR')}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              size="small"
              onClick={handleBookClick}
              sx={{ 
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Réserver
            </Button>
            <Button 
              variant="outlined" 
              size="small"
              color="error"
              onClick={handleDeleteClick}
              sx={{ fontWeight: 600, textTransform: 'none' }}
              startIcon={<DeleteIcon />}
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HotelCard; 