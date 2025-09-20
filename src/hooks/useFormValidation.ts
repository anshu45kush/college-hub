import { useState, useCallback } from 'react';

interface ValidationRules {
  [key: string]: (value: any) => string;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  validateForm: () => boolean;
  resetForm: (initialValues?: T) => void;
  setFieldError: (field: keyof T, error: string) => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = useCallback((field: keyof T, value: any): string => {
    const rule = validationRules[field as string];
    return rule ? rule(value) : '';
  }, [validationRules]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  }, [values, validateField]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;
    const newTouched: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    
    let isFormValid = true;

    Object.keys(values).forEach(key => {
      const field = key as keyof T;
      newTouched[field] = true;
      const error = validateField(field, values[field]);
      newErrors[field] = error;
      if (error) isFormValid = false;
    });

    setTouched(newTouched);
    setErrors(newErrors);
    
    return isFormValid;
  }, [values, validateField]);

  const resetForm = useCallback((newInitialValues?: T) => {
    const resetValues = newInitialValues || initialValues;
    setValues(resetValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const isValid = Object.values(errors).every(error => !error) && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    setFieldError
  };
}