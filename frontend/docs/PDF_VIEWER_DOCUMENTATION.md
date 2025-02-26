# PDF Viewer Documentation

## Overview
The PDF Viewer component (`PDFPreview.js`) is a React-based PDF viewer with integrated image editing capabilities. It provides a streamlined interface for viewing PDFs and adding images through a toolbar-based approach, with all data persisted in local storage for seamless user experience.

## Core Technologies
- **Adobe PDF Embed API**: For rendering PDFs
- **Material-UI**: For UI components and styling
- **React**: For component architecture and state management
- **LocalStorage**: For data persistence (PDFs, images, and user preferences)

## Component Architecture

### 1. State Management
```javascript
// PDF state
const [pdfUrl, setPdfUrl] = useState(null);              // Current PDF URL
const [isLoading, setIsLoading] = useState(true);        // Loading state
const [error, setError] = useState(null);                // Error handling
const [zoomLevel, setZoomLevel] = useState(100);         // Zoom level
const [isProtected, setIsProtected] = useState(false);   // PDF protection status

// Image state
const [placedImages, setPlacedImages] = useState([]);    // Images on PDF
const [recentImages, setRecentImages] = useState([]);    // Recent images list
const [selectedImage, setSelectedImage] = useState(null); // Currently selected image
```

### 2. Local Storage Integration

#### Storage Keys
```javascript
const RECENT_IMAGES_STORAGE_KEY = 'pdfsigno_recent_images';
const DOCUMENTS_STORAGE_KEY = 'pdfsigno_documents';
```

Data persistence is handled for:
1. **Documents**: Saved PDFs with metadata
2. **Images**: Recently used images
3. **User Preferences**: UI settings and preferences

### 3. Core Features

#### PDF Management
- Upload and view PDFs
- Zoom controls (50-200%)
- Undo/Redo support
- Grid overlay for precise image placement
- Save functionality for modified PDFs

#### Image Integration
- Toolbar-based image insertion
- Standalone image editor for adjustments
- Recent images history
- Position and scale control

#### Data Persistence
- Automatic saving of documents
- Image history management
- State recovery on page reload

### 4. Component Structure

#### PDFPreview
Main component handling:
- PDF rendering
- Toolbar interactions
- Image placement
- State management

#### ImageEditor
Standalone component for:
- Image adjustments
- Cropping
- Rotation
- Scale control

### 5. Toolbar Features

```javascript
<Toolbar>
  {/* Document Controls */}
  <Tooltip title="Save Document">
    <IconButton onClick={handleSave}>
      <Save />
    </IconButton>
  </Tooltip>

  {/* Image Controls */}
  <Tooltip title="Insert Image">
    <IconButton onClick={() => fileInputRef.current?.click()}>
      <BorderColor />
    </IconButton>
  </Tooltip>

  {/* View Controls */}
  <Tooltip title="Toggle Grid">
    <IconButton onClick={toggleGrid}>
      <GridOn />
    </IconButton>
  </Tooltip>
</Toolbar>
```

## Implementation Details

### 1. File Upload Handling
```javascript
const handleFileUpload = useCallback(async (uploadedFile) => {
  if (uploadedFile.type === 'application/pdf') {
    // Handle PDF upload
    const url = URL.createObjectURL(uploadedFile);
    setPdfUrl(url);
    saveDocument({ url, name: uploadedFile.name });
  } else if (uploadedFile.type.startsWith('image/')) {
    // Handle image upload
    const imageUrl = URL.createObjectURL(uploadedFile);
    setSelectedImage(imageUrl);
    saveImage({ url: imageUrl, name: uploadedFile.name });
  }
}, []);
```

### 2. Image Placement
```javascript
const handleImagePlaced = useCallback((editedImage) => {
  const newImage = {
    id: Date.now().toString(),
    url: editedImage,
    position: { x: 50, y: 50 }, // Default center
    rotation: 0,
    scale: 1
  };
  setPlacedImages(prev => [...prev, newImage]);
}, []);
```

### 3. Local Storage Management
```javascript
// Save document to storage
const saveDocument = (document) => {
  try {
    const documents = JSON.parse(localStorage.getItem(DOCUMENTS_STORAGE_KEY) || '[]');
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify([document, ...documents]));
  } catch (error) {
    console.error('Failed to save document:', error);
  }
};

// Save image to storage
const saveImage = (image) => {
  try {
    const images = JSON.parse(localStorage.getItem(RECENT_IMAGES_STORAGE_KEY) || '[]');
    localStorage.setItem(RECENT_IMAGES_STORAGE_KEY, JSON.stringify([image, ...images]));
  } catch (error) {
    console.error('Failed to save image:', error);
  }
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| file | File | PDF file to display |
| initialZoom | string | Initial zoom level (default: 'page-fit') |
| onImagePlaced | function | Callback when image is placed on PDF |

## Best Practices

### 1. Performance
- Use `useCallback` for event handlers
- Implement proper cleanup in `useEffect`
- Optimize image sizes before storage
- Clean up object URLs when no longer needed

### 2. Error Handling
- Comprehensive error messages via snackbar
- Fallback UI for error states
- Proper error logging
- Recovery mechanisms for storage failures

### 3. Security
- Validate file types
- Sanitize file inputs
- Secure storage handling
- Protected PDF support

### 4. User Experience
- Clear feedback for all actions
- Intuitive toolbar layout
- Responsive design
- Consistent error messages

## Future Enhancements
1. Cloud storage integration
2. Batch image processing
3. Advanced PDF manipulation (merge, split)
4. Collaborative editing features
5. Export in multiple formats
