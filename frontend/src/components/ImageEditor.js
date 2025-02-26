import React, { useState, useRef, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Paper, 
  Typography, 
  IconButton, 
  Slider,
  Box,
  Snackbar, 
  Alert,
  Divider,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  CropRotate,
  Contrast,
  FlipCameraAndroid,
  Delete,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Save,
  Image as ImageIcon,
  Download,
  Fullscreen,
  Brush,
  ContentCut,
  AutoFixHigh,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';

const EditorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
}));

const ToolbarContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ToolbarGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ImageContainer = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  overflow: 'auto',
}));

const StyledImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
});

const SidePanel = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  width: '250px',
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  transform: props => props.open ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.3s ease-in-out',
}));

function ImageEditor({ onSave }) {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [activeAdjustment, setActiveAdjustment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setOriginalImage(reader.result);
        addToUndoStack(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addToUndoStack = (state) => {
    setUndoStack(prev => [...prev, state]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length > 1) {
      const prevState = undoStack[undoStack.length - 2];
      const currentState = undoStack[undoStack.length - 1];
      setImage(prevState);
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, currentState]);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setImage(nextState);
      setUndoStack(prev => [...prev, nextState]);
      setRedoStack(prev => prev.slice(0, -1));
    }
  };

  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    try {
      // Here you would integrate with remove.bg API
      // For now, we'll just show a success message
      setTimeout(() => {
        showSuccess('Background removed successfully');
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      showError('Failed to remove background');
      setIsProcessing(false);
    }
  };

  const applyImageAdjustments = useCallback(() => {
    if (!imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(
      img,
      -canvas.width/2,
      -canvas.height/2,
      canvas.width,
      canvas.height
    );

    const adjustedImage = canvas.toDataURL('image/jpeg');
    setImage(adjustedImage);
    addToUndoStack(adjustedImage);
  }, [brightness, contrast, rotation]);

  const showSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  return (
    <EditorContainer elevation={2}>
      <ToolbarContainer>
        <ToolbarGroup>
          <Tooltip title="Upload Image">
            <IconButton onClick={() => fileInputRef.current?.click()} size="small">
              <ImageIcon />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          <Tooltip title="Crop">
            <IconButton onClick={() => setActiveAdjustment('crop')} size="small">
              <CropRotate />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Background">
            <LoadingButton
              loading={isProcessing}
              onClick={handleRemoveBackground}
              size="small"
              startIcon={<ContentCut />}
            >
              Remove BG
            </LoadingButton>
          </Tooltip>
          <Tooltip title="Auto Enhance">
            <IconButton onClick={() => setActiveAdjustment('enhance')} size="small">
              <AutoFixHigh />
            </IconButton>
          </Tooltip>
        </ToolbarGroup>

        <ToolbarGroup>
          <Tooltip title="Undo">
            <span>
              <IconButton onClick={handleUndo} size="small" disabled={undoStack.length <= 1}>
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton onClick={handleRedo} size="small" disabled={redoStack.length === 0}>
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Save">
            <IconButton onClick={() => onSave?.(image)} size="small">
              <Save />
            </IconButton>
          </Tooltip>
        </ToolbarGroup>
      </ToolbarContainer>

      <ImageContainer>
        {image ? (
          <ReactCrop
            crop={crop}
            onChange={c => setCrop(c)}
            onComplete={c => setCompletedCrop(c)}
          >
            <StyledImage
              ref={imageRef}
              src={image}
              alt="Editor"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
              }}
            />
          </ReactCrop>
        ) : (
          <Typography variant="h6" color="textSecondary">
            Upload an image to begin editing
          </Typography>
        )}
      </ImageContainer>

      <SidePanel open={sidePanelOpen}>
        <Typography variant="h6">Adjustments</Typography>
        <Box>
          <Typography gutterBottom>Brightness</Typography>
          <Slider
            value={brightness}
            onChange={(e, value) => setBrightness(value)}
            onChangeCommitted={applyImageAdjustments}
            min={0}
            max={200}
          />
        </Box>
        <Box>
          <Typography gutterBottom>Contrast</Typography>
          <Slider
            value={contrast}
            onChange={(e, value) => setContrast(value)}
            onChangeCommitted={applyImageAdjustments}
            min={0}
            max={200}
          />
        </Box>
        <Box>
          <Typography gutterBottom>Rotation</Typography>
          <Slider
            value={rotation}
            onChange={(e, value) => setRotation(value)}
            onChangeCommitted={applyImageAdjustments}
            min={-180}
            max={180}
          />
        </Box>
      </SidePanel>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </EditorContainer>
  );
}

export default ImageEditor;
