import React from 'react';
import {
  Dashboard,
  Hotel,
  Analytics,
  Settings,
  Add,
  Timeline,
  Event,
  Assessment,
  TrendingUp,
} from '@mui/icons-material';

export interface NavigationItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  description?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/',
    description: 'Vue d\'ensemble de votre stratégie hôtelière',
  },
  {
    text: 'Mes Hôtels',
    icon: <Hotel />,
    path: '/my-hotels',
    description: 'Gérez vos propres hôtels',
  },
  {
    text: 'Ajouter Compétiteur',
    icon: <Add />,
    path: '/add-competitor',
    description: 'Ajoutez un hôtel concurrent via Booking.com',
  },
  {
    text: 'Analyse Concurrentielle',
    icon: <Analytics />,
    path: '/competitor-analysis',
    description: 'Comparez vos prix avec la concurrence',
  },
  {
    text: 'Évolution des Prix',
    icon: <Timeline />,
    path: '/price-evolution',
    description: 'Suivez l\'évolution historique des prix',
  },
  {
    text: 'Stratégie de Yield',
    icon: <TrendingUp />,
    path: '/yield-strategy',
    description: 'Recommandations de pricing intelligentes',
  },
  {
    text: 'Événements',
    icon: <Event />,
    path: '/events',
    description: 'Gérez les événements locaux',
  },
  {
    text: 'Critères & Saisons',
    icon: <Assessment />,
    path: '/criteria-weights',
    description: 'Pondération saisonnière des critères',
  },
  {
    text: 'Paramètres',
    icon: <Settings />,
    path: '/settings',
    description: 'Configuration de l\'application',
  },
];

export const DRAWER_WIDTH = 280; 