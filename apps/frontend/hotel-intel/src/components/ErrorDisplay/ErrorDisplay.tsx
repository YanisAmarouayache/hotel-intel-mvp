import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';

interface ErrorDisplayProps {
  error: string | Error;
  title?: string;
  severity?: 'error' | 'warning' | 'info';
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  title = 'Une erreur est survenue',
  severity = 'error'
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Box sx={{ mt: 4 }}>
      <Alert severity={severity}>
        <AlertTitle>{title}</AlertTitle>
        {errorMessage}
      </Alert>
    </Box>
  );
};

export default ErrorDisplay; 