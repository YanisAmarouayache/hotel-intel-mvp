import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

interface ScrapeResultDialogProps {
  open: boolean;
  onClose: () => void;
  result?: {
    total: number;
    updated: number;
    stored: number;
  };
  error?: string;
}

const ScrapeResultDialog: React.FC<ScrapeResultDialogProps> = ({ open, onClose, result, error }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {error ? "Erreur lors du scraping" : "Résultat du scraping"}
      </DialogTitle>
      <DialogContent>
        {error ? (
          <Typography color="error" variant="body1">{error}</Typography>
        ) : result ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              <strong>{result.total}</strong> prix trouvés<br />
              <strong>{result.updated}</strong> prix mis à jour<br />
              <strong>{result.stored}</strong> nouveaux prix stockés
            </Typography>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color={error ? "error" : "primary"} autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScrapeResultDialog;
