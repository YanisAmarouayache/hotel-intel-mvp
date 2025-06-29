import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { NavigationDrawer, AppHeader } from '../Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  { text: 'Dashboard', path: '/' },
  { text: 'Mes Hôtels', path: '/my-hotels' },
  { text: 'Ajouter Compétiteur', path: '/add-competitor' },
  { text: 'Analyse Concurrentielle', path: '/competitor-analysis' },
  { text: 'Évolution des Prix', path: '/price-evolution' },
  { text: 'Stratégie de Yield', path: '/yield-strategy' },
  { text: 'Événements', path: '/events' },
  { text: 'Critères & Saisons', path: '/criteria-weights' },
  { text: 'Paramètres', path: '/settings' },
];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getCurrentPageTitle = (): string => {
    const currentItem = navigationItems.find(item => item.path === location.pathname);
    return currentItem?.text || 'Dashboard';
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppHeader
        title={getCurrentPageTitle()}
        onMenuClick={handleDrawerToggle}
        isMobile={isMobile}
      />

      <NavigationDrawer
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        currentPath={location.pathname}
        onNavigation={handleNavigation}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 280px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '& > *': {
            width: '100%',
            maxWidth: '1200px',
          }
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout; 