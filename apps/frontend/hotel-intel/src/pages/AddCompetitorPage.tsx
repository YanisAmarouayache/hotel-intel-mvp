import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import GenericDialog from '../components/Dialog/GenericDialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@apollo/client';
import { CREATE_HOTEL } from '../graphql/queries';


const api = import.meta.env.VITE_API_URL;

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
  const [extractedData, setExtractedData] = useState<any>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [showRetry, setShowRetry] = useState(false);
  const lastScrapeUrl = useRef<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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

  const watchedUrl = watch('url');
  const isBookingUrl = watchedUrl && watchedUrl.includes('booking.com');

  const steps = [
    {
      label: "Ajoutez un compétiteur",
      description: "Entrez l'URL Booking.com de l'hôtel concurrent",
    },
    {
      label: "Vérification automatique",
      description: "Nous vérifions et extrayons les informations",
    },
    {
      label: "Configuration terminée",
      description: "L'hôtel concurrent est maintenant surveillé",
    },
  ];
  const [activeStep, setActiveStep] = useState(0);

  // Scraping automatique Booking.com
  const scrapeHotelData = async (url: string) => {
    if (!url || !url.includes('booking.com')) return;
    setScrapeError(null);
    setExtractedData(null);
    setActiveStep(1);
    setShowRetry(false);
    lastScrapeUrl.current = url;
    try {
      const apiUrl = `${api}/scraper/scrapmyhotelfrombooking?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // Vérification de scraping vide ou incomplet
      const isEmpty =
        (!data.name || data.name.trim() === '') &&
        (!data.city || data.city.trim() === '') &&
        (!data.address || data.address.trim() === '') &&
        (!data.userRating || data.userRating === 0 || data.userRating === '0') &&
        (!data.starRating || data.starRating === 0 || data.starRating === '0') &&
        (!data.reviewCount || data.reviewCount === 0 || data.reviewCount === '0') &&
        (!data.amenities || data.amenities.length === 0) &&
        (!data.images || data.images.length === 0);

      if (isEmpty) {
        setScrapeError("Aucune donnée exploitable n'a pu être extraite. Merci de vérifier l'URL ou de réessayer.");
        setExtractedData(null);
        setActiveStep(0);
        setShowRetry(false);
        setTimeout(() => setShowRetry(true), 3000);
        return;
      }

      setExtractedData(data);
      // Nettoyer le nom de l'hôtel : retirer tout après la virgule (incluse)
      if (data.name) {
        const cleanName = data.name.split(',')[0].trim();
        setValue('name', cleanName);
      }
      if (data.city) setValue('city', data.city);
      if (data.address) setValue('address', data.address);
      setActiveStep(2);
      setShowRetry(false);
    } catch (e: any) {
      setScrapeError(e.message || 'Erreur lors du scraping');
      setExtractedData(null);
      setActiveStep(0);
      setShowRetry(false);
      setTimeout(() => setShowRetry(true), 3000);
    }
  };

  // Permet de relancer le scraping facilement
  const handleRetryScrape = () => {
    if (lastScrapeUrl.current) {
      scrapeHotelData(lastScrapeUrl.current);
    }
  };

  const onSubmit = async (data: AddCompetitorForm) => {
    try {
      await createHotel({
        variables: {
          name: data.name || extractedData?.name,
          url: data.url,
          city: data.city || extractedData?.city,
          address: data.address || extractedData?.address || undefined,
          description: data.description || undefined,
          starRating: extractedData?.starRating || undefined,
          userRating: extractedData?.userRating ? parseFloat(extractedData.userRating.replace(',', '.')) : undefined,
          reviewCount: extractedData?.reviewCount || undefined,
          amenities: extractedData?.amenities || [],
          images: extractedData?.images || [],
          isCompetitor: true,
        },
      });
      setDialogMessage('Compétiteur ajouté avec succès!');
      setSuccessDialogOpen(true);
      reset();
      setExtractedData(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setDialogMessage("Erreur lors de l'ajout du compétiteur");
      setErrorDialogOpen(true);
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
                    {index === 1 && isSubmitting && (
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
                    label="URL Booking.com de l'hôtel concurrent"
                    placeholder="https://www.booking.com/hotel/..."
                    fullWidth
                    margin="normal"
                    error={!!errors.url}
                    helperText={
                      errors.url?.message || 
                      (isBookingUrl ? 'URL Booking.com valide détectée' : '')
                    }
                    disabled={isSubmitting}
                    onBlur={(e) => {
                      field.onBlur();
                      if (e.target.value && e.target.value.includes('booking.com')) {
                        scrapeHotelData(e.target.value);
                      }
                    }}
                  />
                )}
              />

              {isBookingUrl && (
                <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="body2">
                    URL Booking.com détectée ! Nous allons extraire automatiquement les informations de l'hôtel concurrent.
                  </Typography>
                </Alert>
              )}


              {scrapeError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {scrapeError}
                  {showRetry && (
                    <Box sx={{ mt: 2 }}>
                      <Button variant="outlined" color="primary" onClick={handleRetryScrape}>
                        Réessayer
                      </Button>
                    </Box>
                  )}
                </Alert>
              )}

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom de l'hôtel (optionnel - extrait automatiquement)"
                    placeholder="Sera extrait automatiquement de Booking.com"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message || "Laissez vide pour utiliser le nom extrait automatiquement"}
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
                    label="Ville (optionnelle - extraite automatiquement)"
                    placeholder="Sera extraite automatiquement de Booking.com"
                    fullWidth
                    margin="normal"
                    error={!!errors.city}
                    helperText={errors.city?.message || "Laissez vide pour utiliser la ville extraite automatiquement"}
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
                disabled={isSubmitting || !isBookingUrl}
                sx={{ mt: 3 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Ajouter le Compétiteur'
                )}
              </Button>
      {/* Données extraites (si disponibles) */}
      {extractedData && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Données extraites de Booking.com
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
            {extractedData.starRating && (
              <Chip label={`${extractedData.starRating} étoiles`} color="primary" size="small" />
            )}
            {extractedData.userRating && (
              <Chip label={`${extractedData.userRating}/10`} color="secondary" size="small" />
            )}
            {extractedData.reviewCount && (
              <Chip label={`${extractedData.reviewCount} avis`} variant="outlined" size="small" />
            )}
          </Box>
          {extractedData.amenities && extractedData.amenities.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Équipements détectés
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {extractedData.amenities.map((amenity: string, index: number) => (
                  <Chip
                    key={index}
                    label={amenity}
                    variant="outlined"
                    size="small"
                    color="default"
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}
          {extractedData.images && extractedData.images.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
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

      {/* Dialogues génériques */}
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