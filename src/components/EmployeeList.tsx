import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Collapse,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { motion, AnimatePresence } from 'framer-motion';
import { Employee } from '../types';
import EmployeeForm from './EmployeeForm';

interface EmployeeListProps {
  employees: Employee[];
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Omit<Employee, 'id'>) => void;
}

export default function EmployeeList({ employees, onDelete, onEdit }: EmployeeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
  };

  const handleEditSubmit = (employeeData: Omit<Employee, 'id'>) => {
    if (editingId) {
      onEdit(editingId, employeeData);
      setEditingId(null);
    }
  };

  if (employees.length === 0) {
    return (
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 2, 
          textAlign: 'center', 
          color: 'text.secondary',
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        No employees added yet.
      </Typography>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mt: 2,
        overflow: 'hidden',
        '& .MuiTableRow-root:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        }
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="50">#</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee, index) => (
            <React.Fragment key={employee.id}>
              <TableRow
                component={motion.tr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{employee.firstName}</TableCell>
                <TableCell>{employee.lastName}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.gender}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEdit(employee)}
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(employee.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 0 }}>
                  <Collapse in={editingId === employee.id}>
                    <Box sx={{ p: 2 }}>
                      <AnimatePresence>
                        {editingId === employee.id && (
                          <EmployeeForm
                            initialData={employee}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingId(null)}
                            isEditMode={true}
                            submitLabel="Save Changes"
                          />
                        )}
                      </AnimatePresence>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}