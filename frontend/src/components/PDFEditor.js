import React, { useState, useCallback, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Paper, 
  Grid, 
  Typography, 
  CircularProgress, 
  Fade,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import PDFViewer from './PDFViewer';
import ImagePreview from './ImagePreview';
import FileUploader from './FileUpload/FileUploader';

const EditorContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  transition: 'all 0.3s ease',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0, // Important for proper flex behavior
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
  },
}));

const EditorPanel = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  minHeight: '800px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  borderRadius: theme.shape.borderRadius,
}));

const ControlsContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const EditorHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
}));

const EditorContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
  overflow: 'auto',
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'ready' 
    ? theme.palette.success.light 
    : theme.palette.info.light,
  color: status === 'ready' 
    ? theme.palette.success.contrastText 
    : theme.palette.info.contrastText,
  fontWeight: 500,
  transition: 'all 0.3s ease',
}));

function PDFEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePosition, setImagePosition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editorStatus, setEditorStatus] = useState('waiting'); // 'waiting', 'ready', 'processing'
  const [isInitialized, setIsInitialized] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add animation effect on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handlePdfSelect = useCallback((file) => {
    setError(null);
    setPdfFile(file);
    setCurrentPage(1);
    setEditorStatus('ready');
  }, []);

  const handleImageSelect = useCallback((file) => {
    setError(null);
    setImageFile(file);
    setImagePosition(null);
  }, []);

  const handleImagePlaced = useCallback((data) => {
    const { x, y, rotation, scale } = data;
    setImagePosition({ x, y, rotation, scale });
    setEditorStatus('processing');
    
    // Simulate processing
    setTimeout(() => {
      setEditorStatus('ready');
    }, 1000);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const handleTotalPagesChange = useCallback((pages) => {
    setTotalPages(pages);
  }, []);

  return (
    <Fade in={isInitialized} timeout={800}>
      <EditorContainer>
        <ContentContainer>
          <EditorPanel elevation={0}>
            <EditorHeader>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  mb: 0.5,
                  color: theme.palette.text.primary,
                }}>
                  PDF Editor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Edit your PDF and add images with precise positioning
                </Typography>
              </Box>
              {editorStatus !== 'waiting' && (
                <StatusChip 
                  label={editorStatus === 'ready' ? 'Ready' : 'Processing'} 
                  size="small"
                  status={editorStatus}
                />
              )}
            </EditorHeader>
            
            <EditorContent>
              <ControlsContainer elevation={0}>
                <FileUploader
                  accept="application/pdf"
                  label="Select PDF"
                  onChange={handlePdfSelect}
                  file={pdfFile}
                  disabled={isLoading}
                />
                <Divider orientation="vertical" flexItem />
                <FileUploader
                  accept="image/*"
                  label="Select Image"
                  onChange={handleImageSelect}
                  file={imageFile}
                  disabled={isLoading}
                  sx={{
                    '& .MuiButton-root': {
                      color: '#ffffff',
                      backgroundColor: '#e91e63',
                      borderColor: '#e91e63',
                      '&:hover': {
                        backgroundColor: '#d81b60',
                        borderColor: '#d81b60'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#ffffff'
                      }
                    }
                  }}
                />
              </ControlsContainer>

              {error && (
                <Typography 
                  color="error" 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'error.light', 
                    borderRadius: 1,
                    opacity: 0.9
                  }}
                >
                  {error}
                </Typography>
              )}
              
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress />
                </Box>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  {pdfFile ? (
                    <PDFViewer
                      initialPdfUrl={pdfFile ? URL.createObjectURL(pdfFile) : null}
                      onImagePlaced={handleImagePlaced}
                    />
                  ) : (
                    <Skeleton 
                      variant="rectangular" 
                      height={800} 
                      animation="wave" 
                      sx={{ 
                        borderRadius: theme.shape.borderRadius,
                        bgcolor: theme.palette.action.hover
                      }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ImagePreview
                    file={imageFile}
                    onImageChange={handleImageSelect}
                    disabled={!pdfFile || isLoading}
                  />
                </Grid>
              </Grid>
            </EditorContent>
          </EditorPanel>
        </ContentContainer>
      </EditorContainer>
    </Fade>
  );
}

export default PDFEditor;
