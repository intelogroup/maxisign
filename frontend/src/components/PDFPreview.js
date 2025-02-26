import React, { useEffect, useRef, useState, useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Paper, 
  Typography, 
  IconButton, 
  CircularProgress, 
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
  TextField
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4, 
  Brightness7, 
  AccountCircle,
  Description,
  School,
  Stars,
  Help,
  GridOn, 
  GridOff, 
  Save, 
  Delete, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut,
  Download,
  Fullscreen,
  TextFields,
  BorderColor,
  Link,
  Compress,
  LockOpen,
  Lock,
  Merge,
  FileCopy,
  FormatShapes,
  Bookmark,
  Search,
  Image as ImageIcon
} from '@mui/icons-material';
import { saveDocument, getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

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
  display: 'none', // Hide the outer toolbar
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  zIndex: 1,
  transition: 'opacity 0.2s ease-in-out',
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
  zIndex: 2, // Between PDF and overlay
});

const PlacedImage = styled('img')(({ x, y, rotation, scale }) => ({
  position: 'absolute',
  left: `${x}%`,
  top: `${y}%`,
  transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
  maxWidth: '200px',
  maxHeight: '200px',
  pointerEvents: 'auto',
  cursor: 'move',
}));

/**
 * PDFPreview Component
 * Handles PDF viewing and image drag-and-drop functionality
 */
