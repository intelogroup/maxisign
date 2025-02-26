import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { saveImage, getFromStorage, STORAGE_KEYS } from '../utils/localStorage';

const ImageStorageTest = () => {
  const [status, setStatus] = useState('');
  const [savedImage, setSavedImage] = useState(null);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target.result;
        
        // Create image object
        const imageObject = {
          id: `img_${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Image,
          createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const result = saveImage(imageObject);
        if (result) {
          setStatus('success');
          // Retrieve the saved image to verify
          const savedImages = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
          const saved = savedImages.find(img => img.id === imageObject.id);
          setSavedImage(saved);
        } else {
          setStatus('error');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error saving image:', error);
      setStatus('error');
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Test Image Storage
      </Typography>
      
      <Button
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
      >
        Upload Image
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageUpload}
        />
      </Button>

      {status === 'success' && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Image saved successfully!
        </Alert>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error saving image. Please try again.
        </Alert>
      )}

      {savedImage && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Saved Image Details:
          </Typography>
          <img 
            src={savedImage.data}
            alt="Saved preview"
            style={{ 
              maxWidth: '200px',
              maxHeight: '200px',
              objectFit: 'contain',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '8px'
            }}
          />
          <Typography variant="body2">
            Name: {savedImage.name}<br />
            Size: {Math.round(savedImage.size / 1024)} KB<br />
            Type: {savedImage.type}<br />
            Created: {new Date(savedImage.createdAt).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ImageStorageTest;
