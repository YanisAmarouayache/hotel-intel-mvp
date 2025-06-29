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
import { useMutation } from '@apollo/client';
import { CREATE_HOTEL } from '../graphql/queries';

const addCompetitorSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'hôtel est requis'),
  url: z
    .string()
    .min(1, 'L\'URL est requise')
    .url('Veuillez entrer une URL valide'),
  city: z.string().min(1, 'La ville est requise'),
  address: z.string().optional(),
  description: z.string().optional(),
});

type AddCompetitorForm = z.infer<typeof addCompetitorSchema>;

const AddCompetitorPage: React.FC = () => {
  const [createHotel, { loading: isSubmitting }] = useMutation(CREATE_HOTEL);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddCompetitorForm>({
    resolver: zodResolver(addCompetitorSchema),
    defaultValues: {
      name: '',
      url: '',
      city: '',
      address: '',
      description: '',
    },
  });

  const onSubmit = async (data: AddCompetitorForm) => {
    try {
      await createHotel({
        variables: {
          name: data.name,
          url: data.url,
          city: data.city,
          address: data.address || undefined,
          description: data.description || undefined,
          isCompetitor: true, // Par défaut, c'est un compétiteur
        },
      });
      
      alert('Compétiteur ajouté avec succès!');
      reset();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      alert('Erreur lors de l\'ajout du compétiteur');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Ajouter un Compétiteur
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ajoutez un hôtel concurrent en fournissant ses informations
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
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de l'hôtel"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL de l'hôtel"
                    placeholder="https://www.booking.com/hotel/..."
                    fullWidth
                    margin="normal"
                    error={!!errors.url}
                    helperText={errors.url?.message}
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
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Adresse (optionnel)"
                    fullWidth
                    margin="normal"
                    disabled={isSubmitting}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description (optionnel)"
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
                  Prix quotidiens (J+3, J+7, etc.)
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