import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4, 
  Brightness7, 
  Description,
  MenuBook,
  Home,
  ArrowForwardIos,
  BugReport
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import userAvatar from '../assets/images/user-avatar.png';

// Styled components for a more modern look
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // for Safari
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  backgroundColor: alpha(
    theme.palette.mode === 'dark' 
      ? theme.palette.background.default 
      : theme.palette.background.paper, 
    theme.palette.mode === 'dark' ? 0.9 : 0.95
  ),
  transition: 'all 0.3s ease',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginLeft: theme.spacing(1),
  fontSize: '1.5rem',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  borderRadius: 8,
  padding: '6px 16px',
  textTransform: 'none',
  fontWeight: 500,
  position: 'relative',
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '&::after': active ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '30%',
    height: 3,
    borderRadius: '3px 3px 0 0',
    backgroundColor: theme.palette.primary.main,
  } : {},
}));

const Navbar = ({ darkMode, toggleDarkMode }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <StyledAppBar>
      <Toolbar sx={{ justifyContent: 'space-between', py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ 
                mr: 1,
                borderRadius: 1.5,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
            onClick={() => navigate('/')}
          >
            <Box
              component="div"
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={theme.palette.primary.main} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} />
                  </linearGradient>
                  <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={theme.palette.secondary.main} />
                    <stop offset="100%" stopColor={theme.palette.primary.main} />
                  </linearGradient>
                </defs>
                <polygon 
                  points="20,5 35,20 20,35 5,20" 
                  fill="none" 
                  stroke="url(#logoGradient)" 
                  strokeWidth="2"
                />
                <polygon 
                  points="20,10 30,20 20,30 10,20" 
                  fill="url(#logoGradient2)" 
                  fillOpacity="0.7"
                />
                <circle cx="20" cy="20" r="3" fill="white" />
              </svg>
            </Box>
            <LogoText>
              MaxiSign
            </LogoText>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1, mx: 2 }}>
              <NavButton 
                color="inherit" 
                startIcon={<Description />}
                onClick={() => navigate('/documents')}
                active={location.pathname === '/documents'}
              >
                Documents
              </NavButton>
              <NavButton 
                color="inherit"
                startIcon={<MenuBook />}
                onClick={() => navigate('/tutorial')}
                active={location.pathname === '/tutorial'}
              >
                Tutorial
              </NavButton>
            </Box>
          )}
          
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              sx={{ 
                ml: 0.5,
                borderRadius: 1.5,
                color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                }
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Account settings">
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
            >
              <Avatar
                src={userAvatar}
                alt="User avatar"
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: `2px solid ${theme.palette.primary.main}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.primary.main}`
                  }
                }}
              />
            </IconButton>
          </Tooltip>

          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <Avatar src={userAvatar} sx={{ width: 24, height: 24, mr: 2 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => navigate('/settings')}>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate('/logout')}>
              Logout
            </MenuItem>
          </Menu>

          <Menu
            id="mobile-menu"
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMobileMenuClose}
            onClick={handleMobileMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                mt: 1.5,
              },
            }}
          >
            <MenuItem onClick={() => navigate('/')}>
              <Home sx={{ mr: 2 }} /> Home
            </MenuItem>
            <MenuItem onClick={() => navigate('/documents')}>
              <Description sx={{ mr: 2 }} /> Documents
            </MenuItem>
            <MenuItem onClick={() => navigate('/tutorial')}>
              <MenuBook sx={{ mr: 2 }} /> Tutorial
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
