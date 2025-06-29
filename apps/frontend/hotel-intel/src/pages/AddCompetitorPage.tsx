import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const addCompetitorSchema = z.object({
  bookingUrl: z
    .string()
    .min(1, 'L\'URL est requise')
    .url('Veuillez entrer une URL valide')
    .refine((url) => url.includes('booking.com'), {
      message: 'L\'URL doit être une URL Booking.com valide',
    }),
  hotelName: z.string().min(1, 'Le nom de l\'hôtel est requis'),
  city: z.string().min(1, 'La ville est requise'),
  notes: z.string().optional(),
});

type AddCompetitorForm = z.infer<typeof addCompetitorSchema>;

const AddCompetitorPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddCompetitorForm>({
    resolver: zodResolver(addCompetitorSchema),
    defaultValues: {
      bookingUrl: '',
      hotelName: '',
      city: '',
      notes: '',
    },
  });

  const onSubmit = async (data: AddCompetitorForm) => {
    try {
      console.log('Données du formulaire:', data);
      // TODO: Appel API pour ajouter le compétiteur
      alert('Compétiteur ajouté avec succès!');
      reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Ajouter un Compétiteur
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ajoutez un hôtel concurrent en fournissant son URL Booking.com
      </Typography>

      <Grid container spacing={4}>
        {/* Formulaire */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Informations du Compétiteur
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
              <Controller
                name="bookingUrl"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL Booking.com"
                    placeholder="https://www.booking.com/hotel/..."
                    fullWidth
                    margin="normal"
                    error={!!errors.bookingUrl}
                    helperText={errors.bookingUrl?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="hotelName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de l'hôtel"
                    fullWidth
                    margin="normal"
                    error={!!errors.hotelName}
                    helperText={errors.hotelName?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ville"
                    fullWidth
                    margin="normal"
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes (optionnel)"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Ajouter le Compétiteur'
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Informations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Données Extraites
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Une fois ajouté, nous extrairons automatiquement :
              </Alert>
              
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Prix actuels (J+3, J+7, etc.)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Note et étoiles de l'hôtel
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Localisation et scores utilisateurs
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Équipements (piscine, salle de sport, etc.)
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Évolution historique des prix
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddCompetitorPage; 