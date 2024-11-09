import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const isAuthenticated = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminRequired && !isAdmin) {
    return <Navigate to="/admin-login" />;
  }

  return children;
};

export default ProtectedRoute;