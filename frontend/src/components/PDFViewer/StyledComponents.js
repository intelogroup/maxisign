import { styled } from '@mui/material/styles';
import { Paper, Typography, Divider } from '@mui/material';

// Styled components for the PDF viewer
const PreviewContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  minHeight: '800px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
}));

const PDFContainer = styled('div')({
  flex: 1,
  position: 'relative',
  height: '100%',
  '& > div': {
    height: '100%',
  },
});

// Enhanced DropOverlay component with grid guidelines
const DropOverlay = styled('div')(({ theme, isDraggingOver, showGrid }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: isDraggingOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
  border: isDraggingOver ? `2px dashed ${theme.palette.primary.main}` : 'none',
  pointerEvents: isDraggingOver ? 'auto' : 'none',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  backgroundImage: showGrid ? `
    linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
  ` : 'none',
  backgroundSize: '50px 50px',
}));

const DropIndicator = styled('div')(({ theme, x, y }) => ({
  position: 'absolute',
  width: '20px',
  height: '20px',
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  transform: 'translate(-50%, -50%)',
  left: `${x}%`,
  top: `${y}%`,
  pointerEvents: 'none',
  boxShadow: theme.shadows[2],
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '2px',
    height: '2px',
    backgroundColor: theme.palette.primary.main,
    transform: 'translate(-50%, -50%)',
  },
}));

const Coordinates = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  zIndex: 1001,
}));

const ToolbarContainer = styled('div')(({ theme }) => ({
  display: 'flex', 
  position: 'relative', 
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  zIndex: 10, 
  transition: 'opacity 0.2s ease-in-out',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
}));

const ToolbarGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  '& .MuiIconButton-root': {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& .MuiSvgIcon-root': {
      fontSize: '1.5rem',
    },
  },
  '& .MuiTypography-root': {
    padding: theme.spacing(0, 1),
    minWidth: '48px',
    textAlign: 'center',
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  height: '32px',
  margin: theme.spacing(0, 1),
}));

const LoadingOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 1000,
  gap: '10px'
});

const ImageLayer = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10,
});

const PlacedImage = styled('img')(({ theme }) => ({
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  cursor: 'move',
  pointerEvents: 'auto',
  userSelect: 'none',
}));

const ImageControls = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '-30px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: theme.spacing(0.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
  zIndex: 20,
}));

const ResizeHandle = styled('div')(({ theme, position }) => ({
  position: 'absolute',
  width: '12px',
  height: '12px',
  background: theme.palette.primary.main,
  border: `1px solid ${theme.palette.common.white}`,
  borderRadius: '50%',
  cursor: position.includes('top') && position.includes('left') ? 'nwse-resize' : 
          position.includes('top') && position.includes('right') ? 'nesw-resize' :
          position.includes('bottom') && position.includes('left') ? 'nesw-resize' :
          position.includes('bottom') && position.includes('right') ? 'nwse-resize' : 'move',
  zIndex: 20,
  pointerEvents: 'auto',
  ...(position.includes('top') && { top: '-6px' }),
  ...(position.includes('bottom') && { bottom: '-6px' }),
  ...(position.includes('left') && { left: '-6px' }),
  ...(position.includes('right') && { right: '-6px' }),
}));

export {
  PreviewContainer,
  PDFContainer,
  DropOverlay,
  DropIndicator,
  Coordinates,
  ToolbarContainer,
  ToolbarGroup,
  StyledDivider,
  LoadingOverlay,
  ImageLayer,
  PlacedImage,
  ImageControls,
  ResizeHandle
};