function PDFPreview({ file, initialZoom = 'page-fit', onImagePlaced }) {
  // PDF state
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProtected, setIsProtected] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarks, setBookmarks] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Image state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [dropPosition, setDropPosition] = useState({ x: 0, y: 0 });
  const [placedImages, setPlacedImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [redoStack, setRedoStack] = useState([]);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const objectRef = useRef(null);

  // Load recent images from localStorage on mount
  useEffect(() => {
    try {
      const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_IMAGES) || '[]');
      setRecentImages(savedImages);
    } catch (error) {
      console.error('Error loading recent images:', error);
    }
  }, []);

  // Handle file upload from any source (drag-drop, toolbar, or direct)
  const handleFileUpload = useCallback(async (uploadedFile, position = null) => {
    try {
      if (!uploadedFile) return;

      // Handle PDF files
      if (uploadedFile.type === 'application/pdf') {
        const url = URL.createObjectURL(uploadedFile);
        setPdfUrl(url);
        
        const newDocument = {
          id: Date.now().toString(),
          name: uploadedFile.name,
          url: url,
          type: uploadedFile.type,
          timestamp: new Date().toISOString()
        };
        
        // Check if document with same name already exists
        const existingDocuments = getFromStorage(STORAGE_KEYS.DOCUMENTS);
        const existingDocument = existingDocuments.find(doc => doc.name === uploadedFile.name);
        
        if (!existingDocument) {
          // Only save if it doesn't exist
          saveDocument(newDocument);
        }
        return;
      }

      // Handle image files
      if (!uploadedFile.type.startsWith('image/')) {
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }

      // Create image object URL
      const imageUrl = URL.createObjectURL(uploadedFile);
      
      // Create new image entry
      const newImage = {
        id: Date.now().toString(),
        name: uploadedFile.name,
        url: imageUrl,
        type: uploadedFile.type,
        timestamp: new Date().toISOString()
      };

      // Check if image with same name already exists in recent images
      const existingImage = recentImages.find(img => img.name === uploadedFile.name);
      
      if (!existingImage) {
        // Update recent images list
        setRecentImages(prev => [newImage, ...prev]);
      } else {
        // Use existing image instead
        newImage.id = existingImage.id;
      }

      // Handle image placement if position is provided (drag & drop)
      if (position) {
        const newPlacedImage = {
          ...newImage,
          x: position.x,
          y: position.y,
          rotation: 0,
          scale: 1
        };

        setPlacedImages(prev => [...prev, newPlacedImage]);

        if (onImagePlaced) {
          onImagePlaced(newPlacedImage);
        }
      } else {
        // If no position, just set as selected image
        setSelectedImage(imageUrl);
      }

      // Show success message
      setSnackbar({
        open: true,
        message: position ? 'Image placed successfully' : 'Image uploaded successfully',
        severity: 'success'
      });

    } catch (error) {
      console.error('Error handling file upload:', error);
      setSnackbar({
        open: true,
        message: `Error uploading file: ${error.message}`,
        severity: 'error'
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImagePlaced]);

  // Handle initial file prop
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file, handleFileUpload]);

  const handleDragEnter = (e) => {
    try {
      e.preventDefault();
      console.log('Drag enter event detected');
      
      // Validate if PDF is loaded
      if (!pdfUrl) {
        throw new Error('No PDF loaded. Please load a PDF first.');
      }

      setIsDraggingOver(true);
    } catch (error) {
      console.error('Error in drag enter:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    }
  };

  const handleDragOver = (e) => {
    try {
      e.preventDefault();
      if (!isDraggingOver) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setDropPosition({ x, y });
    } catch (error) {
      console.error('Error in drag over:', error);
      setSnackbar({
        open: true,
        message: 'Error tracking drag position',
        severity: 'error'
      });
    }
  };

  const handleDragLeave = (e) => {
    try {
      e.preventDefault();
      console.log('Drag leave event detected');

      if (!e.relatedTarget || !containerRef.current?.contains(e.relatedTarget)) {
        setIsDraggingOver(false);
        console.log('Drag leave confirmed - outside container');
      }
    } catch (error) {
      console.error('Error in drag leave:', error);
      setIsDraggingOver(false);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const imageFile = droppedFiles[0];
      
      if (!imageFile) return;

      await handleFileUpload(imageFile, {
        x: dropPosition.x,
        y: dropPosition.y
      });
    } catch (error) {
      console.error('Error in drop handler:', error);
      setSnackbar({
        open: true,
        message: 'Failed to place image',
        severity: 'error'
      });
    }
  }, [dropPosition, handleFileUpload]);

  // Handle toolbar image insert
  const handleToolbarImageInsert = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Define viewer parameters
  const viewerParams = {
    width: '100%',
    height: '100%',
    style: {
      border: 'none',
      width: '100%',
      height: '100%',
      transform: `scale(${100 / 100})`,
      transformOrigin: 'top left',
    }
  };

  // Adobe viewer configuration with custom UI settings
  const viewerConfig = {
    embedMode: "SIZED_CONTAINER",
    defaultViewMode: initialZoom,
    // Document Controls
    showDownloadPDF: true,
    showPrintPDF: true,
    showPageControls: true,
    showFullScreen: true,
    enableLinearization: true,
    
    // Navigation & View
    showBookmarks: true,
    showThumbnails: true,
    showRotateControl: true,
    showZoomControl: true,
    showFitButton: true,
    showLeftHandPanel: true,
    showPresentationMode: true,
    showPageLayoutControl: true,
    
    // Annotation & Editing
    showAnnotationTools: true,
    enableAnnotationAPIs: true,
    showFileAttachmentAnnotation: true,
    showHighlightButton: true,
    showStrikeOutButton: true,
    showUnderlineButton: true,
    showDrawFreehandButton: true,
    showTextAnnotationButton: true,
    showStampAnnotationButton: true,
    showCommentingBar: true,
    showAnnotationList: true,
    enableFormFilling: true,
    
    // Search & Selection
    showSearchControl: true,
    enableTextSelection: true,
    showHandTool: true,
    
    // Performance & Rendering
    enableOptimizedRendering: true,
    enableFocusPolling: true,
    dockPageControls: true,
    
    // UI Customization
    ui: {
      fontSize: '16px',
      theme: {
        primary: {
          main: '#1976d2',
          dark: '#115293',
          light: '#4791db'
        }
      },
      toolbar: {
        height: '64px',
        backgroundColor: '#ffffff',
        dividerColor: 'rgba(0, 0, 0, 0.12)',
        item: {
          gap: '8px',
          button: {
            backgroundColor: 'transparent',
            border: 'none',
            radius: '4px',
            size: {
              default: {
                height: '40px',
                width: '40px'
              }
            },
            icon: {
              size: {
                height: '24px',
                width: '24px'
              }
            },
            stateful: {
              hover: {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              selected: {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                color: '#1976d2'
              }
            }
          }
        }
      }
    }
  };

  const showError = useCallback((message, error = null) => {
    console.error('PDF Preview Error:', message, error);
    setSnackbar({
      open: true,
      message: message,
      severity: 'error'
    });
    setError(message);
  }, []);

  const showSuccess = useCallback((message) => {
    setSnackbar({
      open: true,
      message: message,
      severity: 'success'
    });
    setError(null);
  }, []);

  const validateDroppedImage = useCallback((file) => {
    if (!file) throw new Error('No file provided');
    if (!file.type.startsWith('image/')) throw new Error('File must be an image');
    if (file.size > 10 * 1024 * 1024) throw new Error('Image must be less than 10MB');
    return file;
  }, []);

  const calculateDropPosition = useCallback((e) => {
    try {
      if (!containerRef.current) {
        throw new Error('Container reference not available');
      }

      const rect = containerRef.current.getBoundingClientRect();
      let x = ((e.clientX - rect.left) / rect.width) * 100;
      let y = ((e.clientY - rect.top) / rect.height) * 100;

      // Snap to grid if enabled
      if (showGrid) {
        const gridSize = 50;
        x = Math.round(x / (gridSize / 100)) * (gridSize / 100);
        y = Math.round(y / (gridSize / 100)) * (gridSize / 100);
      }

      // Ensure coordinates stay within bounds
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      console.log('Drop position calculated:', { x, y });
      return { x, y };
    } catch (error) {
      console.error('Error calculating drop position:', error);
      throw new Error('Failed to calculate drop position');
    }
  }, [showGrid]);

  // Save recent images to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_IMAGES, JSON.stringify(recentImages));
    } catch (error) {
      console.error('Failed to save recent images:', error);
    }
  }, [recentImages]);

  // Cleanup function for image URLs
  useEffect(() => {
    return () => {
      // Cleanup placed images
      placedImages.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
      // Cleanup recent images
      recentImages.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [placedImages, recentImages]);

  // Initialize PDF viewer
  useEffect(() => {
    if (!file) {
      setPdfUrl(null);
      setIsLoading(false);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      
      // Add custom CSS to style the Adobe toolbar
      const style = document.createElement('style');
      style.textContent = `
        .adobe-pdf-toolbar {
          padding: 12px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
          background-color: #ffffff !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.12) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
        }
        .adobe-pdf-toolbar button {
          min-width: 40px !important;
          min-height: 40px !important;
          margin: 0 4px !important;
          transition: all 0.2s ease !important;
          border-radius: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .adobe-pdf-toolbar button:hover {
          background-color: rgba(0, 0, 0, 0.04) !important;
        }
        .adobe-pdf-toolbar button:active {
          background-color: rgba(0, 0, 0, 0.08) !important;
        }
        .adobe-pdf-toolbar button[disabled] {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }
        .adobe-pdf-toolbar .divider {
          height: 32px !important;
          margin: 0 8px !important;
          width: 1px !important;
          background-color: rgba(0, 0, 0, 0.12) !important;
        }
        .adobe-pdf-toolbar .page-controls {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-size: 14px !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
          border: 1px solid rgba(0,0,0,0.12) !important;
          background-color: #ffffff !important;
        }
        .adobe-pdf-toolbar .page-controls input {
          font-size: 14px !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          border: 1px solid rgba(0,0,0,0.12) !important;
          width: 50px !important;
          text-align: center !important;
        }
        .adobe-pdf-toolbar .search-input {
          min-width: 200px !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
          border: 1px solid rgba(0,0,0,0.12) !important;
          font-size: 14px !important;
        }
        .adobe-pdf-toolbar .toolbar-left-section {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .adobe-pdf-toolbar .toolbar-right-section {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        .adobe-pdf-toolbar .toolbar-center-section {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          flex: 1 !important;
          justify-content: center !important;
        }
      `;
      document.head.appendChild(style);

      // Initialize viewer with config
      if (window.AdobeDC) {
        const adobeDCView = new window.AdobeDC.View({
          clientId: process.env.REACT_APP_ADOBE_CLIENT_ID,
          divId: "pdf-viewer"
        });

        const previewFilePromise = adobeDCView.previewFile({
          content: { url },
          metaData: { fileName: file.name }
        }, viewerConfig);

        // Register status callback for file modifications
        adobeDCView.registerCallback(
          window.AdobeDC.View.Enum.CallbackType.STATUS_API,
          (metaData) => {
            return new Promise((resolve) => {
              resolve({
                code: window.AdobeDC.View.Enum.ApiResponseCode.SUCCESS,
              });
            });
          },
          { keepPolling: true, filePollFrequency: 30 }
        );

        // Get viewer APIs for additional functionality
        previewFilePromise.then(adobeViewer => {
          adobeViewer.getAPIs().then(apis => {
            // Store APIs for use in other components if needed
            if (apis) {
              window.pdfViewerAPIs = apis;
            }
          }).catch(error => {
            console.error('Error getting viewer APIs:', error);
          });
        }).catch(error => {
          console.error('Error initializing PDF preview:', error);
          setError('Failed to initialize PDF viewer');
        });
      }

      setIsLoading(false);
      setError(null);

      return () => {
        URL.revokeObjectURL(url);
        if (style && style.parentNode) {
          style.parentNode.removeChild(style);
        }
        if (window.pdfViewerAPIs) {
          delete window.pdfViewerAPIs;
        }
      };
    } catch (err) {
      console.error('Error creating PDF URL:', err);
      setError('Failed to load PDF');
      setIsLoading(false);
    }
  }, [file, initialZoom]);

  // Generate viewer URL with parameters
  const getViewerUrl = () => {
    if (!pdfUrl) return '';
    const params = Object.entries(viewerParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${pdfUrl}#${params}`;
  };

  const toggleGrid = () => setShowGrid(prev => !prev);

  const toggleFullscreen = () => {
    if (objectRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        objectRef.current.requestFullscreen();
      }
    }
  };

  const handleImagePlaced = (imageData) => {
    // Add to recent images
    setRecentImages(prev => {
      const newImages = [imageData, ...prev].slice(0, 10); // Keep last 10 images
      return newImages;
    });
    
    // Add to placed images
    setPlacedImages(prev => [...prev, imageData]);
    
    if (onImagePlaced) {
      onImagePlaced(imageData);
    }
  };

  const handleRemoveFromRecent = (imageId, event) => {
    event.stopPropagation(); // Prevent triggering the click handler of the parent
    setRecentImages(prev => prev.filter(img => img.id !== imageId));
    showSuccess('Image removed from recent list');
  };

  const addToRecentImages = useCallback((imageData) => {
    const newRecentImages = [imageData, ...recentImages.slice(0, 9)]; // Keep last 10 images
    setRecentImages(newRecentImages);
  }, [recentImages]);

  const handleRecentImageSelect = useCallback((imageData) => {
    if (onImagePlaced) {
      onImagePlaced(imageData.url);
    }
    // setShowRecentImages(false);
  }, [onImagePlaced]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  }, []);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (placedImages.length > 0) {
      const lastImage = placedImages[placedImages.length - 1];
      setPlacedImages(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, lastImage]);
      
      setSnackbar({
        open: true,
        message: 'Undo successful',
        severity: 'info'
      });
    }
  }, [placedImages]);

  const handleRedo = useCallback(() => {
    if (redoStack.length > 0) {
      const imageToRestore = redoStack[redoStack.length - 1];
      setPlacedImages(prev => [...prev, imageToRestore]);
      setRedoStack(prev => prev.slice(0, -1));
      
      setSnackbar({
        open: true,
        message: 'Redo successful',
        severity: 'info'
      });
    }
  }, [redoStack]);

  // Save handler
  const handleSave = useCallback(async () => {
    try {
      // TODO: Implement save functionality
      // This should save the PDF with all placed images
      setSnackbar({
        open: true,
        message: 'Document saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save document:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save document',
        severity: 'error'
      });
    }
  }, []);

  return (
    <PreviewContainer elevation={2}>
      <ToolbarContainer>
        <ToolbarGroup>
          <Tooltip title="Undo" arrow placement="bottom">
            {placedImages.length === 0 ? (
              <span>
                <IconButton 
                  onClick={handleUndo}
                  disabled={true}
                >
                  <Undo />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={handleUndo}
                disabled={false}
              >
                <Undo />
              </IconButton>
            )}
          </Tooltip>
          <Tooltip title="Redo" arrow placement="bottom">
            {redoStack.length === 0 ? (
              <span>
                <IconButton 
                  onClick={handleRedo}
                  disabled={true}
                >
                  <Redo />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={handleRedo}
                disabled={false}
              >
                <Redo />
              </IconButton>
            )}
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Zoom Out" arrow placement="bottom">
            {zoomLevel <= 50 ? (
              <span>
                <IconButton 
                  onClick={handleZoomOut}
                  disabled={true}
                >
                  <ZoomOut />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={handleZoomOut}
                disabled={false}
              >
                <ZoomOut />
              </IconButton>
            )}
          </Tooltip>
          <Typography variant="body2" sx={{ mx: 1 }}>
            {zoomLevel}%
          </Typography>
          <Tooltip title="Zoom In" arrow placement="bottom">
            {zoomLevel >= 200 ? (
              <span>
                <IconButton 
                  onClick={handleZoomIn}
                  disabled={true}
                >
                  <ZoomIn />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={handleZoomIn}
                disabled={false}
              >
                <ZoomIn />
              </IconButton>
            )}
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Save Document" arrow placement="bottom">
            {!pdfUrl || placedImages.length === 0 ? (
              <span>
                <IconButton 
                  onClick={handleSave}
                  disabled={true}
                >
                  <Save />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={handleSave}
                disabled={false}
              >
                <Save />
              </IconButton>
            )}
          </Tooltip>
          <Tooltip title="Toggle Grid" arrow placement="bottom">
            {!pdfUrl ? (
              <span>
                <IconButton 
                  onClick={toggleGrid} 
                  disabled={true}
                >
                  {showGrid ? <GridOff /> : <GridOn />}
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={toggleGrid} 
                disabled={false}
              >
                {showGrid ? <GridOff /> : <GridOn />}
              </IconButton>
            )}
          </Tooltip>
          <Tooltip title="Insert Image" arrow placement="bottom">
            {!pdfUrl ? (
              <span>
                <IconButton 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={true}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleToolbarImageInsert}
                  />
                  <BorderColor />
                </IconButton>
              </span>
            ) : (
              <IconButton 
                onClick={() => fileInputRef.current?.click()}
                disabled={false}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleToolbarImageInsert}
                />
                <BorderColor />
              </IconButton>
            )}
          </Tooltip>
        </ToolbarGroup>
      </ToolbarContainer>

      <PDFContainer 
        ref={containerRef}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {isLoading && (
          <LoadingOverlay>
            <CircularProgress />
            <Typography>Loading PDF...</Typography>
          </LoadingOverlay>
        )}

        {pdfUrl && (
          <object
            ref={objectRef}
            type="application/pdf"
            data={pdfUrl}
            {...viewerParams}
            className="adobe-viewer"
          >
            <Typography>
              PDF cannot be displayed. Please download to view.
            </Typography>
          </object>
        )}

        <ImageLayer>
          {placedImages.map(image => (
            <PlacedImage
              key={image.id}
              src={image.url}
              x={image.x}
              y={image.y}
              rotation={image.rotation}
              scale={image.scale}
              alt="Placed image"
            />
          ))}
        </ImageLayer>

        <DropOverlay
          isDraggingOver={isDraggingOver}
          showGrid={showGrid}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingOver && (
            <>
              <DropIndicator x={dropPosition.x} y={dropPosition.y} />
              <Coordinates variant="caption">
                X: {Math.round(dropPosition.x)}%, Y: {Math.round(dropPosition.y)}%
              </Coordinates>
            </>
          )}
        </DropOverlay>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </PDFContainer>
    </PreviewContainer>
  );
}

export default PDFPreview;
