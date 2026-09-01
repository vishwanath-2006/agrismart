import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole
}) => {
  const { currentRole, isAuthLoading, isProfileLoading, supabaseUser } = useApp();

  // 1. Loading state during auth and profile hydration (prevents race conditions)
  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 gap-3 text-center">
        <span className="w-9 h-9 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-[13px] font-medium text-on-surface-variant">Loading AgriSmart...</span>
      </div>
    );
  }

  // 2. Unauthenticated user -> redirect to login
  if (!supabaseUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. User has no role selected -> redirect to role selection
  if (!currentRole) {
    return <Navigate to="/select-role" replace />;
  }

  // 4. Role mismatch -> redirect user to their own role domain
  if (allowedRole && currentRole !== allowedRole) {
    if (currentRole === 'farmer') {
      return <Navigate to="/farmer/dashboard" replace />;
    }
    if (currentRole === 'buyer') {
      return <Navigate to="/buyer/marketplace" replace />;
    }
    if (currentRole === 'transporter') {
      return <Navigate to="/transporter/dashboard" replace />;
    }
    return <Navigate to="/select-role" replace />;
  }

  // 5. Authorized for this role area -> Render component
  return <>{children}</>;
};
