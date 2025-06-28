import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import type { DashboardStats } from '../../types';

interface StatCardProps {
  stat: DashboardStats;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: stat.color,
                mb: 0.5,
              }}
            >
              {stat.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stat.title}
            </Typography>
            {stat.trend && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: stat.trend.isPositive ? 'success.main' : 'error.main',
                  fontWeight: 500,
                }}
              >
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
              </Typography>
            )}
          </Box>
          <Box sx={{ fontSize: 40, color: stat.color }}>
            {stat.icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard; 