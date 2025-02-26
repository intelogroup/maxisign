import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Paper,
  Typography,
  IconButton,
  Slider,
  Button,
  Divider,
  Box,
  CircularProgress,
  Tooltip,
  Fade,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Rotate90DegreesCcw,
  Crop,
  AutoFixHigh,
  Contrast,
  Brightness6,
  ColorLens,
  Layers,
  Save,
  Undo,
  Redo,
  Delete,
  AddPhotoAlternate,
  PhotoCamera,
  Image as ImageIcon,
} from '@mui/icons-material';

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

const StudioHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const Toolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.5),
  gap: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  flexWrap: 'wrap',
}));

const ToolGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.action.hover, 0.5),
}));

const ImageContainer = styled('div')(({ theme }) => ({
  flex: 1,
  minHeight: 0, // Important for proper flex behavior
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f0f0f0',
  padding: theme.spacing(2),
  transition: 'background-color 0.3s ease',
}));

const StyledImage = styled('img')(({ transform }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  transform: transform || 'none',
  transition: 'transform 0.3s ease',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  borderRadius: '4px',
}));

const AdjustmentPanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
  padding: theme.spacing(2),
  width: '250px',
  backgroundColor: alpha(theme.palette.background.paper, 0.95),
  color: theme.palette.text.primary,
  zIndex: 1000,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[8],
  backdropFilter: 'blur(8px)',
}));

const LoadingOverlay = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  color: theme.palette.text.primary,
  zIndex: 1100,
  backdropFilter: 'blur(4px)',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  height: '100%',
  textAlign: 'center',
  gap: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

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

