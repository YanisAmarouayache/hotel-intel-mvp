import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import { StatsGrid } from "../components/Dashboard";
import { PriceTable } from "../components/PriceTable";
import { QuickActions } from "../components/QuickActions";
import {
  DASHBOARD_STATS_QUERY,
  LATEST_PRICES_QUERY,
  SCRAPE_AND_STORE_BATCH_MUTATION,
} from "../graphql/queries";
import type { DashboardStats } from "../types";
import HotelIcon from "@mui/icons-material/Hotel";
import EuroIcon from "@mui/icons-material/Euro";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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

  const [scrapeAndStoreBatch, { loading: scraping }] = useMutation(
    SCRAPE_AND_STORE_BATCH_MUTATION,
    {
      onCompleted: () => refetchPrices(),
      onError: (err) => {
        // Optionally show error to user
        alert("Erreur lors du scraping: " + err.message);
      },
    }
  );

  // Scrape all hotels handler
  const handleScrapeAll = async () => {
    const hotelIds = pricesData?.hotels?.map((h: any) => h.id) || [];
    if (hotelIds.length === 0) return;
    await scrapeAndStoreBatch({ variables: { hotelIds } });
  };

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

  const stats: DashboardStats[] = (data?.dashboardStats || []).map((s: DashboardStats) => {
    const Icon = iconMap[s.icon as keyof typeof iconMap] || iconMap.Default;
    return {
      ...s,
      icon: <Icon />,
    };
  });

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
      <PriceTable hotels={pricesData?.hotels || []} />
      <QuickActions
        navigate={navigate}
        handleScrapeAll={handleScrapeAll}
        scraping={scraping}
      />
    </Box>
  );
};

export default DashboardPage;
