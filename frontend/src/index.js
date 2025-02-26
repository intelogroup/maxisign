import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import './index.css';
// Import Poppins font
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
// Import calligraphy fonts
import '@fontsource/dancing-script/700.css';
import '@fontsource/great-vibes';
import '@fontsource/pacifico';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { checkStorageAvailability } from './utils/localStorage';

// Check browser compatibility and storage availability
const checkBrowserCompatibility = () => {
  const features = {
    localStorage: typeof window.localStorage !== 'undefined',
    fileReader: typeof FileReader !== 'undefined',
    blob: typeof Blob !== 'undefined',
    urlObject: typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
  };
  
  const missingFeatures = Object.entries(features)
    .filter(([_, supported]) => !supported)
    .map(([feature]) => feature);
    
  return {
    compatible: missingFeatures.length === 0,
    missingFeatures
  };
};

// Register service worker
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production' && process.env.REACT_APP_ENABLE_SERVICE_WORKER === 'true') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Initialize analytics in production
if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_ENABLE_ANALYTICS === 'true') {
  // Initialize your analytics service here
  console.log('Analytics initialized in production mode');
}

// Check browser compatibility and storage
const compatibility = checkBrowserCompatibility();
const storage = checkStorageAvailability();

if (!compatibility.compatible) {
  console.error('Browser missing required features:', compatibility.missingFeatures);
}

if (!storage.available) {
  console.error('Storage not available:', storage.reason);
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App 
          browserCompatible={compatibility.compatible}
          storageAvailable={storage.available}
        />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
