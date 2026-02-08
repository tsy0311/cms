import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Package, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTE_PATHS } from '@/lib/index';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={ROUTE_PATHS.ADMIN} className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">Admin Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to={ROUTE_PATHS.HOME}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                View Site
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

