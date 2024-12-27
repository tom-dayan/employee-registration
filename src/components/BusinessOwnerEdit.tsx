// In BusinessOwnerEdit.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import { BusinessOwner, actions } from '../stores/root-store';

interface BusinessOwnerEditProps {
  open: boolean;
  onClose: () => void;
  owner: Readonly<BusinessOwner>;
}

// Define a type for the editable fields
interface EditableOwnerData {
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  emailTemplate: string;
}

export default function BusinessOwnerEdit({ open, onClose, owner }: BusinessOwnerEditProps) {
  const [formData, setFormData] = useState<EditableOwnerData>({
    firstName: '',
    lastName: '',
    businessName: '',
    phone: '',
    emailTemplate: '',
  });

  useEffect(() => {
    if (owner) {
      setFormData({
        firstName: owner.firstName,
        lastName: owner.lastName,
        businessName: owner.businessName,
        phone: owner.phone,
        emailTemplate: owner.emailTemplate || '',
      });
    }
  }, [owner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create a new owner object with updated data while maintaining the original structure
      const updatedOwner: BusinessOwner = {
        ...owner,
        ...formData,
        employees: [...owner.employees], // Create a new array reference
      };
      actions.updateOwner(updatedOwner);
      onClose();
    } catch (error) {
      console.error('Failed to update business owner:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        color: 'white'
      }}>
        Edit Business Details
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Name"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Template"
                value={formData.emailTemplate}
                onChange={(e) => setFormData(prev => ({ ...prev, emailTemplate: e.target.value }))}
                placeholder="@mycompany.com"
                helperText="This will be pre-filled when adding new employees"
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}