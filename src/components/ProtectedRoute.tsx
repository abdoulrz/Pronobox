import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();
  useEffect(() => {
    console.log("ProtectedRoute - Vérification d'authentification:", {
      isAuthenticated,
      isAdmin,
      requireAdmin,
      user,
      path: location.pathname
    });
  }, [isAuthenticated, isAdmin, requireAdmin, user, location]);
  if (!isAuthenticated) {
    console.log('Redirection vers /auth - Non authentifié');
    return <Navigate to="/auth" replace />;
  }
  if (requireAdmin && !isAdmin) {
    console.log('Redirection vers / - Non admin');
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
export default ProtectedRoute;