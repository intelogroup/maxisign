import React, { useCallback } from 'react';
import { Typography } from '@mui/material';
import { DropOverlay, DropIndicator, Coordinates } from './StyledComponents';

/**
 * Component for handling drag and drop functionality
 */
const DropHandler = ({
  isDraggingOver,
  setIsDraggingOver,
  showGrid,
  setShowGrid,
  dropPosition,
  setDropPosition,
  handleFileUpload,
  pdfContainerRef
}) => {
  // Calculate percentage position within the container
  const calculatePosition = useCallback((event) => {
    if (!pdfContainerRef.current) return { x: 0, y: 0 };
    
    const container = pdfContainerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate percentage position
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }, [pdfContainerRef]);

  // Handle drag over event
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    
    // Set dragging state
    if (!isDraggingOver) {
      setIsDraggingOver(true);
      setShowGrid(true);
    }
    
    // Update drop position
    const position = calculatePosition(event);
    setDropPosition(position);
  }, [isDraggingOver, setIsDraggingOver, setShowGrid, calculatePosition, setDropPosition]);

  // Handle drag leave event
  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    
    // Check if we're still within the container
    const relatedTarget = event.relatedTarget;
    const container = pdfContainerRef.current;
    
    if (!container || !container.contains(relatedTarget)) {
      setIsDraggingOver(false);
      setShowGrid(false);
    }
  }, [pdfContainerRef, setIsDraggingOver, setShowGrid]);

  // Handle drop event
  const handleDrop = useCallback((event) => {
    event.preventDefault();
    
    // Reset drag state
    setIsDraggingOver(false);
    setShowGrid(false);
    
    // Get the dropped files
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    
    // Get the drop position
    const position = calculatePosition(event);
    
    // Process the first file
    handleFileUpload(files[0], position);
  }, [setIsDraggingOver, setShowGrid, calculatePosition, handleFileUpload]);

  return (
    <DropOverlay
      isDraggingOver={isDraggingOver}
      showGrid={showGrid}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <>
          <DropIndicator x={dropPosition.x} y={dropPosition.y} />
          <Coordinates variant="caption">
            {`X: ${Math.round(dropPosition.x)}%, Y: ${Math.round(dropPosition.y)}%`}
          </Coordinates>
        </>
      )}
    </DropOverlay>
  );
};

export default DropHandler;
