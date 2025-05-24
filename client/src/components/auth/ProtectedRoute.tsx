
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'model' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  // Simplified protected route for now
  return <>{children}</>;
};

export default ProtectedRoute;
