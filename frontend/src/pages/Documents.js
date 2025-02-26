import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea,
  CardMedia,
  IconButton,
  Box,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Pagination,
  CircularProgress,
  Fab,
  Snackbar,
  Paper
} from '@mui/material';
import { 
  Description, 
  Image, 
  MoreVert, 
  Delete, 
  Download, 
  Share,
  DeleteSweep,
  FilterList
} from '@mui/icons-material';
import { 
  getFromStorage, 
  STORAGE_KEYS, 
  deleteDocument, 
  deleteImage,
  clearAllDocuments,
  clearAllImages
} from '../utils/localStorage';

// Constants
const ITEMS_PER_PAGE = 12;

// Memoized Item Card Component
const DocumentCard = memo(({ item, tabValue, onItemClick, onMenuOpen }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      <CardActionArea 
        onClick={() => onItemClick(item)}
      >
        {tabValue === 0 ? (
          <CardMedia
            component="div"
            sx={{
              height: 140,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Description sx={{ fontSize: 60, color: 'grey.400' }} />
          </CardMedia>
        ) : (
          <CardMedia
            component="img"
            sx={{
              height: 140,
              objectFit: 'cover'
            }}
            src={item.data}
            alt={item.name}
            loading="lazy"
          />
        )}
        <CardContent>
          <Typography variant="subtitle1" noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(item.createdAt || item.timestamp).toLocaleDateString()}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8,
          bgcolor: 'rgba(255,255,255,0.8)',
          borderRadius: '50%'
        }}
      >
        <Tooltip title="More actions">
          <IconButton 
            size="small"
            onClick={(e) => onMenuOpen(e, item)}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
});

DocumentCard.displayName = 'DocumentCard';

// Empty State Component
const EmptyState = memo(({ tabValue }) => (
  <Box 
    sx={{ 
      width: '100%', 
      textAlign: 'center', 
      py: 8,
      color: 'text.secondary'
    }}
  >
    <Typography variant="h6">
      {tabValue === 0 ? 'No documents yet' : 'No images yet'}
    </Typography>
    <Typography variant="body2">
      {tabValue === 0 
        ? 'Your PDF documents will appear here' 
        : 'Your uploaded images will appear here'}
    </Typography>
  </Box>
));

EmptyState.displayName = 'EmptyState';

