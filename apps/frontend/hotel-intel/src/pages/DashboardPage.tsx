import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import {
  TrendingUp,
  Hotel,
  Euro,
  Analytics,
} from '@mui/icons-material';
import { StatsGrid } from '../components/Dashboard';
import type { DashboardStats } from '../types';

const DashboardPage: React.FC = () => {
  const stats: DashboardStats[] = [
    {
      title: 'Hôtels Surveillés',
      value: '12',
      icon: <Hotel color="primary" />,
      color: 'primary.main',
      trend: { value: 8.5, isPositive: true },
    },
    {
      title: 'Prix Moyen',
      value: '€145',
      icon: <Euro color="success" />,
      color: 'success.main',
      trend: { value: 2.3, isPositive: true },
    },
    {
      title: 'Évolution Prix',
      value: '+8.5%',
      icon: <TrendingUp color="warning" />,
      color: 'warning.main',
      trend: { value: 8.5, isPositive: true },
    },
    {
      title: 'Analyses Actives',
      value: '5',
      icon: <Analytics color="info" />,
      color: 'info.main',
    },
  ];

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
      
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ mb: 4 }}
      >
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