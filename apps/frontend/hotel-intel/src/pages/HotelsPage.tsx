import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useHotels } from '../hooks/useHotels';
import HotelsGrid from '../components/HotelsGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EmptyState from '../components/EmptyState';

const HotelsPage: React.FC = () => {
  const { hotels, loading, error } = useHotels();

  const handleBookHotel = (hotelId: number) => {
    console.log('Réserver hôtel:', hotelId);
    // TODO: Implémenter la logique de réservation
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LoadingSpinner message="Chargement des hôtels..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <ErrorDisplay 
          error={error} 
          title="Erreur lors du chargement des hôtels"
        />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'primary.main'
          }}
        >
          Hôtels disponibles
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Découvrez notre sélection d'hôtels de qualité
        </Typography>
      </Box>
      
      {hotels.length === 0 ? (
        <EmptyState 
          title="Aucun hôtel disponible"
          message="Aucun hôtel n'est disponible pour le moment. Veuillez réessayer plus tard."
        />
      ) : (
        <HotelsGrid hotels={hotels} onBook={handleBookHotel} />
      )}
    </Container>
  );
};

export default HotelsPage; 