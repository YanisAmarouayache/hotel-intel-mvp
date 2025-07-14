import  { Box, Typography, Tooltip, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const BatchProgressList = ({
  progressDetails,
  onShowDetails,
}: {
  progressDetails: any;
  onShowDetails: (hotel: any, data: any) => void;
}) => (
  <Box>
    <Typography
      variant="subtitle2"
      sx={{
        mb: 1,
        color: "primary.main",
        fontWeight: 600,
        letterSpacing: 0.5,
      }}
    >
      Détail du batch
    </Typography>
    <Box component="ul" sx={{ pl: 2, m: 0 }}>
      {progressDetails.hotels.map((hotel: any) => {
        const result = progressDetails.results?.find(
          (r: any) => String(r.hotelId) === String(hotel.id)
        );
        const isCurrent =
          progressDetails.current &&
          String(progressDetails.current.hotelId) === String(hotel.id);
        return (
          <Box
            key={hotel.id}
            component="li"
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 0.5,
              fontWeight: isCurrent ? 600 : 400,
              color: result
                ? result.success
                  ? "success.main"
                  : "error.main"
                : isCurrent
                ? "primary.main"
                : "text.primary",
              bgcolor: isCurrent ? "action.hover" : undefined,
              borderRadius: 1,
              px: 1,
              py: 0.5,
              boxShadow: isCurrent ? 2 : 0,
              transition: "box-shadow 0.2s",
            }}
          >
            {result ? (
              result.success ? (
                <span style={{ marginRight: 8, fontSize: 18 }}>✅</span>
              ) : (
                <span style={{ marginRight: 8, fontSize: 18 }}>❌</span>
              )
            ) : isCurrent ? (
              <span style={{ marginRight: 8, fontSize: 18 }}>⏳</span>
            ) : (
              <span
                style={{
                  marginRight: 8,
                  opacity: 0.3,
                  fontSize: 18,
                }}
              >
                •
              </span>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 500 }}>{hotel.name}</span>{" "}
              <a
                href={hotel.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: "#1976d2",
                  textDecoration: "underline",
                  marginLeft: 4,
                  wordBreak: "break-all",
                }}
              >
                (voir)
              </a>
              <span style={{ marginLeft: 8, fontSize: 13 }}>
                {result ? (
                  result.success ? (
                    <span style={{ color: "#388e3c" }}>Succès</span>
                  ) : (
                    <span style={{ color: "#d32f2f" }}>
                      Erreur
                      {result.error ? ` : ${result.error}` : ""}
                    </span>
                  )
                ) : isCurrent ? (
                  <span style={{ color: "#1976d2" }}>En cours...</span>
                ) : (
                  <span style={{ color: "#888" }}>En attente</span>
                )}
              </span>
            </Box>
            {result && (
              <Tooltip title="Voir les détails du scraping">
                <IconButton
                  size="small"
                  onClick={() => onShowDetails(hotel, result.data)}
                  sx={{ ml: 1 }}
                >
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default BatchProgressList;
