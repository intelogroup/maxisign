import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Typography,
  Box
} from '@mui/material';

const ImageAdjustments = ({ open, onClose, imageUrl, onSave }) => {
  const [crop, setCrop] = useState();
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imgRef = useRef(null);

  const handleComplete = (crop) => {
    if (imgRef.current && crop.width && crop.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      
      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob((blob) => {
        onSave(URL.createObjectURL(blob));
      }, 'image/png');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Adjust Image</DialogTitle>
      <DialogContent>
        <ReactCrop crop={crop} onChange={c => setCrop(c)}>
          <img
            ref={imgRef}
            src={imageUrl}
            style={{ 
              maxWidth: '100%',
              filter: `brightness(${brightness}%) contrast(${contrast}%)`
            }}
            alt="Crop"
          />
        </ReactCrop>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Brightness</Typography>
          <Slider
            value={brightness}
            onChange={(e, value) => setBrightness(value)}
            min={0}
            max={200}
            valueLabelDisplay="auto"
          />
          <Typography gutterBottom>Contrast</Typography>
          <Slider
            value={contrast}
            onChange={(e, value) => setContrast(value)}
            min={0}
            max={200}
            valueLabelDisplay="auto"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => handleComplete(crop)} color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageAdjustments;
