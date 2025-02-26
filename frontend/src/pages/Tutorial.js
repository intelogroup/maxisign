import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Button, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import { 
  FileUpload, 
  Image, 
  Edit, 
  Save, 
  Undo, 
  GridOn, 
  ZoomIn, 
  KeyboardArrowLeft, 
  KeyboardArrowRight,
  PlayCircleOutline,
  LightbulbOutlined,
  EmojiObjects
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for a more modern look
const StepperContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
    borderRadius: theme.shape.borderRadius,
    zIndex: -1,
  }
}));

const TutorialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
}));

const TutorialMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '30%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
  }
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const StepButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginRight: theme.spacing(1),
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1, 3),
}));

const VideoButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: alpha(theme.palette.common.white, 0.8),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.common.white,
  },
  zIndex: 2,
  width: 64,
  height: 64,
}));

// Tutorial steps
const steps = [
  {
    label: 'Upload Your PDF',
    description: 'Start by uploading your PDF document using the "Upload" button in the toolbar. MaxiSign supports all standard PDF formats.',
    image: '/tutorial/upload-pdf.png',
    video: '/tutorial/upload-demo.mp4',
    tip: 'You can also drag and drop your PDF directly into the application window.'
  },
  {
    label: 'Add Text and Images',
    description: 'Click the text or image icon in the toolbar to add content to your PDF. You can add text boxes for signatures or notes, and select images from your computer.',
    image: '/tutorial/add-image.png',
    video: '/tutorial/image-demo.mp4',
    tip: 'Use the grid overlay (toggle with the grid button) to help with precise placement of text and images.'
  },
  {
    label: 'Edit and Position',
    description: 'Use the toolbar to edit text properties or adjust images. You can resize, rotate, or reposition elements exactly where you want them on your PDF.',
    image: '/tutorial/edit-image.png',
    video: '/tutorial/edit-demo.mp4',
    tip: 'You can use the zoom controls to get a closer look for precise positioning.'
  },
  {
    label: 'Save Your Work',
    description: 'Click the save button to download your modified PDF to your computer. Your original document remains unchanged.',
    image: '/tutorial/save-pdf.png',
    video: '/tutorial/save-demo.mp4',
    tip: 'MaxiSign automatically saves your progress, but it\'s good practice to download important documents when finished.'
  },
];

// Key features to highlight
const features = [
  {
    title: 'PDF Editor',
    description: 'Powerful tools to add text, signatures, and images to your PDF documents.',
    icon: <Edit fontSize="large" />
  },
  {
    title: 'Image Editor (Coming Soon)',
    description: 'Advanced image editing capabilities will be available in our upcoming release.',
    icon: <Image fontSize="large" />
  },
  {
    title: 'Local Storage',
    description: 'All your documents and images are securely stored on your device for easy access.',
    icon: <Save fontSize="large" />
  },
  {
    title: 'Precision Tools',
    description: 'Grid overlay and zoom controls for pixel-perfect element placement.',
    icon: <GridOn fontSize="large" />
  }
];

const Tutorial = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 8,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -40,
          right: -100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
          zIndex: -1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -60,
          left: -120,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          zIndex: -1,
        }
      }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          Getting Started with MaxiSign
        </Typography>
        <Typography variant="h5" color="textSecondary" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
          Learn how to use MaxiSign's PDF editor and upcoming image editor features in just a few simple steps.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          endIcon={<KeyboardArrowRight />}
          sx={{ 
            borderRadius: 8,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: theme.shadows[4],
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          }}
          onClick={() => document.getElementById('tutorial-steps').scrollIntoView({ behavior: 'smooth' })}
        >
          Start Tutorial
        </Button>
      </Box>

      {/* Tutorial Steps */}
      <StepperContainer id="tutorial-steps">
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Step-by-Step Guide
        </Typography>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {step.label}
                </Typography>
              </StepLabel>
              <StepContent>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" paragraph>
                      {step.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LightbulbOutlined color="warning" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        <strong>Pro Tip:</strong> {step.tip}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <StepButton
                        variant="contained"
                        onClick={handleNext}
                        disabled={index === steps.length - 1}
                      >
                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                      </StepButton>
                      <StepButton
                        disabled={index === 0}
                        onClick={handleBack}
                        variant="outlined"
                      >
                        Back
                      </StepButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
                      <img 
                        src={step.image || '/tutorial/placeholder.png'} 
                        alt={step.label}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                      <Tooltip title="Watch Video Tutorial">
                        <VideoButton aria-label="play video">
                          <PlayCircleOutline fontSize="large" />
                        </VideoButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              All steps completed - you're ready to use MaxiSign!
            </Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Restart Tutorial
            </Button>
          </Paper>
        )}
      </StepperContainer>

      {/* Key Features */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center' }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Additional Resources */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
          Additional Resources
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <TutorialCard>
              <TutorialMedia
                image="/tutorial/video-tutorials.jpg"
                title="Video Tutorials"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  Video Tutorials
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Watch our comprehensive video tutorials covering all aspects of MaxiSign.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  endIcon={<KeyboardArrowRight />}
                >
                  Watch Videos
                </Button>
              </CardContent>
            </TutorialCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TutorialCard>
              <TutorialMedia
                image="/tutorial/faq.jpg"
                title="Frequently Asked Questions"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  FAQ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find answers to commonly asked questions about using MaxiSign.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  endIcon={<KeyboardArrowRight />}
                >
                  View FAQ
                </Button>
              </CardContent>
            </TutorialCard>
          </Grid>
          <Grid item xs={12} md={4}>
            <TutorialCard>
              <TutorialMedia
                image="/tutorial/support.jpg"
                title="Support"
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  Support
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Need help? Contact our support team or browse through our knowledge base.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  endIcon={<KeyboardArrowRight />}
                >
                  Get Support
                </Button>
              </CardContent>
            </TutorialCard>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mt: 8, 
          p: 6, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Ready to enhance your documents?
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
          Start using MaxiSign today to add text, signatures, and images to your PDF documents. Image editor coming soon!
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          href="/documents"
          sx={{ 
            borderRadius: 8,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            boxShadow: theme.shadows[4],
          }}
        >
          Go to Documents
        </Button>
      </Box>
    </Container>
  );
};

export default Tutorial;
