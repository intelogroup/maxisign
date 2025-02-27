import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import PDFViewer from './PDFViewer';

/**
 * PDFPreview Component (Legacy Wrapper)
 * 
 * This component serves as a compatibility wrapper around the new PDFViewer component.
 * It maintains the same API as the old PDFPreview component to ensure backward compatibility.
 * 
 * @param {Object} props - Component props
 * @param {File} props.file - PDF file to preview
 * @param {string} props.initialZoom - Initial zoom level ('page-fit', 'page-width', or percentage)
 * @param {Function} props.onImagePlaced - Callback when an image is placed on the PDF
 */
function PDFPreview({ file, initialZoom = 'page-fit', onImagePlaced }) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [error, setError] = useState(null);

  // Convert initialZoom to the format expected by PDFViewer
  const getInitialZoom = () => {
    if (initialZoom === 'page-fit') return 'fit';
    if (initialZoom === 'page-width') return 'width';
    
    // If it's a percentage (e.g., '100%'), convert to number
    if (typeof initialZoom === 'string' && initialZoom.endsWith('%')) {
      const zoomValue = parseFloat(initialZoom);
      return isNaN(zoomValue) ? 100 : zoomValue;
    }
    
    return 100; // Default zoom
  };

  // Load PDF file
  useEffect(() => {
    if (!file) {
      setPdfDocument(null);
      return;
    }

    // Create URL for the file
    try {
      const url = URL.createObjectURL(file);
      setPdfDocument({
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });

      // Clean up URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Error creating PDF URL:', err);
      setError('Failed to load PDF');
    }
  }, [file]);

  // Handle image placement callback
  const handleImagePlaced = (imageData) => {
    if (onImagePlaced) {
      // Convert the imageData format if needed
      onImagePlaced(imageData);
    }
  };

  // If there's no file, show a message
  if (!file && !pdfDocument) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '500px',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="h6" color="text.secondary" align="center">
          No PDF file selected
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Please select a PDF file to preview
        </Typography>
      </Box>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '500px',
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1
        }}
      >
        <Typography variant="h6" color="error" align="center">
          Error Loading PDF
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <PDFViewer
      pdfDocument={pdfDocument}
      initialZoom={getInitialZoom()}
      onImagePlaced={handleImagePlaced}
      showToolbar={true}
      enableImagePlacement={true}
      enableAnnotations={true}
      sx={{ height: '100%', minHeight: '800px' }}
    />
  );
}

PDFPreview.propTypes = {
  file: PropTypes.object,
  initialZoom: PropTypes.string,
  onImagePlaced: PropTypes.func
};

export default PDFPreview;
