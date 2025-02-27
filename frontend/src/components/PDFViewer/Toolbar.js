import React, { useState } from 'react';
import { 
  IconButton, 
  Typography, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  UndoRounded,
  RedoRounded,
  NavigateBeforeRounded,
  NavigateNextRounded,
  ImageRounded,
  SaveRounded,
  ZoomInRounded,
  ZoomOutRounded,
  HelpOutlineRounded,
  MoreVertRounded,
  AddPhotoAlternateRounded,
  HistoryRounded
} from '@mui/icons-material';
import { ToolbarContainer, ToolbarGroup, StyledDivider } from './StyledComponents';

/**
 * PDF Viewer Toolbar Component
 */
const Toolbar = ({
  currentPage,
  pageCount,
  handlePageChange,
  handlePageInputChange,
  undoStack,
  redoStack,
  handleUndo,
  handleRedo,
  handleImageUploadClick,
  handleSavePDF,
  recentImages,
  handleRecentImageSelect,
  setShowShortcutsDialog,
  zoomLevel,
  setZoomLevel
}) => {
  const [imageMenuAnchorEl, setImageMenuAnchorEl] = useState(null);
  const imageMenuOpen = Boolean(imageMenuAnchorEl);

  const handleImageMenuOpen = (event) => {
    setImageMenuAnchorEl(event.currentTarget);
  };

  const handleImageMenuClose = () => {
    setImageMenuAnchorEl(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleRecentImageClick = (image) => {
    handleRecentImageSelect(image);
    handleImageMenuClose();
  };

  const handleNewImageUpload = () => {
    handleImageUploadClick();
    handleImageMenuClose();
  };

  return (
    <ToolbarContainer>
      {/* Navigation Controls */}
      <ToolbarGroup>
        <Tooltip title="Previous Page">
          <span>
            <IconButton 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <NavigateBeforeRounded />
            </IconButton>
          </span>
        </Tooltip>
        
        <TextField
          size="small"
          value={currentPage}
          onChange={handlePageInputChange}
          sx={{ width: '80px' }}
          InputProps={{
            endAdornment: <InputAdornment position="end">/ {pageCount}</InputAdornment>,
          }}
        />
        
        <Tooltip title="Next Page">
          <span>
            <IconButton 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              <NavigateNextRounded />
            </IconButton>
          </span>
        </Tooltip>
      </ToolbarGroup>

      <StyledDivider orientation="vertical" />

      {/* Zoom Controls */}
      <ToolbarGroup>
        <Tooltip title="Zoom Out">
          <IconButton onClick={handleZoomOut} disabled={zoomLevel <= 50}>
            <ZoomOutRounded />
          </IconButton>
        </Tooltip>
        
        <Typography variant="body2">{zoomLevel}%</Typography>
        
        <Tooltip title="Zoom In">
          <IconButton onClick={handleZoomIn} disabled={zoomLevel >= 200}>
            <ZoomInRounded />
          </IconButton>
        </Tooltip>
      </ToolbarGroup>

      <StyledDivider orientation="vertical" />

      {/* Edit Controls */}
      <ToolbarGroup>
        <Tooltip title="Undo">
          <span>
            <IconButton onClick={handleUndo} disabled={undoStack.length === 0}>
              <UndoRounded />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Redo">
          <span>
            <IconButton onClick={handleRedo} disabled={redoStack.length === 0}>
              <RedoRounded />
            </IconButton>
          </span>
        </Tooltip>
      </ToolbarGroup>

      <StyledDivider orientation="vertical" />

      {/* Image and Save Controls */}
      <ToolbarGroup>
        <Tooltip title="Insert Image">
          <IconButton onClick={handleImageMenuOpen}>
            <ImageRounded />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={imageMenuAnchorEl}
          open={imageMenuOpen}
          onClose={handleImageMenuClose}
        >
          <MenuItem onClick={handleNewImageUpload}>
            <ListItemIcon>
              <AddPhotoAlternateRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Upload new image" />
          </MenuItem>
          
          {recentImages.length > 0 && (
            <>
              <MenuItem disabled>
                <ListItemIcon>
                  <HistoryRounded fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Recent images" />
              </MenuItem>
              
              {recentImages.map((image, index) => (
                <MenuItem 
                  key={index} 
                  onClick={() => handleRecentImageClick(image)}
                  sx={{ pl: 4 }}
                >
                  <ListItemText 
                    primary={image.name || `Image ${index + 1}`} 
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </MenuItem>
              ))}
            </>
          )}
        </Menu>
        
        <Tooltip title="Save PDF">
          <IconButton onClick={handleSavePDF}>
            <SaveRounded />
          </IconButton>
        </Tooltip>
      </ToolbarGroup>

      <div style={{ flexGrow: 1 }} />

      {/* Help */}
      <ToolbarGroup>
        <Tooltip title="Keyboard Shortcuts">
          <IconButton onClick={() => setShowShortcutsDialog(true)}>
            <HelpOutlineRounded />
          </IconButton>
        </Tooltip>
      </ToolbarGroup>
    </ToolbarContainer>
  );
};

export default Toolbar;
