import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress } from '@mui/material';
import ImageEditor from './ImageEditor';

/**
 * ImagePreview Component (Legacy Wrapper)
 * 
 * This component serves as a compatibility wrapper around the new ImageEditor component.
 * It maintains the same API as the old ImagePreview component to ensure backward compatibility.
 * 
 * @param {Object} props - Component props
 * @param {File} props.file - Image file to preview
 * @param {Function} props.onImageChange - Callback when image is edited and saved
 * @param {boolean} props.disabled - Whether the component is disabled
 */
function ImagePreview({ file, onImageChange, disabled = false }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load image file
  useEffect(() => {
    if (!file) {
      setImageUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create URL for the file
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setIsLoading(false);

      // Clean up URL when component unmounts or file changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Error creating image URL:', err);
      setError('Failed to load image');
      setIsLoading(false);
    }
  }, [file]);

  // Handle image save
  const handleSave = (editedImageUrl) => {
    if (onImageChange) {
      // Convert the edited image URL to a file
      fetch(editedImageUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const editedFile = new File([blob], file.name, { type: 'image/png' });
          onImageChange(editedFile);
          setIsEditing(false);
        })
        .catch((err) => {
          console.error('Error converting edited image to file:', err);
          setError('Failed to save edited image');
        });
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  // If there's no file, show a message
  if (!file && !imageUrl) {
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
          No image selected
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Please select an image to preview
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
          Error Loading Image
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {error}
        </Typography>
      </Box>
    );
  }

  // If loading, show a loading indicator
  if (isLoading) {
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
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Loading image...
        </Typography>
      </Box>
    );
  }

  // If editing, show the image editor
  if (isEditing) {
    return (
      <ImageEditor
        imageUrl={imageUrl}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  // Show the image preview with edit button
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '500px',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <img
          src={imageUrl}
          alt="Preview"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}
      >
        <Typography
          variant="button"
          color="primary"
          sx={{
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            textDecoration: 'underline',
            '&:hover': {
              opacity: disabled ? 0.5 : 0.8
            }
          }}
          onClick={() => {
            if (!disabled) {
              setIsEditing(true);
            }
          }}
        >
          Edit Image
        </Typography>
      </Box>
    </Box>
  );
}

ImagePreview.propTypes = {
  file: PropTypes.object,
  onImageChange: PropTypes.func,
  disabled: PropTypes.bool
};

export default ImagePreview;
