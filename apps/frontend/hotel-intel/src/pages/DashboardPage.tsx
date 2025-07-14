import React, { useState, useRef } from "react";
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { StatsGrid } from "../components/Dashboard";
import { PriceTableWithDatePicker } from "../components/PriceTableWithDatePicker";
import { QuickActions } from "../components/QuickActions";
import { DASHBOARD_STATS_QUERY, LATEST_PRICES_QUERY } from "../graphql/queries";
import type { DashboardStats } from "../types";
import HotelIcon from "@mui/icons-material/Hotel";
import EuroIcon from "@mui/icons-material/Euro";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BatchProgressList from "../components/Dashboard/BatchProgressList";
import ScrapingHotelDetails from "../components/Dashboard/ScrapingHotelDetails";

const iconMap = {
  Hotel: HotelIcon,
  Euro: EuroIcon,
  TrendingUp: TrendingUpIcon,
  Analytics: AnalyticsIcon,
  Default: HelpOutlineIcon,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(DASHBOARD_STATS_QUERY);
  const {
    data: pricesData,
    loading: pricesLoading,
    refetch: refetchPrices,
  } = useQuery(LATEST_PRICES_QUERY);

  const api = import.meta.env.VITE_API_URL;

  // Progress bar state
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [progressDetails, setProgressDetails] = useState<any>(null);
  const [scrapeDetailsOpen, setScrapeDetailsOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogHotelData, setDialogHotelData] = useState<any>(null);
  const [dialogHotelName, setDialogHotelName] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Scrape all hotels handler (REST, not GraphQL)
  const handleScrapeAll = async () => {
    const hotelIds = pricesData?.hotels?.map((h: any) => h.id) || [];
    if (hotelIds.length === 0) return;
    setProgress({ done: 0, total: hotelIds.length });
    setProgressOpen(true);
    setBatchResult(null);
    setBatchError(null);

    try {
      // Start batch scrape
      const res = await fetch(`${api}/scraper/batch/scrape-and-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelIds }),
      });
      const data = await res.json();

      // Poll progress every 5 seconds
      pollRef.current = setInterval(async () => {
        const resp = await fetch(
          `${api}/scraper/batch/progress?batchId=${data.batchId}`
        );
        const prog = await resp.json();
        if (prog) {
          setProgress({ done: prog.done, total: prog.total });
          setProgressDetails(prog);
        }
        // When done, stop polling and show result
        if (prog && prog.done >= prog.total) {
          clearInterval(pollRef.current!);
          setBatchResult(data);
          setProgressOpen(false);
          refetchPrices();
        }
      }, 5000);
    } catch (err: any) {
      setBatchError("Erreur lors du scraping: " + err.message);
      setProgressOpen(false);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  if (loading || pricesLoading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box>
        <Typography color="error">Erreur: {error.message}</Typography>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </Box>
    );

  const stats: DashboardStats[] = (data?.dashboardStats || []).map(
    (s: DashboardStats) => {
      const Icon = iconMap[s.icon as keyof typeof iconMap] || iconMap.Default;
      return {
        ...s,
        icon: <Icon />,
      };
    }
  );

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700 }}
      >
        Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Vue d'ensemble de votre stratégie hôtelière
      </Typography>

      <StatsGrid stats={stats} />
      <PriceTableWithDatePicker />
      <QuickActions
        navigate={navigate}
        handleScrapeAll={handleScrapeAll}
        scraping={progressOpen}
      />

      {/* Progress Bar Snackbar */}
      <Snackbar
        open={progressOpen}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box sx={{ width: 520, maxHeight: 480, overflowY: "auto" }}>
          <Alert
            severity="info"
            icon={false}
            sx={{ p: 2, boxShadow: 3, borderRadius: 2 }}
          >
            <Box
              display="flex"
              alignItems="center"
              mb={scrapeDetailsOpen ? 2 : 0}
            >
              <LinearProgress
                variant={
                  progress && progress.total > 0
                    ? "determinate"
                    : "indeterminate"
                }
                value={
                  progress && progress.total > 0
                    ? (progress.done / progress.total) * 100
                    : undefined
                }
                sx={{
                  flex: 1,
                  mr: 2,
                  borderRadius: 2,
                  height: 14,
                  backgroundColor: "#e3e6f0",
                  "& .MuiLinearProgress-bar": {
                    background:
                      "linear-gradient(90deg,#1976d2 0%,#42a5f5 100%)",
                  },
                }}
              />
              <Box
                sx={{
                  minWidth: 60,
                  ml: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: "#1976d2",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: 1,
                  textAlign: "center",
                }}
              >
                {progress && progress.total > 0
                  ? `${Math.round((progress.done / progress.total) * 100)}%`
                  : "--"}
              </Box>
              <IconButton
                size="small"
                onClick={() => setScrapeDetailsOpen((v) => !v)}
                sx={{ ml: 1 }}
              >
                {scrapeDetailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: scrapeDetailsOpen ? 2 : 0 }}
            >
              {progress
                ? `Scraping ${progress.done} / ${progress.total} hôtels`
                : "Scraping en cours..."}
            </Typography>
            {scrapeDetailsOpen && progressDetails && progressDetails.hotels && (
              <BatchProgressList
                progressDetails={progressDetails}
                onShowDetails={(hotel, data) => {
                  setDialogHotelData(data);
                  setDialogHotelName(hotel.name);
                  setDialogOpen(true);
                }}
              />
            )}
          </Alert>
        </Box>
      </Snackbar>

      {/* Scraping Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { position: "relative" } }}
      >
        <DialogTitle>
          Détails du scraping&nbsp;: {dialogHotelName}
          <IconButton
            size="small"
            onClick={() => setDialogOpen(false)}
            sx={{ position: "absolute", right: 16, top: 16 }}
            aria-label="Fermer"
          >
            <ExpandLessIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {dialogHotelData && (
            <ScrapingHotelDetails
              hotelName={dialogHotelName}
              data={dialogHotelData}
              onClose={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Result Snackbar */}
      <Snackbar
        open={!!batchResult}
        autoHideDuration={6000}
        onClose={() => setBatchResult(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setBatchResult(null)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {batchResult?.message}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!batchError}
        autoHideDuration={6000}
        onClose={() => setBatchError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setBatchError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {batchError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
