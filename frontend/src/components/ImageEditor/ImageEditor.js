import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  IconButton, 
  Tooltip, 
  Grid, 
  InputAdornment,
  TextField,
  Divider
} from '@mui/material';
import {
  Crop,
  Rotate90DegreesCcw,
  FlipCameraAndroid,
  Contrast,
  Brightness6,
  Save,
  Close,
  ZoomIn,
  ZoomOut,
  RestartAlt
} from '@mui/icons-material';
import {
  StudioContainer,
  StudioHeader,
  StudioContent,
  ImageContainer,
  ControlsContainer,
  ControlsRow,
  ActionButton,
  StyledSlider,
  CanvasContainer
} from './StyledComponents';

/**
 * ImageEditor Component
 * 
 * A component for editing images with various adjustments
 * 
 * @param {Object} props - Component props
 * @param {string} props.imageUrl - URL of the image to edit
 * @param {Function} props.onSave - Callback when image is saved
 * @param {Function} props.onCancel - Callback when editing is cancelled
 */
function ImageEditor({ imageUrl, onSave, onCancel }) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Load the image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImageLoaded(true);
      setImageWidth(img.naturalWidth);
      setImageHeight(img.naturalHeight);
    };
    img.src = imageUrl;
    
    return () => {
      img.onload = null;
    };
  }, [imageUrl]);
  
  /**
   * Reset all adjustments
   */
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setFlipHorizontal(false);
    setFlipVertical(false);
  };
  
  const convertToPDFCoordinates = (x, y) => {
    // PDF coordinates start from bottom-left
    return {
      x: x,
      y: imageHeight - y
    };
  };

  /**
   * Save the edited image
   */
  const handleSave = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    const pdfCoords = convertToPDFCoordinates(imageX, imageY);
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageWidth;
    canvas.height = imageHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    ctx.translate(pdfCoords.x, pdfCoords.y);
    ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
    
    ctx.restore();
    
    const editedImageUrl = canvas.toDataURL('image/png');
    onSave(editedImageUrl);
  };
  
  /**
   * Get the transform style for the image
   */
  const getImageTransform = () => {
    return {
      transform: `
        scale(${zoom / 100})
        rotate(${rotation}deg)
        scaleX(${flipHorizontal ? -1 : 1})
        scaleY(${flipVertical ? -1 : 1})
      `,
      filter: `
        brightness(${brightness}%)
        contrast(${contrast}%)
      `,
    };
  };
  
  const handleCornerDrag = (e, position) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = imageWidth;
    const startHeight = imageHeight;
    const startXPos = imageX;
    const startYPos = imageY;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;

      switch(position) {
        case 'top-left':
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newX = startXPos + deltaX;
          newY = startYPos + deltaY;
          break;
        case 'top-right':
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight - deltaY);
          newY = startYPos + deltaY;
          break;
        case 'bottom-left':
          newWidth = Math.max(50, startWidth - deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          newX = startXPos + deltaX;
          break;
        case 'bottom-right':
          newWidth = Math.max(50, startWidth + deltaX);
          newHeight = Math.max(50, startHeight + deltaY);
          break;
        default:
          break;
      }

      setImageWidth(newWidth);
      setImageHeight(newHeight);
      setImageX(newX);
      setImageY(newY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const CornerHandle = ({ position, onDrag }) => {
    const handleStyle = {
      position: 'absolute',
      width: 10,
      height: 10,
      backgroundColor: 'red',
      cursor: 'pointer',
      ...positionStyles[position]
    };

    return (
      <div 
        style={handleStyle}
        onMouseDown={(e) => onDrag(e, position)}
      />
    );
  };

  const positionStyles = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 }
  };
  
  return (
    <StudioContainer>
      <StudioHeader>
        <Typography variant="h6">Image Editor</Typography>
        <Box>
          <Tooltip title="Cancel">
            <IconButton onClick={onCancel} color="default">
              <Close />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save">
            <IconButton 
              onClick={handleSave} 
              color="primary"
              disabled={!imageLoaded}
            >
              <Save />
            </IconButton>
          </Tooltip>
        </Box>
      </StudioHeader>
      
      <StudioContent>
        <ImageContainer>
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Edit preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                ...getImageTransform(),
              }}
            />
          )}
          <CornerHandle position="top-left" onDrag={handleCornerDrag} />
          <CornerHandle position="top-right" onDrag={handleCornerDrag} />
          <CornerHandle position="bottom-left" onDrag={handleCornerDrag} />
          <CornerHandle position="bottom-right" onDrag={handleCornerDrag} />
        </ImageContainer>
        
        <CanvasContainer>
          <canvas ref={canvasRef} />
        </CanvasContainer>
      </StudioContent>
      
      <ControlsContainer>
        <Grid container spacing={2}>
          {/* Zoom Controls */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Zoom
            </Typography>
            <ControlsRow>
              <IconButton 
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                size="small"
              >
                <ZoomOut />
              </IconButton>
              
              <StyledSlider
                value={zoom}
                onChange={(_, value) => setZoom(value)}
                min={50}
                max={200}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}%`}
                sx={{ flexGrow: 1 }}
              />
              
              <IconButton 
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                size="small"
              >
                <ZoomIn />
              </IconButton>
              
              <TextField
                value={zoom}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 50 && value <= 200) {
                    setZoom(value);
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                size="small"
                sx={{ width: '80px' }}
              />
            </ControlsRow>
          </Grid>
          
          {/* Rotation Controls */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Rotation
            </Typography>
            <ControlsRow>
              <IconButton 
                onClick={() => setRotation((rotation - 90) % 360)}
                size="small"
              >
                <Rotate90DegreesCcw />
              </IconButton>
              
              <StyledSlider
                value={rotation}
                onChange={(_, value) => setRotation(value)}
                min={0}
                max={360}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}°`}
                sx={{ flexGrow: 1 }}
              />
              
              <TextField
                value={rotation}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0 && value <= 360) {
                    setRotation(value);
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">°</InputAdornment>,
                }}
                size="small"
                sx={{ width: '80px' }}
              />
            </ControlsRow>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Brightness and Contrast */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Brightness
            </Typography>
            <ControlsRow>
              <Brightness6 fontSize="small" color="action" />
              
              <StyledSlider
                value={brightness}
                onChange={(_, value) => setBrightness(value)}
                min={50}
                max={150}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}%`}
                sx={{ flexGrow: 1 }}
              />
              
              <TextField
                value={brightness}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 50 && value <= 150) {
                    setBrightness(value);
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                size="small"
                sx={{ width: '80px' }}
              />
            </ControlsRow>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Contrast
            </Typography>
            <ControlsRow>
              <Contrast fontSize="small" color="action" />
              
              <StyledSlider
                value={contrast}
                onChange={(_, value) => setContrast(value)}
                min={50}
                max={150}
                valueLabelDisplay="auto"
                valueLabelFormat={value => `${value}%`}
                sx={{ flexGrow: 1 }}
              />
              
              <TextField
                value={contrast}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 50 && value <= 150) {
                    setContrast(value);
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                size="small"
                sx={{ width: '80px' }}
              />
            </ControlsRow>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          {/* Flip Controls and Reset */}
          <Grid item xs={12}>
            <ControlsRow sx={{ justifyContent: 'space-between' }}>
              <Box>
                <Tooltip title="Flip Horizontal">
                  <IconButton 
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    color={flipHorizontal ? 'primary' : 'default'}
                  >
                    <FlipCameraAndroid 
                      sx={{ transform: 'rotate(90deg)' }} 
                    />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Flip Vertical">
                  <IconButton 
                    onClick={() => setFlipVertical(!flipVertical)}
                    color={flipVertical ? 'primary' : 'default'}
                  >
                    <FlipCameraAndroid />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Crop (Coming Soon)">
                  <span>
                    <IconButton disabled>
                      <Crop />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              
              <ActionButton
                variant="outlined"
                color="secondary"
                startIcon={<RestartAlt />}
                onClick={handleReset}
              >
                Reset All
              </ActionButton>
            </ControlsRow>
          </Grid>
        </Grid>
      </ControlsContainer>
    </StudioContainer>
  );
}

export default ImageEditor;
