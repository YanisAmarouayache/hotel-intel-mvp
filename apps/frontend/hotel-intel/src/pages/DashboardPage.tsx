import React from 'react';
import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { TrendingUp, Hotel, Euro, Analytics } from "@mui/icons-material";
import { StatsGrid } from "../components/Dashboard";
import type { DashboardStats } from "../types";
import { DASHBOARD_STATS_QUERY } from "../graphql/queries";

const iconMap = {
  Hotel: <Hotel color="primary" />,
  Euro: <Euro color="success" />,
  TrendingUp: <TrendingUp color="warning" />,
  Analytics: <Analytics color="info" />,
  Default: <Analytics color="disabled" />,
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(DASHBOARD_STATS_QUERY);

  if (loading)
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
    (s: any) => ({
      ...s,
      icon: iconMap[s.icon as keyof typeof iconMap] || iconMap.Default,
    })
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

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Actions Rapides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez rapidement un compétiteur ou consultez vos analyses
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/add-competitor")}
              >
                Ajouter un compétiteur
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ ml: 2 }}
                onClick={() => navigate("/analyses")}
              >
                Voir mes analyses
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Recommandations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vos hôtels sont bien positionnés par rapport à la concurrence
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;