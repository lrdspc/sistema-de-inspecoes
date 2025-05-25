import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useLoading } from '../../hooks/useLoading';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();
  const setLoading = useLoading((state) => state.setLoading);

  React.useEffect(() => {
    setLoading(auth.isLoading);
  }, [auth.isLoading, setLoading]);

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}