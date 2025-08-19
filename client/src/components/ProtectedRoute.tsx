import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  // Pull stored role & authentication status from localStorage
  const storedRole = localStorage.getItem('role') as UserRole | null;
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!storedRole || !allowedRoles.includes(storedRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
