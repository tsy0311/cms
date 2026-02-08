import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTE_PATHS } from '@/lib/index';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

