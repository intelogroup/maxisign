import React, { useState, useCallback } from 'react';
import { Typography, Box, Snackbar, Alert } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { DropZone } from './StyledComponents';
import { saveImage } from '../../utils/localStorage';

/**
 * DropZoneUploader Component
 * 
 * A component for drag and drop file uploads
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFileSelect - Callback when file is selected
 * @param {string} props.accept - File type to accept (e.g., 'application/pdf', 'image/*')
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @param {Object} props.sx - Additional styles
 */
function DropZoneUploader({ onFileSelect, accept, disabled, sx = {} }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  /**
   * Handle drag enter event
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  /**
   * Handle drag leave event
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  /**
   * Handle drag over event
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragActive) {
      setIsDragActive(true);
    }
  }, [disabled, isDragActive]);

  /**
   * Handle drop event
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (accept === 'application/pdf' && file.type !== 'application/pdf') {
      showSnackbar('Invalid file type. Please drop a PDF file.', 'error');
      return;
    }
    
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      showSnackbar('Invalid file type. Please drop an image file.', 'error');
      return;
    }
    
    // If it's an image, save it to localStorage
    if (file.type.startsWith('image/')) {
      saveImageToStorage(file);
    }
    
    // Call the onFileSelect callback
    onFileSelect(file);
  }, [disabled, accept, onFileSelect]);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (accept === 'application/pdf' && file.type !== 'application/pdf') {
      showSnackbar('Invalid file type. Please select a PDF file.', 'error');
      return;
    }
    
    if (accept === 'image/*' && !file.type.startsWith('image/')) {
      showSnackbar('Invalid file type. Please select an image file.', 'error');
      return;
    }
    
    // If it's an image, save it to localStorage
    if (file.type.startsWith('image/')) {
      saveImageToStorage(file);
    }
    
    // Call the onFileSelect callback
    onFileSelect(file);
    
    // Reset the input
    e.target.value = '';
  }, [accept, onFileSelect]);

  /**
   * Save image to localStorage
   */
  const saveImageToStorage = (imageFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      
      // Create image object
      const imageObject = {
        id: `img_${Date.now()}`,
        name: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
        data: base64Image,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      const result = saveImage(imageObject);
      if (result) {
        showSnackbar('Image saved to Documents page', 'success');
      } else {
        showSnackbar('Error saving image to Documents page', 'error');
      }
    };
    reader.readAsDataURL(imageFile);
  };

  /**
   * Show snackbar notification
   */
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  /**
   * Close snackbar
   */
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const isPdf = accept === 'application/pdf';
  const acceptText = isPdf ? 'PDF' : 'Image';

  return (
    <>
      <DropZone
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('dropzone-file-input').click()}
        sx={{
          ...sx,
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <CloudUpload 
          sx={{ 
            fontSize: 48, 
            color: isDragActive ? 'primary.main' : 'text.secondary',
            mb: 2
          }} 
        />
        
        <Typography variant="h6" color="text.primary" gutterBottom>
          Drop your {acceptText} here
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          or click to browse files
        </Typography>
        
        <input
          id="dropzone-file-input"
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
      </DropZone>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default DropZoneUploader;
