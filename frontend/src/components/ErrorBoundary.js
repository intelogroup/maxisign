import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.error.main,
}));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });

    // You could send to an error tracking service here
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  handleReload = () => {
    // Clear any cached data that might be causing the error
    try {
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear session storage:', e);
      window.location.reload();
    }
  };

  handleReset = () => {
    // Clear all storage and reload
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorMessage variant="h4" gutterBottom>
            Oops! Something went wrong.
          </ErrorMessage>
          <Typography variant="body1" gutterBottom>
            We apologize for the inconvenience. Please try refreshing the page.
          </Typography>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="error" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.handleReload}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={this.handleReset}
            >
              Reset App Data
            </Button>
          </Box>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
