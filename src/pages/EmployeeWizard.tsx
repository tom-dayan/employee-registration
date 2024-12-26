import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  Zoom,
  Fab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee } from '../types';
import { StorageService, StoredBusinessOwner } from '../utils/storage';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import BusinessOwnerEdit from '../components/BusinessOwnerEdit';

const MotionPaper = motion(Paper);
const MAX_EMPLOYEES = 10;

export default function EmployeeWizard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [ownerData, setOwnerData] = useState<StoredBusinessOwner | null>(null);
  const [showLimitMessage, setShowLimitMessage] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);

  useEffect(() => {
    const email = sessionStorage.getItem('businessOwnerEmail');
    
    if (!email) {
      navigate('/');
      return;
    }

    const owner = StorageService.getOwnerByEmail(email);
    if (owner) {
      setOwnerData(owner);
      setEmployees(owner.employees);
    }
  }, [navigate]);

  useEffect(() => {
    if (unsavedChanges) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [unsavedChanges]);

  useEffect(() => {
    if (employees.length >= MAX_EMPLOYEES) {
      setShowLimitMessage(true);
    } else {
      setShowLimitMessage(false);
    }
  }, [employees.length]);

  const handleNavigation = (path: string) => {
    if (unsavedChanges) {
      setIntendedPath(path);
      setShowLeaveConfirm(true);
    } else {
      navigate(path);
    }
  };

  const handleAddEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    if (employees.length >= MAX_EMPLOYEES) {
      setError('Maximum of 10 employees reached');
      return;
    }

    if (employees.some(emp => emp.email === employeeData.email)) {
      setError('An employee with this email already exists');
      return;
    }

    const newEmployee: Employee = {
      ...employeeData,
      id: crypto.randomUUID(),
    };

    setEmployees(prev => [...prev, newEmployee]);
    setUnsavedChanges(true);
    setShowSuccess(true);
    setShowForm(false);
  };

  const handleEditEmployee = (id: string, data: Omit<Employee, 'id'>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...data, id } : emp
    ));
    setUnsavedChanges(true);
    setShowSuccess(true);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setUnsavedChanges(true);
  };

  const saveToStorage = (employeeList: Employee[]) => {
    const email = sessionStorage.getItem('businessOwnerEmail');
    if (email && ownerData) {
      StorageService.saveOwner({
        ...ownerData,
        employees: employeeList,
      });
    }
  };

  const handleSubmitAll = async () => {
    if (employees.length === 0) {
      setError('Please add at least one employee');
      return;
    }

    setIsLoading(true);
    try {
      // Save to storage only on submit
      saveToStorage(employees);
      setUnsavedChanges(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/thank-you');
    } catch (err) {
      setError('Failed to submit employees. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const LeaveConfirmationDialog = () => (
    <Dialog 
      open={showLeaveConfirm} 
      onClose={() => setShowLeaveConfirm(false)}
      PaperProps={{
        sx: {
          minWidth: 300
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Unsaved Changes
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>
          You have unsaved changes. Are you sure you want to leave without saving?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowLeaveConfirm(false)}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => {
            setShowLeaveConfirm(false);
            if (intendedPath) {
              setUnsavedChanges(false);
              navigate(intendedPath);
            }
          }}
          color="error"
          variant="contained"
        >
          Leave Without Saving
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <MotionPaper
          elevation={3}
          sx={{ p: 4 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => handleNavigation('/')}
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#666' }}
              >
                Back to Login
              </Button>
            </Box>
            {ownerData && (
              <Button
                onClick={() => setIsEditingOwner(true)}
                startIcon={<EditIcon />}
                variant="outlined"
              >
                Edit Business Details
              </Button>
            )}
          </Box>

          {ownerData && (
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                color: 'text.secondary',
                fontWeight: 'normal'
              }}
            >
              Welcome back, {ownerData.firstName}!
            </Typography>
          )}

          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Employee Registration
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Add up to {MAX_EMPLOYEES} employees. Changes will be saved when you submit.
          </Typography>

          {showLimitMessage && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                background: 'linear-gradient(45deg, #FFA726 30%, #FFB74D 90%)',
                color: 'white'
              }}
            >
              You've reached the maximum limit of {MAX_EMPLOYEES} employees
            </Alert>
          )}

          {unsavedChanges && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
            >
              You have unsaved changes. Don't forget to submit!
            </Alert>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <EmployeeForm 
                  onSubmit={handleAddEmployee}
                  onCancel={() => setShowForm(false)}
                  isLoading={isLoading}
                  emailTemplate={ownerData?.emailTemplate}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <EmployeeList 
            employees={employees}
            onDelete={handleDeleteEmployee}
            onEdit={handleEditEmployee}
          />

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Fab
              color="primary"
              onClick={() => setShowForm(true)}
              disabled={employees.length >= MAX_EMPLOYEES || showForm}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              }}
            >
              <AddIcon />
            </Fab>

            <Button
              variant="contained"
              onClick={handleSubmitAll}
              disabled={isLoading || employees.length === 0}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                minWidth: 200,
              }}
            >
              Submit All Employees
            </Button>
          </Box>
        </MotionPaper>
      </Box>

      {ownerData && (
        <BusinessOwnerEdit
          open={isEditingOwner}
          onClose={() => setIsEditingOwner(false)}
          owner={ownerData}
        />
      )}

      <LeaveConfirmationDialog />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        TransitionComponent={Zoom}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        TransitionComponent={Zoom}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          Employee saved successfully
        </Alert>
      </Snackbar>
    </Container>
  );
}