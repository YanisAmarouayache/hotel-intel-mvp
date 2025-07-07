import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useHotels } from '../hooks/useHotels';
import HotelsGrid from '../components/HotelsGrid';
import ConfirmDialog from '../components/Dialog/ConfirmDialog';
import { useMutation } from '@apollo/client';
import { DELETE_HOTEL } from '../graphql/queries';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EmptyState from '../components/EmptyState';

const HotelsPage: React.FC = () => {

  const { hotels, loading, error, refetch } = useHotels();
  const [deleteHotel] = useMutation(DELETE_HOTEL);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);


  const handleDeleteHotel = (hotelId: number) => {
    setSelectedHotelId(hotelId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedHotelId == null) return;
    await deleteHotel({ variables: { id: selectedHotelId } });
    setConfirmOpen(false);
    setSelectedHotelId(null);
    refetch();
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
        <HotelsGrid hotels={hotels}  onDelete={handleDeleteHotel} />
      )}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'hôtel ?"
        message="Êtes-vous sûr de vouloir supprimer cet hôtel ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
      
    </Container>
  );
};

export default HotelsPage; 