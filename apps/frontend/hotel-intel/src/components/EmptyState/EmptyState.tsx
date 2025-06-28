import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface EmptyStateProps {
  title?: string;
  message?: string;
  severity?: 'info' | 'warning';
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = 'Aucun résultat',
  message = 'Aucun élément disponible pour le moment.',
  severity = 'info'
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default EmptyState; 