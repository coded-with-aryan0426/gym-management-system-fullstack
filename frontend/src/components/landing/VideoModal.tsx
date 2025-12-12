import React from 'react';
import { Dialog, IconButton, Box, Slide } from '@mui/material';
import { X, Play } from 'lucide-react';
import { TransitionProps } from '@mui/material/transitions';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoId?: string; // YouTube video ID
}

export default function VideoModal({ open, onClose, videoId = "dQw4w9WgXcQ" }: VideoModalProps) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'hidden',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: -50,
            right: 0,
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <X size={24} />
        </IconButton>

        <Box
          component="iframe"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Product Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        />
      </Box>
    </Dialog>
  );
}
