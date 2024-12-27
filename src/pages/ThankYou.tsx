import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useSnapshot } from 'valtio';
import { store } from '../stores/root-store';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function ThankYou() {
  const navigate = useNavigate();
  const snap = useSnapshot(store);

  useEffect(() => {
    if (!snap.currentOwner) {
      navigate('/');
    }
  }, [navigate, snap.currentOwner]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleStartOver = () => {
    // Clear session storage
    sessionStorage.removeItem('businessOwnerEmail');
    // Navigate to start
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <MotionPaper
          elevation={3}
          sx={{ p: 4, textAlign: 'center' }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MotionBox
            variants={container}
            initial="hidden"
            animate="show"
          >
            <MotionBox variants={item}>
              <CheckCircleOutlineIcon 
                sx={{ 
                  fontSize: 80, 
                  mb: 2,
                  color: '#4CAF50'
                }} 
              />
            </MotionBox>

            <MotionBox variants={item}>
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Success!
              </Typography>
            </MotionBox>

            <MotionBox variants={item}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                Your employee information has been saved
              </Typography>
            </MotionBox>

            <MotionBox variants={item}>
              <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="body1" color="text.primary">
                  {snap.currentEmployees.length} {snap.currentEmployees.length === 1 ? 'employee' : 'employees'} registered
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  for {snap.currentOwner?.businessName}
                </Typography>
              </Box>
            </MotionBox>

            <Divider sx={{ my: 3 }} />

            <MotionBox 
              variants={item}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                mt: 3
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate('/wizard')}
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                  color: 'white',
                }}
              >
                Add More Employees
              </Button>

              <Button
                variant="outlined"
                onClick={handleStartOver}
                startIcon={<HomeIcon />}
              >
                Back to Home
              </Button>
            </MotionBox>
          </MotionBox>
        </MotionPaper>
      </Box>
    </Container>
  );
}