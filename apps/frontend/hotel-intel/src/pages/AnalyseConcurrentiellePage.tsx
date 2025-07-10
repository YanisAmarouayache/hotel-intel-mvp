import { useQuery } from "@apollo/client";
import { GET_HOTELS } from "../graphql/queries";
import { ResponsiveLine } from "@nivo/line";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  Slider,
  Stack,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { parseDate, formatDateFR } from "../utils/utils";
import CustomTooltip from "../components/CustomTooltip";
import HotelLegend from "../components/HotelLegend";

const HOTEL_COLORS = [
  "#1976d2",
  "#e57373",
  "#81c784",
  "#ffb74d",
  "#ba68c8",
  "#4dd0e1",
  "#ffd54f",
  "#a1887f",
  "#90a4ae",
];

type Hotel = {
  id: number;
  name: string;
  isCompetitor: boolean;
  color: string;
  dailyPrices: { date: string; price: number; scrapedAt?: string }[];
};

function getLatestPricePerDay(
  prices: { date: string; price: number; scrapedAt?: string }[]
) {
  // Map: date string (YYYY-MM-DD) => DailyPrice
  const map = new Map();
  for (const price of prices) {
    const day = price.date.slice(0, 10); // 'YYYY-MM-DD'
    const current = map.get(day);
    // If no scrapedAt, treat as earliest (or always replace if current also lacks scrapedAt)
    if (
      !map.has(day) ||
      (price.scrapedAt &&
        (!current?.scrapedAt ||
          new Date(price.scrapedAt) > new Date(current.scrapedAt)))
    ) {
      map.set(day, price);
    }
  }
  // Return as sorted array by date
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

const AnalyseConcurrentiellePage = () => {
  const theme = useTheme();
  const { data, loading, error } = useQuery(GET_HOTELS);
  const [visibleHotels, setVisibleHotels] = useState<number[]>([]);

  const hotels: Hotel[] = useMemo(() => {
    if (!data?.hotels) return [];
    return data.hotels.map((h: Hotel, idx: number) => ({
      ...h,
      color: HOTEL_COLORS[idx % HOTEL_COLORS.length],
      dailyPrices: getLatestPricePerDay([...(h.dailyPrices || [])]),
    }));
  }, [data]);

  const allDates: string[] = useMemo(() => {
    const dates = hotels.flatMap((h) => h.dailyPrices.map((p) => p.date));
    return Array.from(new Set(dates)).sort();
  }, [hotels]);

  const [dateRangeIdx, setDateRangeIdx] = useState<[number, number]>([
    0,
    Math.max(0, allDates.length - 1),
  ]);
  useEffect(() => {
    if (allDates.length > 1) {
      setDateRangeIdx([0, allDates.length - 1]);
    }
  }, [allDates.length]);

  const [startDate, endDate] = useMemo(() => {
    if (
      allDates.length === 0 ||
      allDates[dateRangeIdx[0]] === undefined ||
      allDates[dateRangeIdx[1]] === undefined
    ) {
      return [null, null];
    }
    return [
      parseDate(allDates[dateRangeIdx[0]]),
      parseDate(allDates[dateRangeIdx[1]]),
    ];
  }, [allDates, dateRangeIdx]);

  useEffect(() => {
    if (data?.hotels && visibleHotels.length === 0) {
      setVisibleHotels(data.hotels.map((h: Hotel) => h.id));
    }
  }, [data]);

  const nivoData = useMemo(
    () =>
      hotels
        .filter((h) => visibleHotels.includes(h.id))
        .map((hotel) => ({
          id: hotel.name + (!hotel.isCompetitor ? " (Mon hôtel)" : ""),
          color: hotel.color,
          data: hotel.dailyPrices
            .filter((p) => {
              const d = parseDate(p.date);
              return (
                (!startDate || (d && d >= startDate)) &&
                (!endDate || (d && d <= endDate))
              );
            })
            .map((p) => ({
              x: parseDate(p.date),
              y: p.price,
            })),
          isCompetitor: hotel.isCompetitor,
        })),
    [hotels, visibleHotels, startDate, endDate]
  );

  const dateMarkers = useMemo(() => {
    if (!startDate && !endDate) return allDates;
    return allDates.filter((d) => {
      const date = parseDate(d);
      return (
        (!startDate || (date && date >= startDate)) &&
        (!endDate || (date && date <= endDate))
      );
    });
  }, [allDates, startDate, endDate]);

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="40vh"
      >
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">Erreur: {error.message}</Alert>;
  if (!data?.hotels) return <Alert severity="info">Aucun hôtel trouvé.</Alert>;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f8fafc",
        py: 2,
        px: { xs: 0.5, sm: 2 },
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        mb={1}
        color="primary.main"
        sx={{
          fontSize: { xs: 20, sm: 26 },
          textAlign: "center",
        }}
      >
        Analyse concurrentielle
      </Typography>
      <Typography
        variant="body2"
        mb={2}
        sx={{
          color: "text.secondary",
          textAlign: "center",
          fontSize: { xs: 14, sm: 15 },
        }}
      >
        Visualisez l'évolution des prix de votre hôtel et de vos concurrents.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="flex-start"
        sx={{ width: "100%" }}
      >
        <Box
          sx={{
            background: "#f7fafd",
            borderRadius: 1,
            p: 1.5,
            mb: { xs: 2, sm: 0 },
            boxShadow: 0,
            minWidth: { xs: "unset", sm: 180 },
            maxWidth: 260,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <HotelLegend
            hotels={hotels}
            visibleHotels={visibleHotels}
            setVisibleHotels={setVisibleHotels}
          />
        </Box>
        <Box flex={1} minWidth={0}>
          <Typography
            gutterBottom
            fontWeight={600}
            color="primary"
            sx={{ letterSpacing: 0.5, fontSize: { xs: 13, sm: 15 } }}
          >
            Plage de dates :
            {allDates[dateRangeIdx[0]] && allDates[dateRangeIdx[1]]
              ? `${formatDateFR(allDates[dateRangeIdx[0]])} — ${formatDateFR(
                  allDates[dateRangeIdx[1]]
                )}`
              : ""}
          </Typography>
          <Slider
            value={dateRangeIdx}
            min={0}
            max={Math.max(0, allDates.length - 1)}
            step={1}
            onChange={(_, v) => setDateRangeIdx(v as [number, number])}
            valueLabelDisplay="auto"
            marks={[
              {
                value: 0,
                label: allDates[0] ? formatDateFR(allDates[0]) : "",
              },
              {
                value: allDates.length - 1,
                label:
                  allDates[allDates.length - 1] &&
                  formatDateFR(allDates[allDates.length - 1]),
              },
            ]}
            disableSwap
            sx={{
              "& .MuiSlider-thumb": {
                bgcolor: "primary.main",
                border: "2px solid #fff",
                boxShadow: 1,
              },
              "& .MuiSlider-track": { bgcolor: "primary.main" },
              "& .MuiSlider-rail": { bgcolor: "#e0e0e0" },
            }}
          />
        </Box>
      </Stack>
      <Box
        height={{ xs: 260, sm: 340, md: 400 }}
        mt={2}
        sx={{
          background: "#f8fafc",
          borderRadius: 2,
          boxShadow: 0,
          p: { xs: 0.5, sm: 1.5 },
          width: "100%",
          minWidth: 0,
          overflowX: "auto",
        }}
      >
        <ResponsiveLine
          data={nivoData}
          margin={{ top: 30, right: 20, bottom: 60, left: 50 }}
          xScale={{ type: "time", format: "native" }}
          xFormat="time:%d/%m/%Y"
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
          }}
          axisBottom={{
            format: "%d/%m",
            tickValues: "every 3 days",
            legend: "",
            legendOffset: 36,
            legendPosition: "middle",
            tickRotation: -30,
          }}
          axisLeft={{
            legend: "",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          enablePoints={false}
          enableSlices="x"
          enableArea={false}
          colors={(d) => d.color as string}
          lineWidth={2}
          pointSize={8}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 12, fill: "#333" },
              },
              legend: { text: { fontSize: 13, fontWeight: 700 } },
            },
            tooltip: {
              container: {
                background: "#fff",
                color: "#222",
                fontSize: 13,
                borderRadius: 8,
                boxShadow: theme.shadows[1],
              },
            },
          }}
          sliceTooltip={CustomTooltip}
          markers={dateMarkers
            .map((date) => parseDate(date))
            .filter((d): d is Date => d !== null)
            .map((date) => ({
              axis: "x",
              value: date,
              lineStyle: {
                stroke: "#bbb",
                strokeWidth: 1,
                strokeDasharray: "2 2",
              },
              legend: "",
            }))}
        />
      </Box>
    </Box>
  );
};

export default AnalyseConcurrentiellePage;