import React, { useState } from 'react';
import { Stack, Typography, Tooltip, useTheme, Snackbar, Alert } from '@mui/material';
import { PictureAsPdf, Image } from '@mui/icons-material';
import { saveImage } from '../../utils/localStorage';
import { VisuallyHiddenInput, StyledButton, FileInfo } from './StyledComponents';

/**
 * FileUploader Component
 * 
 * A reusable component for uploading files (PDF or images)
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onChange - Callback when file is selected
 * @param {string} props.accept - File type to accept (e.g., 'application/pdf', 'image/*')
 * @param {string} props.label - Button label
 * @param {File} props.file - Currently selected file
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @param {Object} props.sx - Additional styles
 */
function FileUploader({ onChange, accept, label, file, disabled, sx = {} }) {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  /**
   * Handle file selection
   */
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (accept === 'application/pdf' && selectedFile.type !== 'application/pdf') {
        showSnackbar('Invalid file type. Please select a PDF file.', 'error');
        return;
      }
      if (accept === 'image/*' && !selectedFile.type.startsWith('image/')) {
        showSnackbar('Invalid file type. Please select an image file.', 'error');
        return;
      }

      // Create a URL for the file
      URL.createObjectURL(selectedFile);
      
      // If it's an image, save it to localStorage
      if (selectedFile.type.startsWith('image/')) {
        saveImageToStorage(selectedFile);
      }
      
      // Call the onChange handler with the file
      onChange(selectedFile);
    }
    event.target.value = ''; // Reset input
  };

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
  const icon = isPdf ? <PictureAsPdf /> : <Image />;
  const color = isPdf ? 'primary' : 'secondary';
  
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={sx}>
      <Tooltip title={`Upload ${isPdf ? 'PDF' : 'Image'} File`}>
        {disabled ? (
          <span>
            <StyledButton
              component="label"
              variant="contained"
              color={color}
              startIcon={icon}
              disabled={disabled}
              disableElevation
            >
              {label}
              <VisuallyHiddenInput
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={disabled}
              />
            </StyledButton>
          </span>
        ) : (
          <StyledButton
            component="label"
            variant="contained"
            color={color}
            startIcon={icon}
            disabled={disabled}
            disableElevation
          >
            {label}
            <VisuallyHiddenInput
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={disabled}
            />
          </StyledButton>
        )}
      </Tooltip>
      
      {file && (
        <Tooltip title={file.name}>
          <FileInfo>
            {isPdf ? <PictureAsPdf fontSize="small" color="primary" /> : <Image fontSize="small" color="secondary" />}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                maxWidth: '200px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {file.name}
            </Typography>
          </FileInfo>
        </Tooltip>
      )}
      
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
    </Stack>
  );
}

export default FileUploader;
