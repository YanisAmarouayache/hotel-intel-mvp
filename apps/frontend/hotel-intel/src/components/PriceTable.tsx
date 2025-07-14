import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Chip,
} from "@mui/material";
import HotelIcon from "@mui/icons-material/Hotel";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import type { Hotel } from "../types";

const getTrendProps = (trend: "up" | "down" | "same" | null) => {
  if (trend === "up")
    return {
      icon: <TrendingUpIcon sx={{ color: "success.main" }} />,
      color: "success.main",
    };
  if (trend === "down")
    return {
      icon: <TrendingDownIcon sx={{ color: "error.main" }} />,
      color: "error.main",
    };
  if (trend === "same")
    return {
      icon: <TrendingFlatIcon sx={{ color: "grey.600" }} />,
      color: "grey.700",
    };
  return {
    icon: null,
    color: "grey.400",
  };
};

export const PriceTable = ({ hotels }: { hotels: Hotel[] }) => {
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f5f5f5" }}>
              <TableCell>Hôtel</TableCell>
              <TableCell align="center">Dernier prix</TableCell>
              <TableCell align="center">Variation</TableCell>
              <TableCell align="center">Date évolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.map((hotel: Hotel) => {
              const latest = hotel.latestPriceAtDate?.price;
              const prev = hotel.previousPriceAtDate?.price;
              const latestDate = hotel.latestPriceAtDate?.scrapedAt;
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

              const isMine = !hotel.isCompetitor;
              const trendProps = getTrendProps(trend);

              return (
                <TableRow
                  key={hotel.id}
                  sx={
                    isMine
                      ? {
                          background: "#fffde7",
                          fontWeight: 700,
                        }
                      : {}
                  }
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: isMine ? "#bfa13a" : "primary.main",
                          color: "#fff",
                          fontWeight: 700,
                          border: isMine ? "2px solid #bfa13a" : undefined,
                        }}
                      >
                        <HotelIcon fontSize="small" />
                      </Avatar>
                      <Tooltip title={hotel.name}>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{
                            fontWeight: isMine ? 800 : 600,
                            color: isMine ? "#bfa13a" : "text.primary",
                          }}
                        >
                          {hotel.name}
                          {isMine && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 12,
                                color: "#bfa13a",
                                fontWeight: 700,
                              }}
                            >
                              (Moi)
                            </span>
                          )}
                        </Typography>
                      </Tooltip>
                      {isMine && (
                        <StarIcon
                          sx={{
                            fontSize: 20,
                            color: "#bfa13a",
                            ml: 1,
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                    >
                      {prev && prev !== latest && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "grey.500",
                            fontSize: 13,
                            mb: 0.2,
                          }}
                        >
                          €{prev}
                        </Typography>
                      )}
                      <Chip
                        label={latest ? `€${latest}` : "N/A"}
                        color={isMine ? "default" : "primary"}
                        sx={{
                          fontWeight: 700,
                          fontSize: 16,
                          bgcolor: isMine ? "#f9f6ee" : "#f5faff",
                          color: isMine ? "#bfa13a" : "primary.main",
                          border: isMine ? "1.5px solid #bfa13a" : undefined,
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={1}
                    >
                      {trendProps.icon}
                      {trend === "up" && (
                        <Typography
                          sx={{
                            color: trendProps.color,
                            fontWeight: 700,
                          }}
                        >
                          +{percent}%
                        </Typography>
                      )}
                      {trend === "down" && (
                        <Typography
                          sx={{
                            color: trendProps.color,
                            fontWeight: 700,
                          }}
                        >
                          {percent}%
                        </Typography>
                      )}
                      {trend === "same" && (
                        <Typography
                          sx={{
                            color: trendProps.color,
                            fontWeight: 700,
                          }}
                        >
                          Stable
                        </Typography>
                      )}
                      {trend === null && <Chip label="N/A" size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {evolutionDate && trend !== "same" ? (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(evolutionDate).toLocaleString("fr-FR")}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};