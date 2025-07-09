import { Checkbox, FormControlLabel, Box } from "@mui/material";

type Hotel = {
  id: number;
  name: string;
  isCompetitor: boolean;
  color: string;
};

type Props = {
  hotels: Hotel[];
  visibleHotels: number[];
  setVisibleHotels: (fn: (v: number[]) => number[]) => void;
};

const HotelLegend = ({ hotels, visibleHotels, setVisibleHotels }: Props) => (
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
          <Box alignItems="center">
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

export default HotelLegend;