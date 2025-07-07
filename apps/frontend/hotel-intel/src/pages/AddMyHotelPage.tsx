import React, { useState, useEffect } from 'react';
import GenericDialog from '../components/Dialog/GenericDialog';
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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Hotel,
  Link,
  CheckCircle,
  Info,
  Warning,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { CREATE_HOTEL } from '../graphql/queries';

const addMyHotelSchema = z.object({
  name: z.string().optional(),
  url: z
    .string()
    .min(1, 'L\'URL Booking.com est requise')
    .url('Veuillez entrer une URL Booking.com valide')
    .refine((url) => url.includes('booking.com'), {
      message: 'Veuillez entrer une URL Booking.com valide',
    }),
  city: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

type AddMyHotelForm = z.infer<typeof addMyHotelSchema>;

const steps = [
  {
    label: 'Ajoutez votre hôtel',
    description: 'Entrez l\'URL Booking.com de votre hôtel',
  },
  {
    label: 'Vérification automatique',
    description: 'Nous vérifions et extrayons les informations',
  },
  {
    label: 'Configuration terminée',
    description: 'Votre hôtel est maintenant surveillé',
  },
];

const AddMyHotelPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [createHotel, { loading: isSubmitting }] = useMutation(CREATE_HOTEL);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AddMyHotelForm>({
    resolver: zodResolver(addMyHotelSchema),
    defaultValues: {
      name: '',
      url: '',
      city: '',
      address: '',
      description: '',
    },
  });

  const watchedUrl = watch('url');

  // Fonction de scraping
  const scrapeHotelData = async (url: string) => {
    if (!url || !url.includes('booking.com')) return;
    
    setScrapeError(null);
    setIsVerifying(true);
    setExtractedData(null);
    setActiveStep(1);
    
    try {
      console.log('Scraping URL:', url);
      const apiUrl = `http://localhost:3000/scraper/scrapmyhotelfrombooking?url=${encodeURIComponent(url)}`;
      console.log('API endpoint:', apiUrl);
      
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      console.log('Données extraites:', data);
      console.log('Nom extrait:', data.name);
      console.log('Ville extraite:', data.city);
      
      setExtractedData(data);
      // Pré-remplir les champs du formulaire
      if (data.name) setValue('name', data.name);
      if (data.city) setValue('city', data.city);
      if (data.address) setValue('address', data.address);
      // description: laissé à l'utilisateur
      setActiveStep(2);
    } catch (e: any) {
      setScrapeError(e.message || 'Erreur lors du scraping');
      setExtractedData(null);
      setActiveStep(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUrlVerification = async (url: string) => {
    // plus utilisé, scraping auto via useEffect
  };

  const onSubmit = async (data: AddMyHotelForm) => {
    try {
      console.log('Données du formulaire:', data);
      console.log('Données extraites disponibles:', extractedData);
      
      // Utiliser les données extraites si les champs sont vides
      const hotelName = data.name || extractedData?.name;
      const hotelCity = data.city || extractedData?.city;
      
      console.log('Nom final:', hotelName);
      console.log('Ville finale:', hotelCity);
      console.log('extractedData:', extractedData);
      
      
      await createHotel({
        variables: {
          name: hotelName,
          url: data.url,
          city: hotelCity,
          address: data.address || extractedData?.address || undefined,
          description: data.description || undefined,
          starRating: extractedData?.starRating || undefined,
          userRating:  extractedData?.userRating ? parseFloat(extractedData.userRating.replace(',', '.')) : undefined,
          reviewCount: extractedData?.reviewCount || undefined,
          amenities: extractedData?.amenities || [],
          images: extractedData?.images || [],
          isCompetitor: false, // C'est votre hôtel, pas un compétiteur
        },
      });
      setDialogMessage('Votre hôtel a été ajouté avec succès!');
      setSuccessDialogOpen(true);
      reset();
      setActiveStep(0);
      setExtractedData(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setDialogMessage("Erreur lors de l'ajout de votre hôtel");
      setErrorDialogOpen(true);
      setActiveStep(0);
      setIsVerifying(false);
    }
  };

  const isBookingUrl = watchedUrl && watchedUrl.includes('booking.com');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Ajouter Mon Hôtel
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Ajoutez votre hôtel pour commencer la surveillance des prix et l'analyse concurrentielle
      </Typography>

      <Grid container spacing={4}>
        {/* Formulaire principal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Hotel sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Informations de votre hôtel
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commencez par l'URL Booking.com de votre hôtel
                </Typography>
              </Box>
            </Box>

            <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>
                    {index === 1 && isVerifying && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress size={20} sx={{ mr: 2 }} />
                        <Typography variant="body2">
                          Vérification de l'URL et extraction des données...
                        </Typography>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="URL Booking.com de votre hôtel"
                    placeholder="https://www.booking.com/hotel/fr/votre-hotel.html"
                    fullWidth
                    margin="normal"
                    error={!!errors.url}
                    helperText={
                      errors.url?.message || 
                      (isBookingUrl ? 'URL Booking.com valide détectée' : '')
                    }
                    disabled={isSubmitting || isVerifying}
                    onBlur={(e) => {
                      field.onBlur();
                      if (e.target.value && e.target.value.includes('booking.com')) {
                        scrapeHotelData(e.target.value);
                      }
                    }}
                    InputProps={{
                      startAdornment: <Link sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                )}
              />

              {isBookingUrl && (
                <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="body2">
                    URL Booking.com détectée ! Nous allons extraire automatiquement les informations de votre hôtel.
                  </Typography>
                </Alert>
              )}

              {scrapeError && (
                <Alert severity="error" sx={{ mb: 2 }}>{scrapeError}</Alert>
              )}

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de votre hôtel (optionnel - extrait automatiquement)"
                    placeholder="Sera extrait automatiquement de Booking.com"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message || "Laissez vide pour utiliser le nom extrait automatiquement"}
                    disabled={isSubmitting || isVerifying}
                  />
                )}
              />

              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ville (optionnelle - extraite automatiquement)"
                    placeholder="Sera extraite automatiquement de Booking.com"
                    fullWidth
                    margin="normal"
                    error={!!errors.city}
                    helperText={errors.city?.message || "Laissez vide pour utiliser la ville extraite automatiquement"}
                    disabled={isSubmitting || isVerifying}
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
                    disabled={isSubmitting || isVerifying}
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
                    disabled={isSubmitting || isVerifying}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isSubmitting || isVerifying || !isBookingUrl}
                sx={{ mt: 3 }}
                startIcon={isSubmitting || isVerifying ? <CircularProgress size={20} /> : <CheckCircle />}
              >
                {isSubmitting || isVerifying 
                  ? 'Traitement en cours...' 
                  : 'Ajouter Mon Hôtel'
                }
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Informations et aide */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Comment procéder
              </Typography>
              
              <Box component="ol" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Allez sur Booking.com et trouvez votre hôtel
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Copiez l'URL de la page de votre hôtel
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Collez l'URL dans le champ ci-dessus
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Nous extrairons automatiquement les informations
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                Avantages
              </Typography>
              
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Surveillance automatique des prix
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Analyse de la concurrence
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Recommandations de pricing
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Rapports détaillés
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Données extraites (si disponibles) */}
      {extractedData && (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Données extraites de Booking.com
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Informations de base
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nom: <strong>{extractedData.name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ville: <strong>{extractedData.city}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Adresse: <strong>{extractedData.address}</strong>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip 
                  label={`${extractedData.starRating} étoiles`} 
                  color="primary" 
                  size="small" 
                />
                <Chip 
                  label={`${extractedData.userRating}/10`} 
                  color="secondary" 
                  size="small" 
                />
                <Chip 
                  label={`${extractedData.reviewCount} avis`} 
                  variant="outlined" 
                  size="small" 
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Équipements détectés
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {extractedData.amenities.map((amenity: string, index: number) => (
                  <Chip 
                    key={index}
                    label={amenity} 
                    variant="outlined" 
                    size="small" 
                  />
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* Images extraites */}
          {extractedData.images && extractedData.images.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Images extraites ({extractedData.images.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                {extractedData.images.map((image: string, index: number) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
                    alt={`Image ${index + 1}`}
                    sx={{
                      width: 120,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    <GenericDialog
      open={successDialogOpen}
      onClose={() => setSuccessDialogOpen(false)}
      title="Succès"
      message={dialogMessage}
      color="success"
    />
    <GenericDialog
      open={errorDialogOpen}
      onClose={() => setErrorDialogOpen(false)}
      title="Erreur"
      message={dialogMessage}
      color="error"
    />
  </Box>
  );
};

export default AddMyHotelPage;