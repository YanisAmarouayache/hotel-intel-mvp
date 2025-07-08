import { useQuery } from "@apollo/client";
import { GET_HOTELS } from "../graphql/queries";
import { ResponsiveLine } from "@nivo/line";
import {
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Slider,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";

// Palette de couleurs pour les hôtels
const HOTEL_COLORS = [
  "#1976d2", "#e57373", "#81c784", "#ffb74d", "#ba68c8", "#4dd0e1", "#ffd54f", "#a1887f", "#90a4ae"
];

// Types
type Hotel = {
  id: number;
  name: string;
  isCompetitor: boolean;
  color: string;
  dailyPrices: { date: string; price: number }[];
};

function parseDate(d: unknown): Date | null {
  if (!d) return null;
  if (typeof d === "string" || typeof d === "number" || d instanceof Date) {
    return new Date(d);
  }
  return null;
}

function formatDateFR(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("fr-FR");
}

// Légende verticale
function HotelLegend({
  hotels,
  visibleHotels,
  setVisibleHotels,
}: {
  hotels: Hotel[];
  visibleHotels: number[];
  setVisibleHotels: (fn: (v: number[]) => number[]) => void;
}) {
  return (
    <Box display="flex" flexDirection="column" gap={1} mb={2}>
      {hotels.map((hotel) => (
        <FormControlLabel
          key={hotel.id}
          control={
            <Checkbox
              checked={visibleHotels.includes(hotel.id)}
              onChange={() =>
                setVisibleHotels((v) =>
                  v.includes(hotel.id)
                    ? v.filter((id) => id !== hotel.id)
                    : [...v, hotel.id]
                )
              }
              sx={{
                color: hotel.color,
                "&.Mui-checked": { color: hotel.color },
              }}
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: hotel.color,
                  mr: 1,
                  border: "1px solid #bbb",
                }}
              />
              <span style={{ fontWeight: hotel.isCompetitor ? 400 : 700 }}>
                {hotel.name}
              </span>
              {!hotel.isCompetitor && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.2,
                    bgcolor: hotel.color,
                    color: "white",
                    borderRadius: 1,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Mon hôtel
                </Box>
              )}
            </Box>
          }
        />
      ))}
    </Box>
  );
}

const AnalyseConcurentiellePage = () => {
  const theme = useTheme();
  const { data, loading, error } = useQuery(GET_HOTELS);
  const [visibleHotels, setVisibleHotels] = useState<number[]>([]);

  // Prépare les données pour Nivo
  const hotels: Hotel[] = useMemo(() => {
    if (!data?.hotels) return [];
    return data.hotels.map((h: any, idx: number) => ({
      ...h,
      color: HOTEL_COLORS[idx % HOTEL_COLORS.length],
      dailyPrices: [...(h.dailyPrices || [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }));
  }, [data]);

  // Toutes les dates uniques (triées)
  const allDates: string[] = useMemo(() => {
    const dates = hotels.flatMap((h) =>
      h.dailyPrices.map((p) => p.date)
    );
    return Array.from(new Set(dates)).sort();
  }, [hotels]);

  // Slider à deux poignées pour la plage de dates
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
      setVisibleHotels(data.hotels.map((h: any) => h.id));
    }
  }, [data]);

  // Génère les séries pour Nivo
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

  // Pour afficher les marqueurs de dates où il y a des prix
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
    <Paper sx={{ p: 3, mb: 4, background: "#fff" }}>
      <Typography variant="h4" fontWeight={700} mb={2} color="primary.main">
        Analyse concurrentielle
      </Typography>
      <Typography variant="body1" mb={2}>
        Visualisez l'évolution des prix de votre hôtel (en couleur) et de vos
        concurrents. Décochez un hôtel pour masquer sa courbe. Sélectionnez une
        plage de dates avec le slider.
      </Typography>
      <HotelLegend
        hotels={hotels}
        visibleHotels={visibleHotels}
        setVisibleHotels={setVisibleHotels}
      />
      <Box mb={2} width={400}>
        <Typography gutterBottom>
          Plage de dates affichée :{" "}
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
        />
      </Box>
      <Box height={420}>
        <ResponsiveLine
          data={nivoData}
          margin={{ top: 40, right: 30, bottom: 80, left: 60 }}
          xScale={{ type: "time", format: "native" }}
          xFormat="time:%d/%m/%Y"
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          axisBottom={{
            format: "%d/%m",
            tickValues: "every 3 days",
            legend: "Date",
            legendOffset: 40,
            legendPosition: "middle",
            tickRotation: -30,
          }}
          axisLeft={{
            legend: "Prix (€)",
            legendOffset: -50,
            legendPosition: "middle",
          }}
          enablePoints={false}
          enableSlices="x"
          enableArea={false}
          colors={d => (d.color as string)}
          lineWidth={2}
          pointSize={8}
          useMesh={true}
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 13, fill: "#333" },
              },
              legend: { text: { fontSize: 14, fontWeight: 700 } },
            },
            tooltip: {
              container: {
                background: "#fff",
                color: "#222",
                fontSize: 14,
                borderRadius: 8,
                boxShadow: theme.shadows[2],
              },
            },
          }}
          tooltip={({ point }) => (
            <Box p={1}>
              <Typography fontWeight={700}>{point.seriesId}</Typography>
              <Typography>
                {point.data.xFormatted} : <b>{point.data.yFormatted} €</b>
              </Typography>
            </Box>
          )}
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
    </Paper>
  );
};

export default AnalyseConcurentiellePage;