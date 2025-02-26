import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import PDFEditor from './components/PDFEditor';
import Navbar from './components/Navbar';
import Documents from './pages/Documents';
import Tutorial from './pages/Tutorial';
import { getUserPreferences, saveUserPreferences } from './utils/localStorage';

// Add Inter font link to index.html
const interFontLink = document.createElement('link');
interFontLink.rel = 'stylesheet';
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
document.head.appendChild(interFontLink);

const AppContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.default,
  transition: 'background-color 0.3s ease',
}));

const ContentContainer = styled('div')(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const preferences = getUserPreferences();
    return preferences.darkMode || false;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      saveUserPreferences({ darkMode: newValue });
      return newValue;
    });
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2563eb', // Modern blue
      },
      secondary: {
        main: '#ec4899', // Modern pink
      },
      background: {
        default: darkMode ? '#121212' : '#f8fafc',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  }), [darkMode]);

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContainer>
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <ContentContainer>
            <Routes>
              <Route path="/" element={<Navigate to="/editor" replace />} />
              <Route path="/editor" element={<PDFEditor />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/tutorial" element={<Tutorial />} />
            </Routes>
          </ContentContainer>
        </AppContainer>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
