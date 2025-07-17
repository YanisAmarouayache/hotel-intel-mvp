import React, { useState, useCallback } from "react";
import { Box, TextField, IconButton, Typography, CircularProgress } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";
import { useHotelsWithPricesByDateQuery } from "../generated/graphql";
import { PriceTable } from "./PriceTable";

export const PriceTableWithDatePicker: React.FC = React.memo(() => {
  const [selectedDate, setSelectedDate] = useState(() =>
    dayjs().format("YYYY-MM-DD")
  );

  const handleChange = useCallback(
    (newDate: string) => setSelectedDate(newDate),
    []
  );

  const handlePrev = useCallback(() => {
    setSelectedDate((date) =>
      dayjs(date).subtract(1, "day").format("YYYY-MM-DD")
    );
  }, []);

  const handleNext = useCallback(() => {
    setSelectedDate((date) => dayjs(date).add(1, "day").format("YYYY-MM-DD"));
  }, []);

  const { data, loading } = useHotelsWithPricesByDateQuery({
    variables: { date: selectedDate },
  });

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mr: 2 }}>
          Prix du jour
        </Typography>
        <IconButton onClick={handlePrev} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(e) => handleChange(e.target.value)}
          sx={{ width: 150, mx: 1 }}
        />
        <IconButton onClick={handleNext} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <PriceTable hotels={data?.hotelsWithPricesByDate || []} />
      )}
    </Box>
  );
});