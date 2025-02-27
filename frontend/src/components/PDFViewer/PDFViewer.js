import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { CircularProgress, Typography, Button, InputBase } from '@mui/material';
import { CloudUploadRounded } from '@mui/icons-material';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';

import { PreviewContainer, PDFContainer, LoadingOverlay } from './StyledComponents';
import { usePDFState, useImageState, useUndoRedo, useUIState } from './hooks';
import Toolbar from './Toolbar';
import DropHandler from './DropHandler';
import ImageHandler from './ImageHandler';
import { ShortcutsDialog, SnackbarAlert } from './Dialogs';
import FormFieldOverlay from './FormFieldOverlay'; // Import FormFieldOverlay component

// Set the PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;

// Configure font loading
pdfjs.GlobalWorkerOptions.standardFontDataUrl = `${window.location.origin}/standard_fonts/`;

// Handle missing fonts
pdfjs.GlobalWorkerOptions.fontExtraProperties = {
  FoxitDingbats: {
    fallback: true,
    url: `${window.location.origin}/fonts/FoxitDingbats.otf`
  },
  ZapfDingbats: {
    fallback: true,
    url: `${window.location.origin}/fonts/ZapfDingbats.otf`
  }
};

/**
 * Main PDF Viewer Component
 */
const PDFViewer = ({ initialPdfUrl = null, onImagePlaced = null }) => {
  // Refs
  const pdfContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Custom hooks for state management
  const pdfState = usePDFState();
  const {
    pdfUrl, setPdfUrl,
    isLoading, setIsLoading,
    error, setError,
    pageCount, setPageCount,
    currentPage, setCurrentPage,
    handlePageChange, handlePageInputChange,
    zoomLevel, setZoomLevel
  } = pdfState;
  
  const imageState = useImageState();
  const {
    isDraggingOver, setIsDraggingOver,
    showGrid, setShowGrid,
    dropPosition, setDropPosition,
    placedImages, setPlacedImages,
    recentImages, setRecentImages,
    selectedImage, setSelectedImage
  } = imageState;
  
  const {
    undoStack, setUndoStack,
    redoStack, setRedoStack,
    handleUndo, handleRedo
  } = useUndoRedo(placedImages, setPlacedImages);
  
  const {
    snackbar, setSnackbar,
    handleSnackbarClose,
    showShortcutsDialog, setShowShortcutsDialog
  } = useUIState();

  // Initialize with provided PDF URL
  useEffect(() => {
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl);
    }
  }, [initialPdfUrl, setPdfUrl]);

  // Handle PDF document loading
  const handleDocumentLoadSuccess = useCallback(({ numPages }) => {
    setPageCount(numPages);
    setCurrentPage(1);
    setIsLoading(false);
  }, [setPageCount, setCurrentPage, setIsLoading]);

  // Handle PDF document loading error
  const handleDocumentLoadError = useCallback((error) => {
    console.error('Error loading PDF:', error);
    setError(error);
    setIsLoading(false);
    setSnackbar({
      open: true,
      message: 'Failed to load PDF document',
      severity: 'error'
    });
  }, [setError, setIsLoading, setSnackbar]);

  // Handle file upload button click
  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle PDF file upload
  const handlePDFUpload = useCallback((file) => {
    if (!file || !file.type.includes('pdf')) {
      setSnackbar({
        open: true,
        message: 'Please select a valid PDF file',
        severity: 'error'
      });
      return;
    }

    setIsLoading(true);
    
    // Create URL for the PDF
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    
    // Reset state
    setPlacedImages([]);
    setUndoStack([]);
    setRedoStack([]);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'PDF loaded successfully',
      severity: 'success'
    });
    
    // Clean up the URL when component unmounts
    return () => URL.revokeObjectURL(fileUrl);
  }, [setPdfUrl, setIsLoading, setPlacedImages, setUndoStack, setRedoStack, setSnackbar]);

  // Handle file input change
  const handleFileInputChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.includes('pdf')) {
        handlePDFUpload(file);
      } else if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
    // Reset the file input
    event.target.value = '';
  }, [handlePDFUpload]);

  // Handle image upload
  const handleImageUpload = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setSnackbar({
        open: true,
        message: 'Please select a valid image file',
        severity: 'error'
      });
      return;
    }
    
    // Create a URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Create a new image object with a unique ID
    const newImage = {
      id: Date.now().toString(),
      url: imageUrl,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
    };
    
    // Add to recent images
    const updatedRecentImages = [newImage, ...recentImages.slice(0, 9)];
    setRecentImages(updatedRecentImages);
    
    // Place the image in the center of the current page
    const newPlacedImage = {
      ...newImage,
      page: currentPage,
      position: {
        x: 50, // Center of page
        y: 50,
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
    
    setSnackbar({
      open: true,
      message: 'Image added to the PDF',
      severity: 'success'
    });
    
    return newImage;
  }, [setSnackbar, recentImages, setRecentImages, currentPage, setUndoStack, setRedoStack, setPlacedImages]);

  // Handle image upload button click
  const handleImageUploadClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  }, [handleImageUpload]);

  // Handle recent image selection
  const handleRecentImageSelect = useCallback((image) => {
    // Place in center of current page
    const position = { x: 50, y: 50 };
    
    const newPlacedImage = {
      ...image,
      id: Date.now().toString(), // Generate a new ID
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
  }, [currentPage, setUndoStack, setRedoStack, setPlacedImages]);

  // Handle saving the PDF with placed images
  const handleSavePDF = useCallback(async () => {
    if (!pdfUrl) {
      setSnackbar({
        open: true,
        message: 'No PDF loaded',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch the PDF
      const pdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      // Process each page with images
      const pageImageMap = {};
      placedImages.forEach(image => {
        if (!pageImageMap[image.page]) {
          pageImageMap[image.page] = [];
        }
        pageImageMap[image.page].push(image);
      });
      
      // Add images to each page
      for (const [pageIndex, images] of Object.entries(pageImageMap)) {
        const page = pdfDoc.getPage(parseInt(pageIndex) - 1);
        const { width, height } = page.getSize();
        
        for (const image of images) {
          // Fetch image data
          const imageBytes = await fetch(image.url).then(res => res.arrayBuffer());
          
          // Embed image based on type
          let embeddedImage;
          if (image.type.includes('png')) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else if (image.type.includes('jpg') || image.type.includes('jpeg')) {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            console.warn(`Unsupported image type: ${image.type}`);
            continue;
          }
          
          // Calculate image dimensions and position
          const imgWidth = (image.size.width / 100) * width;
          const imgHeight = (embeddedImage.height / embeddedImage.width) * imgWidth;
          
          const xPos = (image.position.x / 100) * width - (imgWidth / 2);
          const yPos = height - ((image.position.y / 100) * height) - (imgHeight / 2);
          
          // Draw the image on the page
          page.drawImage(embeddedImage, {
            x: xPos,
            y: yPos,
            width: imgWidth,
            height: imgHeight,
            rotate: degrees(image.rotation || 0),
          });
        }
      }
      
      // Save the PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'modified_document.pdf');
      
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: 'PDF saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving PDF:', error);
      setIsLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to save PDF',
        severity: 'error'
      });
    }
  }, [pdfUrl, placedImages, setIsLoading, setSnackbar]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (event.key) {
        case 'ArrowLeft':
          if (currentPage > 1) {
            handlePageChange(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          if (currentPage < pageCount) {
            handlePageChange(currentPage + 1);
          }
          break;
        case '+':
          setZoomLevel(prev => Math.min(prev + 10, 200));
          break;
        case '-':
          setZoomLevel(prev => Math.max(prev - 10, 50));
          break;
        case 'z':
          if (event.ctrlKey) {
            handleUndo();
          }
          break;
        case 'y':
          if (event.ctrlKey) {
            handleRedo();
          }
          break;
        case 'Delete':
          if (selectedImage) {
            const imageToDelete = placedImages.find(img => img.id === selectedImage);
            if (imageToDelete) {
              setUndoStack(prev => [...prev, {
                type: 'delete',
                image: imageToDelete
              }]);
              setRedoStack([]);
              setPlacedImages(prev => prev.filter(img => img.id !== selectedImage));
              setSelectedImage(null);
            }
          }
          break;
        case 'Escape':
          setSelectedImage(null);
          break;
        case '?':
          setShowShortcutsDialog(true);
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    currentPage, pageCount, handlePageChange, setZoomLevel,
    handleUndo, handleRedo, selectedImage, placedImages,
    setUndoStack, setRedoStack, setPlacedImages, setSelectedImage,
    setShowShortcutsDialog
  ]);

  // Form field editing functionality
  const [formFields, setFormFields] = useState([]);

  // Extract form fields from PDF
  const extractFormFields = async (pdfDoc) => {
    try {
      const form = pdfDoc.getForm();
      console.log('PDF Form:', form);
      const fields = form.getFields();
      console.log('Form Fields:', fields);
      
      const fieldData = fields.map(field => ({
        name: field.getName(),
        type: field.constructor.name,
        value: field.getText(),
        readOnly: field.isReadOnly(),
        required: field.isRequired(),
        page: field.getPage(),
        rect: field.getRectangle()
      }));

      console.log('Processed Form Fields:', fieldData);
      setFormFields(fieldData);
    } catch (error) {
      console.error('Error extracting form fields:', error);
    }
  };

  // Handle field value changes
  const handleFieldChange = (fieldName, value) => {
    setFormFields(prev => 
      prev.map(field => 
        field.name === fieldName ? { ...field, value } : field
      )
    );
  };

  // Render form field overlays
  const renderFormFields = () => {
    return formFields.map((field, index) => (
      <FormFieldOverlay
        key={index}
        field={field}
        scale={zoomLevel / 100}
        onChange={(value) => handleFieldChange(field.name, value)}
      />
    ));
  };

  return (
    <PreviewContainer>
      {/* Toolbar */}
      <Toolbar
        currentPage={currentPage}
        pageCount={pageCount}
        handlePageChange={handlePageChange}
        handlePageInputChange={handlePageInputChange}
        undoStack={undoStack}
        redoStack={redoStack}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleImageUploadClick={handleImageUploadClick}
        handleSavePDF={handleSavePDF}
        recentImages={recentImages}
        handleRecentImageSelect={handleRecentImageSelect}
        setShowShortcutsDialog={setShowShortcutsDialog}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />
      
      {/* PDF Container */}
      <PDFContainer ref={pdfContainerRef}>
        {/* PDF Upload Prompt */}
        {!pdfUrl && !isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '16px'
          }}>
            <CloudUploadRounded sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h6" color="text.secondary">
              Drag & drop a PDF file here or click to upload
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleFileButtonClick}
              startIcon={<CloudUploadRounded />}
            >
              Upload PDF
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>
        )}
        
        {/* PDF Document */}
        {pdfUrl && (
          <Document
            file={pdfUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading={
              <LoadingOverlay>
                <CircularProgress />
                <Typography variant="body2">Loading PDF...</Typography>
              </LoadingOverlay>
            }
            error={
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Typography variant="h6" color="error">
                  Failed to load PDF
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error?.message || 'An unknown error occurred'}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleFileButtonClick}
                  sx={{ mt: 2 }}
                >
                  Try another file
                </Button>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={pdfContainerRef.current?.offsetWidth * (zoomLevel / 100)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            >
              {renderFormFields()}
            </Page>
          </Document>
        )}
        
        {/* Image Layer */}
        <ImageHandler
          placedImages={placedImages}
          setPlacedImages={setPlacedImages}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          currentPage={currentPage}
          undoStack={undoStack}
          setUndoStack={setUndoStack}
          setRedoStack={setRedoStack}
          recentImages={recentImages}
          setRecentImages={setRecentImages}
        />
        
        {/* Drop Overlay */}
        <DropHandler
          isDraggingOver={isDraggingOver}
          setIsDraggingOver={setIsDraggingOver}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          dropPosition={dropPosition}
          setDropPosition={setDropPosition}
          handleFileUpload={handleFileInputChange}
          pdfContainerRef={pdfContainerRef}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <LoadingOverlay>
            <CircularProgress />
            <Typography variant="body2">Processing...</Typography>
          </LoadingOverlay>
        )}
      </PDFContainer>
      
      {/* Dialogs */}
      <ShortcutsDialog
        open={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
      
      {/* Snackbar */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </PreviewContainer>
  );
};

export default PDFViewer;
