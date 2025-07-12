import React from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, Avatar, Box, Typography
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";

export const PriceTable = ({ hotels }: { hotels: any[] }) => (
  <Paper sx={{ mt: 4, mb: 4, borderRadius: 3, boxShadow: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, p: 2 }}>
      Derniers prix scrapés
    </Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell>Hôtel</TableCell>
            <TableCell>Dernier prix</TableCell>
            <TableCell>Date de mise à jour</TableCell>
            <TableCell>Variation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hotels.map((hotel: any) => {
            const latest = hotel.latestPrice?.price;
            const prev = hotel.previousPrice?.price;
            const latestDate = hotel.latestPrice?.scrapedAt;
            let trend: "up" | "down" | "same" | null = null;
            let percent = null;
            let evolutionDate = null;

            if (latest != null && prev != null) {
              if (latest > prev) trend = "up";
              else if (latest < prev) trend = "down";
              else trend = "same";
              if (trend !== "same") {
                percent = (((latest - prev) / prev) * 100).toFixed(1);
                evolutionDate = latestDate;
              }
            }

            return (
              <TableRow key={hotel.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>
                      <HotelIcon fontSize="small" />
                    </Avatar>
                    <Tooltip title={hotel.name}>
                      <Typography variant="subtitle2" noWrap>
                        {hotel.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {latest ? (
                    <Chip
                      label={`€${latest}`}
                      color="success"
                      sx={{ fontWeight: 600, fontSize: 16 }}
                    />
                  ) : (
                    <Chip label="N/A" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  {latestDate ? (
                    <Chip
                      label={new Date(latestDate).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                      color="info"
                      variant="outlined"
                    />
                  ) : (
                    <Chip label="N/A" color="default" />
                  )}
                </TableCell>
                <TableCell>
                  {trend === "up" && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <ArrowUpwardIcon sx={{ color: "error.main" }} />
                      <Typography color="error.main" fontWeight={600}>
                        +{percent}%
                      </Typography>
                      {evolutionDate && (
                        <Typography variant="caption" color="text.secondary">
                          ({new Date(evolutionDate).toLocaleString("fr-FR")})
                        </Typography>
                      )}
                    </Box>
                  )}
                  {trend === "down" && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <ArrowDownwardIcon sx={{ color: "success.main" }} />
                      <Typography color="success.main" fontWeight={600}>
                        {percent}%
                      </Typography>
                      {evolutionDate && (
                        <Typography variant="caption" color="text.secondary">
                          ({new Date(evolutionDate).toLocaleString("fr-FR")})
                        </Typography>
                      )}
                    </Box>
                  )}
                  {trend === "same" && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <RemoveIcon sx={{ color: "grey.500" }} />
                      <Typography color="text.secondary" fontWeight={600}>
                        Stable
                      </Typography>
                    </Box>
                  )}
                  {trend === null && <Chip label="N/A" />}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);