const Documents = () => {
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load documents and images from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate async operation to avoid blocking UI
        await new Promise(resolve => setTimeout(resolve, 0));
        const loadedDocs = getFromStorage(STORAGE_KEYS.DOCUMENTS);
        const loadedImages = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
        setDocuments(loadedDocs);
        setImages(loadedImages);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPage(1);
  }, [tabValue]);

  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleMenuOpen = useCallback((event, item) => {
    event.stopPropagation();
    setSelectedItem(item);
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
    setSelectedItem(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;

    if (tabValue === 0) {
      deleteDocument(selectedItem.id);
      setDocuments(prev => prev.filter(doc => doc.id !== selectedItem.id));
    } else {
      deleteImage(selectedItem.id);
      setImages(prev => prev.filter(img => img.id !== selectedItem.id));
    }
    handleMenuClose();
  }, [selectedItem, tabValue, handleMenuClose]);

  const handleDownload = useCallback(() => {
    if (!selectedItem) return;
    
    try {
      const link = document.createElement('a');
      if (selectedItem.type === 'application/pdf') {
        link.href = selectedItem.url;
      } else if (selectedItem.type.startsWith('image/')) {
        link.href = selectedItem.data;
      }
      link.download = selectedItem.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      handleMenuClose();
    } catch (error) {
      console.error('Error downloading item:', error);
      setSnackbarMessage(`Error downloading item: ${error.message}`);
      setSnackbarOpen(true);
    }
  }, [selectedItem, handleMenuClose, setSnackbarMessage, setSnackbarOpen]);

  const handleShare = useCallback(() => {
    if (!selectedItem) return;
    
    try {
      if (navigator.share) {
        navigator.share({
          title: selectedItem.name,
          text: `Sharing ${selectedItem.name}`,
          url: selectedItem.type === 'application/pdf' ? selectedItem.url : selectedItem.data
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(selectedItem.type === 'application/pdf' ? selectedItem.url : selectedItem.data)
          .then(() => {
            setSnackbarMessage('Link copied to clipboard!');
            setSnackbarOpen(true);
          });
      }
    } catch (error) {
      console.error('Error sharing item:', error);
      setSnackbarMessage(`Error sharing item: ${error.message}`);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  }, [selectedItem, handleMenuClose, setSnackbarMessage, setSnackbarOpen]);

  const handleItemClick = useCallback((item) => {
    try {
      if (item.type === 'application/pdf') {
        window.open(item.url, '_blank');
      } else if (item.type.startsWith('image/')) {
        const w = window.open("");
        w.document.write(`
          <html>
            <head>
              <title>${item.name}</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: #f5f5f5;
                }
                img {
                  max-width: 95%;
                  max-height: 95vh;
                  object-fit: contain;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
              </style>
            </head>
            <body>
              <img src="${item.data}" alt="${item.name}" />
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error opening item:', error);
      setSnackbarMessage(`Error opening item: ${error.message}`);
      setSnackbarOpen(true);
    }
  }, [setSnackbarMessage, setSnackbarOpen]);

  const handleClearAllClick = useCallback(() => {
    setClearDialogOpen(true);
  }, []);

  const handleClearDialogClose = useCallback(() => {
    setClearDialogOpen(false);
  }, []);

  const handleClearAll = useCallback(() => {
    if (tabValue === 0) {
      clearAllDocuments();
      setDocuments([]);
    } else {
      clearAllImages();
      setImages([]);
    }
    setClearDialogOpen(false);
  }, [tabValue]);

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Memoized sorted items
  const sortedItems = useMemo(() => {
    const items = tabValue === 0 ? documents : images;
    return [...items].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      } else {
        return new Date(a.dateAdded) - new Date(b.dateAdded);
      }
    });
  }, [tabValue, documents, images, sortOrder]);

  // Memoized paginated items
  const paginatedItems = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, page]);

  // Memoized page count
  const pageCount = useMemo(() => {
    return Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  }, [sortedItems.length]);

  // Memoized empty state check
  const isEmpty = useMemo(() => {
    return sortedItems.length === 0;
  }, [sortedItems.length]);

  const renderGrid = useCallback(() => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (isEmpty) {
      return <EmptyState tabValue={tabValue} />;
    }

    return (
      <>
        <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
          {paginatedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <DocumentCard 
                item={item} 
                tabValue={tabValue} 
                onItemClick={handleItemClick} 
                onMenuOpen={handleMenuOpen} 
              />
            </Grid>
          ))}
        </Grid>
        
        {pageCount > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={pageCount} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              size="large"
              showFirstButton 
              showLastButton
            />
          </Box>
        )}
      </>
    );
  }, [loading, isEmpty, paginatedItems, tabValue, pageCount, page, handleItemClick, handleMenuOpen, handlePageChange]);

  return (
    <Container 
      maxWidth="xl" 
      sx={{ py: 4 }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Documents & Images
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweep />}
            onClick={handleClearAllClick}
            disabled={isEmpty}
          >
            Clear All
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={toggleSortOrder}
            disabled={isEmpty}
          >
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </Button>
        </Box>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab 
          icon={<Description />} 
          label={`Documents (${documents.length})`}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
        <Tab 
          icon={<Image />} 
          label={`Images (${images.length})`}
          iconPosition="start"
          sx={{ minHeight: 48 }}
        />
      </Tabs>
      
      {renderGrid()}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleDownload}>
          <Download sx={{ mr: 2 }} />
          Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 2 }} />
          Share
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={clearDialogOpen}
        onClose={handleClearDialogClose}
      >
        <DialogTitle>
          Clear All {tabValue === 0 ? 'Documents' : 'Images'}?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Are you sure you want to delete all {tabValue === 0 ? 'documents' : 'images'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearDialogClose}>
            Cancel
          </Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Documents;
