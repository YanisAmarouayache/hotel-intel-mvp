import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  LinearProgress,
} from "@mui/material";
import { LocationOn, Euro, CalendarToday } from "@mui/icons-material";
import type { Hotel } from "../../types";
import { scrapePricesForHotel } from "../../lib/scrapeApi";
import ScrapeResultDialog from "../Dialog/ScrapeResultDialog";

interface HotelCardProps {
  hotel: Hotel;
  onDelete?: (hotelId: number) => void;
  refetchHotels?: () => void;
}

import DeleteIcon from "@mui/icons-material/Delete";
const HotelCard: React.FC<HotelCardProps> = ({ hotel, onDelete, refetchHotels }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{
    total: number;
    updated: number;
    stored: number;
  } | undefined>(undefined);
  const [scrapeError, setScrapeError] = useState<string | undefined>(undefined);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(hotel.id);
  };
  const handleDetailsClick = () => {
    navigate(`/hotel/${hotel.id}`);
  };

  // Obtenir le prix le plus récent
  const getLatestPrice = () => {
    if (!hotel.dailyPrices || hotel.dailyPrices.length === 0) {
      return null;
    }

    // Trier par date et prendre le plus récent
    const sortedPrices = [...hotel.dailyPrices].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedPrices[0];
  };

  const latestPrice = getLatestPrice();

  // Style spécial pour "mon hôtel" (non compétiteur)
  const isOwnHotel = hotel.isCompetitor === false;

  // New: Scrape and store handler
  const handleScrapeAndStore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setProgress(0);
    let interval: NodeJS.Timeout | null = null;
    const estimatedDuration = 12000; // 12s
    const step = 100 / (estimatedDuration / 200); // update every 200ms
    interval = setInterval(() => {
      setProgress((old) => {
        if (old + step >= 95) return 95;
        return old + step;
      });
    }, 200);
    try {
      const res = await scrapePricesForHotel(hotel.id);
      setScrapeResult({
        total: res.data?.dailyPrices?.length || res.data?.daily_prices?.length || 0,
        updated: res.updated || 0,
        stored: res.stored || 0,
      });
      setScrapeError(undefined);
      setDialogOpen(true);
      setProgress(100);
      if (refetchHotels) refetchHotels();
    } catch (err: any) {
      setScrapeError(err.message || String(err));
      setDialogOpen(true);
      setProgress(100);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        if (interval) clearInterval(interval);
      }, 500);
    }
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease-in-out",
        border: isOwnHotel ? "3px solid #1976d2" : undefined,
        boxShadow: isOwnHotel ? 10 : undefined,
        background: isOwnHotel
          ? "linear-gradient(90deg, #e3f2fd 0%, #ffffff 100%)"
          : undefined,
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      {loading && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            height: 4,
          }}
        />
      )}
      {/* Badge spécial pour mon hôtel */}
      {isOwnHotel && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <Chip
            label="Mon hôtel"
            color="primary"
            size="small"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          />
        </Box>
      )}
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "primary.main",
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
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({new Date(latestPrice.date).toLocaleDateString("fr-FR")})
            </Typography>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" mb={2}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Aucun prix disponible
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            mt: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Chip
            icon={<CalendarToday />}
            label={new Date(hotel.createdAt).toLocaleDateString("fr-FR")}
            size="small"
            variant="outlined"
            color="primary"
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleDetailsClick}
              sx={{
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Détails
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="success"
              onClick={handleScrapeAndStore}
              sx={{ fontWeight: 600, textTransform: "none" }}
              disabled={loading}
            >
              Scraper & Stocker
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleDeleteClick}
              sx={{ fontWeight: 600, textTransform: "none" }}
              startIcon={<DeleteIcon />}
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      </CardContent>
      <ScrapeResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        result={scrapeResult}
        error={scrapeError}
      />
    </Card>
  );
};

export default HotelCard;
