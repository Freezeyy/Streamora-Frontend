import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../../utils/auth';

const GuestRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/feed" replace />;
  }

  return children;
};

export default GuestRoute;
