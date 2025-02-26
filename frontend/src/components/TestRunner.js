import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  PlayArrow, 
  Delete, 
  Refresh, 
  BugReport,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

import { 
  testDocumentSaving, 
  testImageSaving, 
  testPDFPreviewSaving, 
  runAllTests 
} from '../utils/runTests';

import { 
  clearAllDocuments, 
  clearAllImages, 
  getFromStorage, 
  STORAGE_KEYS 
} from '../utils/localStorage';

const TestRunner = () => {
  const [results, setResults] = useState({
    documents: null,
    images: null,
    pdfPreview: null
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const handleRunDocumentTest = () => {
    try {
      const documents = testDocumentSaving();
      setResults(prev => ({ ...prev, documents }));
      setSnackbar({
        open: true,
        message: 'Document test completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error running document test:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleRunImageTest = () => {
    try {
      const images = testImageSaving();
      setResults(prev => ({ ...prev, images }));
      setSnackbar({
        open: true,
        message: 'Image test completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error running image test:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleRunPDFPreviewTest = () => {
    try {
      const pdfPreview = testPDFPreviewSaving();
      setResults(prev => ({ ...prev, pdfPreview }));
      setSnackbar({
        open: true,
        message: 'PDF Preview test started (check console for complete results)',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error running PDF Preview test:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleRunAllTests = () => {
    try {
      const { documents, images } = runAllTests();
      setResults({ documents, images, pdfPreview: null });
      setSnackbar({
        open: true,
        message: 'All tests completed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error running all tests:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleClearStorage = () => {
    try {
      clearAllDocuments();
      clearAllImages();
      setResults({
        documents: null,
        images: null,
        pdfPreview: null
      });
      setSnackbar({
        open: true,
        message: 'Storage cleared successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleRefreshResults = () => {
    try {
      const documents = getFromStorage(STORAGE_KEYS.DOCUMENTS);
      const images = getFromStorage(STORAGE_KEYS.RECENT_IMAGES);
      setResults({
        documents,
        images,
        pdfPreview: null
      });
      setSnackbar({
        open: true,
        message: 'Results refreshed',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error refreshing results:', error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          LocalStorage Test Runner
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Run tests to verify that the localStorage functions are working correctly, especially the duplicate prevention logic.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PlayArrow />}
            onClick={handleRunAllTests}
          >
            Run All Tests
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<Delete />}
            onClick={handleClearStorage}
          >
            Clear Storage
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefreshResults}
          >
            Refresh Results
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Document Tests
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Tests saving documents and checks for duplicates.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<BugReport />}
                  onClick={handleRunDocumentTest}
                >
                  Run Test
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Image Tests
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Tests saving images and checks for duplicates.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<BugReport />}
                  onClick={handleRunImageTest}
                >
                  Run Test
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  PDF Preview Tests
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Tests PDF Preview component's interaction with localStorage.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<BugReport />}
                  onClick={handleRunPDFPreviewTest}
                >
                  Run Test
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h5" gutterBottom>
          Test Results
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Documents in Storage: {results.documents ? results.documents.length : 0}
              </Typography>
              
              {results.documents && results.documents.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {results.documents.map((doc, index) => (
                    <Box key={doc.id} sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1">
                        {doc.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ID: {doc.id}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Type: {doc.type}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Timestamp: {new Date(doc.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No documents in storage</Alert>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Images in Storage: {results.images ? results.images.length : 0}
              </Typography>
              
              {results.images && results.images.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {results.images.map((img, index) => (
                    <Box key={img.id} sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle1">
                        {img.name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        ID: {img.id}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Type: {img.type}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Timestamp: {new Date(img.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No images in storage</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TestRunner;
