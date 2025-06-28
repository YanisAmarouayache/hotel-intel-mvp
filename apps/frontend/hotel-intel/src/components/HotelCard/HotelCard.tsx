import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import { LocationOn, Euro, CalendarToday } from '@mui/icons-material';

interface HotelCardProps {
  hotel: {
    id: number;
    name: string;
    city: string;
    price: number;
    createdAt: string;
    updatedAt: string;
  };
  onBook?: (hotelId: number) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onBook }) => {
  const handleBookClick = () => {
    onBook?.(hotel.id);
  };

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
        
        <Box display="flex" alignItems="center" mb={2}>
          <Euro color="success" sx={{ mr: 1, fontSize: 20 }} />
          <Typography 
            variant="h6" 
            color="success.main"
            sx={{ fontWeight: 700 }}
          >
            {hotel.price.toFixed(2)} €
          </Typography>
        </Box>
        
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default HotelCard; 