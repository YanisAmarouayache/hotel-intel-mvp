import { Box, IconButton, Typography } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React from "react";

const ScrapingHotelDetails = React.memo(
  ({
    hotelName,
    data,
    onClose,
  }: {
    hotelName: string | null;
    data: any;
    onClose: () => void;
  }) => {
    const sortedPrices = (data?.dailyPrices || [])
      .slice()
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    return (
      <Box sx={{ p: 2 }}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: "absolute", top: 8, right: 8 }}
          aria-label="Fermer"
        >
          <ExpandLessIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
          Détails du scraping&nbsp;: {hotelName}
        </Typography>
        {data?.success ? (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Prix par date&nbsp;:
            </Typography>
            <Box
              component="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
                mb: 1,
                "& th, & td": {
                  border: "1px solid #e0e0e0",
                  p: 0.5,
                  textAlign: "center",
                },
                "& th": { bgcolor: "#e3e6f0", fontWeight: 600 },
              }}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Prix</th>
                  <th>Devise</th>
                  <th>Dispo</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {sortedPrices.map((p: any) => (
                  <tr key={p.date + p.roomCategory}>
                    <td>{p.date}</td>
                    <td>{p.price} €</td>
                    <td>{p.currency}</td>
                    <td>
                      {p.availability ? (
                        <span style={{ color: "#388e3c" }}>✔</span>
                      ) : (
                        <span style={{ color: "#d32f2f" }}>✖</span>
                      )}
                    </td>
                    <td>{p.roomCategory}</td>
                  </tr>
                ))}
              </tbody>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Scraping effectué le&nbsp;:
              {data.scrapedAt && new Date(data.scrapedAt).toLocaleString()}
            </Typography>
          </>
        ) : (
          <Typography color="error">Erreur lors du scraping.</Typography>
        )}
      </Box>
    );
  }
);

export default ScrapingHotelDetails;