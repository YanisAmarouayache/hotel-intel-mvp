import React from 'react';
import { Grid } from '@mui/material';
import StatCard from './StatCard';
import type { DashboardStats } from '../../types';

interface StatsGridProps {
  stats: DashboardStats[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.title}>
          <StatCard stat={stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsGrid; 