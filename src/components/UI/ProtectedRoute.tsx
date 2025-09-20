import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../services/api';
import ErrorMessage from './ErrorMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback || (
      <ErrorMessage 
        message="You must be logged in to access this page" 
        className="m-6"
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return fallback || (
      <ErrorMessage 
        message={`Access denied. This page requires ${allowedRoles.join(' or ')} privileges.`}
        className="m-6"
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;