function ImagePreview({ file, onImageChange, disabled }) {
  const [image, setImage] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const theme = useTheme();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Add animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
        addToHistory(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [file]);

  const addToHistory = (imageData) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setImage(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setImage(history[historyIndex + 1]);
    }
  };

  const handleRemoveBackground = async () => {
    setIsRemoving(true);
    try {
      // Here we would integrate with a background removal API
      // For now, this is a placeholder
      setTimeout(() => {
        setIsRemoving(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to remove background:', error);
      setIsRemoving(false);
    }
  };

  const handleSave = () => {
    if (!imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Apply all transformations
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom/100, zoom/100);
    ctx.drawImage(imageRef.current, -canvas.width/2, -canvas.height/2);
    
    const processedImage = canvas.toDataURL('image/png');
    
    // Convert base64 to file
    const byteString = atob(processedImage.split(',')[1]);
    const mimeString = processedImage.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], "edited-image.png", { type: mimeString });
    
    if (onImageChange) {
      onImageChange(file);
    }
  };

  const handleImageUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && onImageChange) {
      onImageChange(selectedFile);
    }
    event.target.value = ''; // Reset input
  };

  const imageTransform = `
    rotate(${rotation}deg)
    scale(${zoom/100})
  `;

  return (
    <Fade in={isInitialized} timeout={800}>
      <StudioContainer elevation={0}>
        <StudioHeader>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Image Editor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adjust and prepare your image
            </Typography>
          </Box>
          {image && (
            <Chip 
              label="Ready to place" 
              color="secondary" 
              size="small"
              sx={{ fontWeight: 500 }}
            />
          )}
        </StudioHeader>
        
        <Toolbar>
          <ToolGroup>
            <Tooltip title="Upload Image">
              <StyledIconButton 
                component="label" 
                color="primary"
                disabled={disabled}
              >
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={disabled}
                />
                <AddPhotoAlternate />
              </StyledIconButton>
            </Tooltip>
            <Tooltip title="Undo">
              <span>
                <StyledIconButton 
                  disabled={historyIndex <= 0 || !image} 
                  onClick={handleUndo}
                  color="primary"
                >
                  <Undo />
                </StyledIconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <StyledIconButton 
                  disabled={historyIndex >= history.length - 1 || !image} 
                  onClick={handleRedo}
                  color="primary"
                >
                  <Redo />
                </StyledIconButton>
              </span>
            </Tooltip>
          </ToolGroup>
          
          {image && (
            <>
              <Divider orientation="vertical" flexItem />
              
              <ToolGroup>
                <Tooltip title="Zoom Out">
                  <StyledIconButton 
                    onClick={() => setZoom(Math.max(zoom - 10, 10))}
                    color="primary"
                  >
                    <ZoomOut />
                  </StyledIconButton>
                </Tooltip>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    minWidth: 40, 
                    textAlign: 'center',
                    fontWeight: 500,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 1,
                    px: 1,
                    py: 0.5
                  }}
                >
                  {zoom}%
                </Typography>
                <Tooltip title="Zoom In">
                  <StyledIconButton 
                    onClick={() => setZoom(Math.min(zoom + 10, 200))}
                    color="primary"
                  >
                    <ZoomIn />
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title="Rotate">
                  <StyledIconButton 
                    onClick={() => setRotation((rotation + 90) % 360)}
                    color="primary"
                  >
                    <Rotate90DegreesCcw />
                  </StyledIconButton>
                </Tooltip>
              </ToolGroup>
              
              <Divider orientation="vertical" flexItem />
              
              <ToolGroup>
                <Tooltip title={showAdjustments ? "Hide Adjustments" : "Show Adjustments"}>
                  <StyledIconButton 
                    onClick={() => setShowAdjustments(!showAdjustments)}
                    color={showAdjustments ? "secondary" : "primary"}
                  >
                    <AutoFixHigh />
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title="Remove Background">
                  <StyledIconButton 
                    onClick={handleRemoveBackground} 
                    disabled={isRemoving}
                    color="primary"
                  >
                    <Layers />
                  </StyledIconButton>
                </Tooltip>
              </ToolGroup>
            </>
          )}
          
          <Box sx={{ flex: 1 }} />
          
          {image && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!image || disabled}
              sx={{ 
                borderRadius: theme.shape.borderRadius,
                transition: 'all 0.2s ease',
                fontWeight: 500,
                px: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
                '&:active': {
                  transform: 'translateY(0)',
                }
              }}
            >
              Apply Changes
            </Button>
          )}
        </Toolbar>

        <ImageContainer>
          {image ? (
            <>
              <StyledImage
                ref={imageRef}
                src={image}
                alt="Editor preview"
                transform={imageTransform}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </>
          ) : (
            <EmptyState>
              <ImageIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                No Image Selected
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                Upload an image to edit and place on your PDF
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddPhotoAlternate />}
                component="label"
                sx={{ mt: 2 }}
                disabled={disabled}
              >
                Select Image
                <input 
                  type="file" 
                  hidden 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  disabled={disabled}
                />
              </Button>
            </EmptyState>
          )}
          
          {isRemoving && (
            <LoadingOverlay>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CircularProgress color="secondary" />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Removing Background...
                </Typography>
              </Box>
            </LoadingOverlay>
          )}
          
          {showAdjustments && image && (
            <Fade in={showAdjustments}>
              <AdjustmentPanel>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                  Image Adjustments
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Brightness
                </Typography>
                <StyledSlider
                  value={brightness}
                  onChange={(e, value) => setBrightness(value)}
                  min={0}
                  max={200}
                  color="secondary"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" gutterBottom>
                  Contrast
                </Typography>
                <StyledSlider
                  value={contrast}
                  onChange={(e, value) => setContrast(value)}
                  min={0}
                  max={200}
                  color="secondary"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" gutterBottom>
                  Saturation
                </Typography>
                <StyledSlider
                  value={saturation}
                  onChange={(e, value) => setSaturation(value)}
                  min={0}
                  max={200}
                  color="secondary"
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    size="small" 
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                      setSaturation(100);
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </AdjustmentPanel>
            </Fade>
          )}
        </ImageContainer>
      </StudioContainer>
    </Fade>
  );
}

export default ImagePreview;
