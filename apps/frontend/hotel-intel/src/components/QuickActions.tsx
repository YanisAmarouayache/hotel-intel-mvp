import React from "react";
import { Grid, Paper, Typography, Box, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";

export const QuickActions = ({
  navigate,
  handleScrapeAll,
  scraping,
}: {
  navigate: (path: string) => void;
  handleScrapeAll: () => void;
  scraping: boolean;
}) => (
  <Grid container spacing={3} sx={{ mt: 4 }}>
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Actions Rapides
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajoutez rapidement un compétiteur ou consultez vos analyses
        </Typography>
        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
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
            onClick={() => navigate("/analyses")}
          >
            Voir mes analyses
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Refresh />}
            onClick={handleScrapeAll}
            disabled={scraping}
          >
            {scraping ? "Scraping..." : "Scraper tous les hôtels"}
          </Button>
        </Box>
      </Paper>
    </Grid>
  </Grid>
);