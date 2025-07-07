import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface GenericDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  color?: 'primary' | 'error' | 'success' | 'info' | 'warning';
  okText?: string;
}

const GenericDialog: React.FC<GenericDialogProps> = ({
  open,
  onClose,
  title,
  message,
  color = 'primary',
  okText = 'OK',
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography color={color === 'error' ? 'error' : undefined}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color={color === 'error' ? 'error' : 'primary'}>
          {okText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenericDialog;
