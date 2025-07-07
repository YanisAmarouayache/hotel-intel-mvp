import React from 'react';
import {
  Box,
  Drawer,
  List,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
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
import NavigationItem from './NavigationItem';

interface NavigationDrawerProps {
  isMobile: boolean;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  currentPath: string;
  onNavigation: (path: string) => void;
}

const navigationItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Mes Hôtels', icon: <Hotel />, path: '/my-hotels' },
  { text: 'Ajouter Compétiteur', icon: <Add />, path: '/add-competitor' },
  { text: 'Ajouter mon hôtel', icon: <Hotel />, path: '/add-my-hotel' },
  { text: 'Analyse Concurrentielle', icon: <Analytics />, path: '/competitor-analysis' },
  { text: 'Évolution des Prix', icon: <Timeline />, path: '/price-evolution' },
  { text: 'Stratégie de Yield', icon: <TrendingUp />, path: '/yield-strategy' },
  { text: 'Événements', icon: <Event />, path: '/events' },
  { text: 'Critères & Saisons', icon: <Assessment />, path: '/criteria-weights' },
  { text: 'Paramètres', icon: <Settings />, path: '/settings' },
];

const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isMobile,
  mobileOpen,
  onDrawerToggle,
  currentPath,
  onNavigation,
}) => {
  const drawerContent = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
          Hotel Intel
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.text}
            text={item.text}
            icon={item.icon}
            path={item.path}
            isActive={currentPath === item.path}
            onClick={onNavigation}
          />
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'grey.50',
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'grey.50',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default NavigationDrawer; 