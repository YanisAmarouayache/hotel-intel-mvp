import { Paper, Typography, Box } from "@mui/material";

const CustomTooltip = ({ slice }: { slice: any }) => {
  const date = slice.points?.[0]?.data?.xFormatted || "";

  return (
    <Paper sx={{ p: 1.5, minWidth: 180 }}>
      <Typography variant="body2" fontWeight={700} gutterBottom>
        {date}
      </Typography>
      {slice.points.map((point: any) => (
        <Box
          key={point.id}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={0.5}
        >
          <Box
            display="flex"
            alignItems="center"
            maxWidth={140}
            title={point.serieId}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: point.serieColor,
                mr: 1,
                flexShrink: 0,
                border: "1.5px solid #fff",
                boxShadow: "0 0 0 1px #bbb",
              }}
            />
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: point.serieColor,
                fontWeight: 600,
              }}
            >
              {point.serieId}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={500}>
            {point.data.yFormatted} €
          </Typography>
        </Box>
      ))}
    </Paper>
  );
};

export default CustomTooltip;