import React, { useRef, useCallback, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DeleteRounded, ZoomInRounded, ZoomOutRounded, RotateRightRounded } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';
import { ImageLayer, PlacedImage, ImageControls, ResizeHandle } from './StyledComponents';
import { saveToStorage, STORAGE_KEYS } from '../../utils/localStorage';

/**
 * Component for handling image placement and manipulation
 */
const ImageHandler = ({
  placedImages,
  setPlacedImages,
  selectedImage,
  setSelectedImage,
  currentPage,
  undoStack,
  setUndoStack,
  setRedoStack,
  recentImages,
  setRecentImages
}) => {
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const imageStartPos = useRef({ x: 0, y: 0 });
  const resizeRef = useRef(null);
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeData, setResizeData] = useState(null);

  // Handle image selection
  const handleImageClick = (event, image) => {
    event.stopPropagation();
    setSelectedImage(image.id === selectedImage ? null : image.id);
  };

  // Handle image deletion
  const handleDeleteImage = (event, imageId) => {
    event.stopPropagation();
    
    const imageToDelete = placedImages.find(img => img.id === imageId);
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'delete',
      image: imageToDelete
    }]);
    setRedoStack([]);
    
    // Remove the image
    setPlacedImages(prev => prev.filter(img => img.id !== imageId));
    setSelectedImage(null);
  };

  // Handle image scaling
  const handleScaleImage = (event, imageId, scaleChange) => {
    event.stopPropagation();
    
    const imageToScale = placedImages.find(img => img.id === imageId);
    const newSize = {
      width: imageToScale.size.width * (1 + scaleChange),
      height: imageToScale.size.height * (1 + scaleChange)
    };
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'scale',
      image: imageToScale,
      previousSize: imageToScale.size,
      newSize: newSize
    }]);
    setRedoStack([]);
    
    // Update the image
    setPlacedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, size: newSize }
          : img
      )
    );
  };

  // Handle image rotation
  const handleRotateImage = (event, imageId) => {
    event.stopPropagation();
    
    const imageToRotate = placedImages.find(img => img.id === imageId);
    const newRotation = (imageToRotate.rotation || 0) + 90;
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'rotate',
      image: imageToRotate,
      previousRotation: imageToRotate.rotation || 0,
      newRotation: newRotation
    }]);
    setRedoStack([]);
    
    // Update the image
    setPlacedImages(prev => 
      prev.map(img => 
        img.id === imageId 
          ? { ...img, rotation: newRotation }
          : img
      )
    );
  };

  // Handle drag start
  const handleDragStart = (event, image) => {
    event.stopPropagation();
    
    // Set the dragging image
    dragRef.current = image.id;
    
    // Store start positions
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    imageStartPos.current = { ...image.position };
    
    // Add event listeners for drag and drop
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Set as selected
    setSelectedImage(image.id);
  };

  // Handle drag move
  const handleDragMove = useCallback((event) => {
    if (!dragRef.current) return;
    
    // Calculate the movement delta
    const deltaX = event.clientX - dragStartPos.current.x;
    const deltaY = event.clientY - dragStartPos.current.y;
    
    // Get the container element for percentage calculation
    const container = document.querySelector('.react-pdf__Page');
    if (!container) return;
    
    // Calculate the new position in percentage
    const percentX = (deltaX / container.offsetWidth) * 100;
    const percentY = (deltaY / container.offsetHeight) * 100;
    
    // Update the image position
    setPlacedImages(prev => 
      prev.map(img => 
        img.id === dragRef.current 
          ? { 
              ...img, 
              position: {
                x: imageStartPos.current.x + percentX,
                y: imageStartPos.current.y + percentY
              }
            }
          : img
      )
    );
  }, [setPlacedImages]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragRef.current) return;
    
    // Get the dragged image
    const draggedImage = placedImages.find(img => img.id === dragRef.current);
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'move',
      image: draggedImage,
      previousPosition: imageStartPos.current,
      newPosition: draggedImage.position
    }]);
    setRedoStack([]);
    
    // Clean up
    dragRef.current = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }, [placedImages, setUndoStack, setRedoStack, handleDragMove]);

  // Handle resize start
  const handleResizeStart = (event, imageId, handle) => {
    event.stopPropagation();
    
    // Set the resizing image and handle
    resizeRef.current = imageId;
    setResizeHandle(handle);
    
    // Store start positions and size
    const imageToResize = placedImages.find(img => img.id === imageId);
    setResizeData({
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: imageToResize.size.width,
      startHeight: imageToResize.size.height,
    });
    
    // Add event listeners for resize
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    // Set as selected
    setSelectedImage(imageId);
  };

  // Handle resize move
  const handleResizeMove = useCallback((e) => {
    if (!resizeData) return;
    const { handle, startX, startY, startWidth, startHeight } = resizeData;
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth, newHeight;
    const aspectRatio = startWidth / startHeight;

    switch (handle) {
      case 'top-left':
        newWidth = startWidth - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'top-right':
        newWidth = startWidth + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'bottom-left':
        newWidth = startWidth - deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      case 'bottom-right':
        newWidth = startWidth + deltaX;
        newHeight = newWidth / aspectRatio;
        break;
      default:
        return;
    }

    setPlacedImages(prev => 
      prev.map(img => 
        img.id === selectedImage?.id
          ? { ...img, size: { width: newWidth, height: newHeight } }
          : img
      )
    );
  }, [resizeData, selectedImage?.id]);

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!resizeRef.current) return;
    
    // Find the image that was resized
    const imageResized = placedImages.find(img => img.id === resizeRef.current);
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'resize',
      image: imageResized,
      previousSize: resizeData.startWidth,
      newSize: imageResized.size
    }]);
    setRedoStack([]);
    
    // Clean up
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    resizeRef.current = null;
    setResizeHandle(null);
    setResizeData(null);
    
    // Save to localStorage
    saveToStorage(STORAGE_KEYS.PLACED_IMAGES, placedImages);
  }, [placedImages, setRedoStack, setUndoStack]);

  // Handle file upload for images
  const handleFileUpload = (file, position = null) => {
    if (!file || !file.type.startsWith('image/')) {
      console.error('Invalid file type');
      return;
    }

    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Create a new image object
    const newImage = {
      id: uuidv4(),
      url: imageUrl,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
    };
    
    // Add to recent images
    const updatedRecentImages = [newImage, ...recentImages.slice(0, 9)];
    setRecentImages(updatedRecentImages);
    saveToStorage(STORAGE_KEYS.RECENT_IMAGES, updatedRecentImages);
    
    // Handle image placement if position is provided (drag & drop)
    if (position) {
      const newPlacedImage = {
        ...newImage,
        page: currentPage,
        position: {
          x: position.x,
          y: position.y,
        },
        size: {
          width: 20, // Default size, will be adjusted when image loads
          height: 20,
        },
        rotation: 0,
      };
      
      // Add to undo stack
      setUndoStack(prev => [...prev, {
        type: 'add',
        image: newPlacedImage
      }]);
      setRedoStack([]);
      
      setPlacedImages(prev => [...prev, newPlacedImage]);
    }
    
    return newImage;
  };

  // Handle selecting a recent image
  const handleRecentImageSelect = (image, position = null) => {
    if (!position) {
      // If no position, place in center
      position = { x: 50, y: 50 };
    }
    
    const newPlacedImage = {
      ...image,
      id: uuidv4(), // Generate a new ID
      page: currentPage,
      position: {
        x: position.x,
        y: position.y,
      },
      size: {
        width: 20, // Default size, will be adjusted when image loads
        height: 20,
      },
      rotation: 0,
    };
    
    // Add to undo stack
    setUndoStack(prev => [...prev, {
      type: 'add',
      image: newPlacedImage
    }]);
    setRedoStack([]);
    
    setPlacedImages(prev => [...prev, newPlacedImage]);
  };

  return (
    <ImageLayer onClick={() => setSelectedImage(null)}>
      {placedImages
        .filter(image => image.page === currentPage)
        .map(image => (
          <React.Fragment key={image.id}>
            <PlacedImage
              src={image.url}
              alt={image.name || 'Placed image'}
              style={{
                left: `${image.position.x}%`,
                top: `${image.position.y}%`,
                width: `${image.size.width}%`,
                height: 'auto',
                transform: `translate(-50%, -50%) rotate(${image.rotation || 0}deg)`,
                border: selectedImage === image.id ? '2px solid #1976d2' : 'none',
                zIndex: selectedImage === image.id ? 20 : 10,
              }}
              onMouseDown={(e) => handleDragStart(e, image)}
              onClick={(e) => handleImageClick(e, image)}
            />
            
            {selectedImage === image.id && (
              <>
                <ImageControls
                  style={{
                    left: `${image.position.x}%`,
                    top: `${image.position.y - (image.size.height / 2) - 5}%`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Zoom In">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleScaleImage(e, image.id, 0.1)}
                    >
                      <ZoomInRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Zoom Out">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleScaleImage(e, image.id, -0.1)}
                    >
                      <ZoomOutRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Rotate">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleRotateImage(e, image.id)}
                    >
                      <RotateRightRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleDeleteImage(e, image.id)}
                    >
                      <DeleteRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ImageControls>
                
                {/* Resize Handles */}
                <div style={{
                  position: 'absolute',
                  left: `${image.position.x}%`,
                  top: `${image.position.y}%`,
                  width: `${image.size.width}%`,
                  height: 'auto',
                  transform: `translate(-50%, -50%) rotate(${image.rotation || 0}deg)`,
                  pointerEvents: 'none',
                }}>
                  <ResizeHandle 
                    position="top-left" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'top-left')}
                  />
                  <ResizeHandle 
                    position="top-right" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'top-right')}
                  />
                  <ResizeHandle 
                    position="bottom-left" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'bottom-left')}
                  />
                  <ResizeHandle 
                    position="bottom-right" 
                    onMouseDown={(e) => handleResizeStart(e, image.id, 'bottom-right')}
                  />
                </div>
              </>
            )}
          </React.Fragment>
        ))}
    </ImageLayer>
  );
};

export default ImageHandler;
export { ImageHandler };
