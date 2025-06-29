import React from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

interface NavigationItemProps {
  text: string;
  icon: React.ReactNode;
  path: string;
  isActive: boolean;
  onClick: (path: string) => void;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  text,
  icon,
  path,
  isActive,
  onClick,
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onClick(path)}
        selected={isActive}
        sx={{
          '&:hover': {
            backgroundColor: 'primary.light',
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            },
          },
        }}
      >
        <ListItemIcon sx={{ color: isActive ? 'white' : 'text.secondary' }}>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={text}
          primaryTypographyProps={{
            fontWeight: 500,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default NavigationItem; 