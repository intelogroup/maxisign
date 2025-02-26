import React from 'react';
import { styled } from '@mui/material/styles';
import { Button, Stack, Typography, Box, Tooltip, useTheme, Snackbar, Alert } from '@mui/material';
import { PictureAsPdf, Image, CloudUpload } from '@mui/icons-material';
import { saveImage } from '../utils/localStorage';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease',
  boxShadow: 'none',
  fontWeight: 500,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const FileInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)',
  maxWidth: '300px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  transition: 'all 0.2s ease',
}));

function FileUploader({ onChange, accept, label, file, disabled, sx = {} }) {
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (accept === 'application/pdf' && selectedFile.type !== 'application/pdf') {
        // Handle invalid file type
        setSnackbarMessage('Invalid file type. Please select a PDF file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      if (accept === 'image/*' && !selectedFile.type.startsWith('image/')) {
        // Handle invalid file type
        setSnackbarMessage('Invalid file type. Please select an image file.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Create a URL for the file
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // If it's an image, save it to localStorage
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          
          // Create image object
          const imageObject = {
            id: `img_${Date.now()}`,
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            data: base64Image,
            createdAt: new Date().toISOString()
          };

          // Save to localStorage
          const result = saveImage(imageObject);
          if (result) {
            setSnackbarMessage('Image saved to Documents page');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage('Error saving image to Documents page');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
          }
        };
        reader.readAsDataURL(selectedFile);
      }
      
      // Call the onChange handler with the file
      onChange(selectedFile);
    }
    event.target.value = ''; // Reset input
  };

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
