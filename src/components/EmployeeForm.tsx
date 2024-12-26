import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Employee } from '../types';

const MotionPaper = motion(Paper);

interface EmployeeFormProps {
  onSubmit: (employee: Omit<Employee, 'id'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Employee;
  isEditMode?: boolean;
  submitLabel?: string;
  emailTemplate?: string;
}

type FormData = Omit<Employee, 'id'>;

export default function EmployeeForm({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  initialData,
  isEditMode = false,
  submitLabel,
  emailTemplate
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: emailTemplate || '',
    gender: 'prefer-not-to-say',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    gender: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        gender: initialData.gender,
      });
      // Reset touched and errors when loading initial data
      setTouched({
        firstName: false,
        lastName: false,
        email: false,
        gender: false,
      });
      setErrors({});
    }
  }, [initialData]);

  const validate = (field: keyof FormData, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          return `${field === 'firstName' ? 'First' : 'Last'} name is required`;
        }
        if (value.length < 2) {
          return 'Name must be at least 2 characters long';
        }
        if (!/^[a-zA-Z\s-']+$/.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;

      case 'email':
        if (!value) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'gender':
        if (!value) {
          return 'Please select a gender';
        }
        break;
    }
    return '';
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if field was touched
    if (touched[field]) {
      const error = validate(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const handleBlur = (field: keyof FormData) => () => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validate(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(field => {
      const error = validate(field as keyof FormData, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Set all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      gender: true,
    });

    // If there are errors, display them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit(formData);

    // Only reset form if not in edit mode
    if (!isEditMode) {
      setFormData({
        firstName: '',
        lastName: '',
        email: emailTemplate || '',
        gender: 'prefer-not-to-say',
      });
      setTouched({
        firstName: false,
        lastName: false,
        email: false,
        gender: false,
      });
      setErrors({});
    }
  };

  return (
    <MotionPaper
      elevation={isEditMode ? 0 : 2}
      sx={{ p: 3, mb: 3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {!isEditMode && (
        <Typography variant="h6" gutterBottom>
          Add New Employee
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              error={touched.firstName && !!errors.firstName}
              helperText={touched.firstName && errors.firstName}
              disabled={isLoading}
              required
              inputProps={{
                'aria-label': 'First Name',
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              error={touched.lastName && !!errors.lastName}
              helperText={touched.lastName && errors.lastName}
              disabled={isLoading}
              required
              inputProps={{
                'aria-label': 'Last Name',
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && !!errors.email}
              helperText={(touched.email && errors.email) || (emailTemplate && `Template: ${emailTemplate}`)}
              placeholder={emailTemplate}
              disabled={isLoading}
              required
              inputProps={{
                'aria-label': 'Email Address',
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Gender"
              value={formData.gender}
              onChange={handleChange('gender')}
              onBlur={handleBlur('gender')}
              error={touched.gender && !!errors.gender}
              helperText={touched.gender && errors.gender}
              disabled={isLoading}
              required
              inputProps={{
                'aria-label': 'Gender',
              }}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
              <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'flex-end',
              mt: 2 
            }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  sx={{
                    minWidth: 100,
                  }}
                >
                  Cancel
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    minWidth: 100,
                    background: isEditMode 
                      ? 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)'
                      : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    color: 'white',
                  }}
                >
                  {submitLabel || (isEditMode ? 'Save Changes' : 'Add Employee')}
                </Button>
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </MotionPaper>
  );
}