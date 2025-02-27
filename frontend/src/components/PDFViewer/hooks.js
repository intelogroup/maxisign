import { useState, useCallback, useEffect } from 'react';
import { saveDocument, getFromStorage, STORAGE_KEYS } from '../../utils/localStorage';

/**
 * Custom hook for managing PDF state
 */
export const usePDFState = () => {
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

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);

  const handlePageInputChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= pageCount) {
      setCurrentPage(value);
    }
  }, [pageCount]);

  return {
    pdfUrl,
    setPdfUrl,
    isLoading,
    setIsLoading,
    error,
    setError,
    isProtected,
    setIsProtected,
    pageCount,
    setPageCount,
    currentPage,
    setCurrentPage,
    bookmarks,
    setBookmarks,
    showSearch,
    setShowSearch,
    searchText,
    setSearchText,
    zoomLevel,
    setZoomLevel,
    handlePageChange,
    handlePageInputChange
  };
};

/**
 * Custom hook for managing image state
 */
export const useImageState = () => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [dropPosition, setDropPosition] = useState({ x: 0, y: 0 });
  const [placedImages, setPlacedImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageMenuAnchorEl, setImageMenuAnchorEl] = useState(null);

  // Load recent images from localStorage on mount
  useEffect(() => {
    try {
      const savedImages = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_IMAGES) || '[]');
      setRecentImages(savedImages);
    } catch (error) {
      console.error('Error loading recent images:', error);
    }
  }, []);

  return {
    isDraggingOver,
    setIsDraggingOver,
    showGrid,
    setShowGrid,
    dropPosition,
    setDropPosition,
    placedImages,
    setPlacedImages,
    recentImages,
    setRecentImages,
    selectedImage,
    setSelectedImage,
    imageMenuAnchorEl,
    setImageMenuAnchorEl
  };
};

/**
 * Custom hook for managing undo/redo functionality
 */
export const useUndoRedo = (placedImages, setPlacedImages) => {
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Handle undo action
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = [...undoStack];
    newUndoStack.pop();
    setUndoStack(newUndoStack);
    
    // Add to redo stack
    setRedoStack(prev => [...prev, lastAction]);
    
    // Process the undo action
    if (lastAction.type === 'add') {
      // Remove the added image
      setPlacedImages(prev => prev.filter(img => img.id !== lastAction.image.id));
    } else if (lastAction.type === 'move') {
      // Restore the previous position
      setPlacedImages(prev => 
        prev.map(img => 
          img.id === lastAction.image.id 
            ? { ...img, position: lastAction.previousPosition }
            : img
        )
      );
    } else if (lastAction.type === 'delete') {
      // Restore the deleted image
      setPlacedImages(prev => [...prev, lastAction.image]);
    }
  }, [undoStack, setPlacedImages]);

  // Handle redo action
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const lastAction = redoStack[redoStack.length - 1];
    const newRedoStack = [...redoStack];
    newRedoStack.pop();
    setRedoStack(newRedoStack);
    
    // Add back to undo stack
    setUndoStack(prev => [...prev, lastAction]);
    
    // Process the redo action
    if (lastAction.type === 'add') {
      // Re-add the image
      setPlacedImages(prev => [...prev, lastAction.image]);
    } else if (lastAction.type === 'move') {
      // Apply the new position
      setPlacedImages(prev => 
        prev.map(img => 
          img.id === lastAction.image.id 
            ? { ...img, position: lastAction.newPosition }
            : img
        )
      );
    } else if (lastAction.type === 'delete') {
      // Delete the image again
      setPlacedImages(prev => prev.filter(img => img.id !== lastAction.image.id));
    }
  }, [redoStack, setPlacedImages]);

  return {
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    handleUndo,
    handleRedo
  };
};

/**
 * Custom hook for managing UI state
 */
export const useUIState = () => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    setSnackbar,
    handleSnackbarClose,
    showShortcutsDialog,
    setShowShortcutsDialog
  };
};
