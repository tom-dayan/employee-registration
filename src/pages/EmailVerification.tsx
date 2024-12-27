import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Link,
  Autocomplete,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
// import { StorageService } from '../utils/storage';
import { useSnapshot } from 'valtio';
import { store, actions } from '../stores/root-store';

const MotionPaper = motion.create(Paper);

export default function EmailVerification() {
  const snap = useSnapshot(store);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
  
      const existingOwner = snap.owners.find(owner => owner.email === email);
      
      if (!existingOwner) {
        setError('Email not found. Would you like to register as a new business owner?');
        setShowRegistration(true);
        setIsLoading(false);
        return;
      }
  
      sessionStorage.setItem('businessOwnerEmail', email);
      actions.setCurrentOwner(email);
      navigate('/wizard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate all required fields
      if (!firstName.trim()) throw new Error('First name is required');
      if (!lastName.trim()) throw new Error('Last name is required');
      if (!businessName.trim()) throw new Error('Business name is required');
      if (!phone.trim()) throw new Error('Phone number is required');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate email template if provided
      if (emailTemplate && !emailTemplate.startsWith('@')) {
        throw new Error('Email template should start with @');
      }

      actions.addOwner({
        email,
        firstName,
        lastName,
        businessName,
        phone,
        emailTemplate,
        registeredAt: new Date().toISOString(),
        employees: []
      });

      sessionStorage.setItem('businessOwnerEmail', email);
      actions.setCurrentOwner(email);
      navigate('/wizard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <MotionPaper
          elevation={3}
          sx={{ p: 4 }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {showRegistration ? 'Register Your Business' : 'Welcome'}
          </Typography>

          <AnimatePresence mode="wait">
            {!showRegistration ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <form onSubmit={handleLogin}>
                  <Autocomplete
                    freeSolo
                    options={snap.owners.map(owner => owner.email)}
                    value={email}
                    onChange={(_, newValue) => setEmail(newValue || '')}
                    onInputChange={(_, newValue) => setEmail(newValue)}
                    disabled={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="Business Email"
                        variant="outlined"
                        error={!!error}
                        helperText={error}
                        sx={{ mb: 3 }}
                      />
                    )}
                  />

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large"
                      type="submit"
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                  </motion.div>

                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowRegistration(true);
                        setError(null);
                      }}
                      sx={{ textDecoration: 'none' }}
                    >
                      Not registered with us yet? Click here to fix that 😊
                    </Link>
                  </Box>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="registration"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <form onSubmit={handleRegistration}>
                  <TextField
                    fullWidth
                    label="Business Email"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    sx={{ mb: 3 }}
                    required
                    error={!!error && error.includes('email')}
                  />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        variant="outlined"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        variant="outlined"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Business Name"
                    variant="outlined"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={isLoading}
                    required
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                    required
                    sx={{ mb: 3 }}
                  />

                  <TextField
                    fullWidth
                    label="Employee Email Template"
                    variant="outlined"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    disabled={isLoading}
                    placeholder="@mycompany.com"
                    helperText="Optional: This will be pre-filled when adding employees"
                    error={!!error && error.includes('template')}
                    sx={{ mb: 3 }}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        setShowRegistration(false);
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Back to Login
                    </Button>

                    <Button 
                      fullWidth 
                      variant="contained" 
                      size="large"
                      type="submit"
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                        color: 'white',
                      }}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>
                  </Box>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </MotionPaper>
      </Box>
    </Container>
  );
}