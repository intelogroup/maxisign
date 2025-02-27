import { styled } from '@mui/material/styles';
import { Paper, Button, Slider, Box, alpha } from '@mui/material';

/**
 * Container for the image editor
 */
const StudioContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: '800px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

/**
 * Header for the image editor
 */
const StudioHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/**
 * Content area for the image editor
 */
const StudioContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
}));

/**
 * Container for the image preview
 */
const ImageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(0, 0, 0, 0.2)' 
    : 'rgba(0, 0, 0, 0.02)',
}));

/**
 * Container for the image controls
 */
const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

/**
 * Row of controls
 */
const ControlsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

/**
 * Styled action button
 */
const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease',
  fontWeight: 500,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

/**
 * Styled slider for image adjustments
 */
const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-thumb': {
    transition: 'transform 0.2s ease',
    '&:hover': {
      boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
    },
    '&:active': {
      transform: 'scale(1.2)',
    },
  },
}));

/**
 * Container for the canvas
 */
const CanvasContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
});

export {
  StudioContainer,
  StudioHeader,
  StudioContent,
  ImageContainer,
  ControlsContainer,
  ControlsRow,
  ActionButton,
  StyledSlider,
  CanvasContainer
};
