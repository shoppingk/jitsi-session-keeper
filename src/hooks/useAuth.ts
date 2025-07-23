
import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { AuthState, LoginCredentials } from '@/types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());

  useEffect(() => {
    // Listen for auth state changes
    const interval = setInterval(() => {
      const newState = authService.getState();
      if (JSON.stringify(newState) !== JSON.stringify(authState)) {
        setAuthState(newState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [authState]);

  const login = async (credentials: LoginCredentials) => {
    const result = await authService.login(credentials);
    if (result.success) {
      setAuthState(authService.getState());
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setAuthState(authService.getState());
  };

  return {
    ...authState,
    login,
    logout,
    isAdmin: authService.isAdmin(),
    isSuperAdmin: authService.isSuperAdmin(),
    getCurrentUser: authService.getCurrentUser,
    getTenantUsers: authService.getTenantUsers
  };
};
