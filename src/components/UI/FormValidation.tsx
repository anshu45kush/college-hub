import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormValidationProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  field: string;
}

export const FormError: React.FC<FormValidationProps> = ({ errors, touched, field }) => {
  if (!touched[field] || !errors[field]) return null;

  return (
    <div className="flex items-center mt-1 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 mr-1" />
      {errors[field]}
    </div>
  );
};

export const validateEmail = (email: string): string => {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return '';
};

export const validateRequired = (value: string, fieldName: string): string => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return '';
};

export const validateTime = (time: string): string => {
  if (!time) return 'Time is required';
  if (!/^\d{2}:\d{2}\s-\s\d{2}:\d{2}$/.test(time)) {
    return 'Time format should be HH:MM - HH:MM (e.g., 09:00 - 10:00)';
  }
  return '';
};

export const validateRollNumber = (rollNumber: string): string => {
  if (!rollNumber) return 'Roll number is required';
  if (!/^[A-Z]{2}\d{4}\d{3}$/.test(rollNumber)) {
    return 'Roll number format should be like CS2021001';
  }
  return '';
};

export const validateEmployeeId = (employeeId: string): string => {
  if (!employeeId) return 'Employee ID is required';
  if (!/^[A-Z]\d{3}$/.test(employeeId)) {
    return 'Employee ID format should be like T001';
  }
  return '';
};