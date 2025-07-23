
import React, { createContext, useContext, useEffect, useState } from 'react';
import { tenantService } from '@/services/tenantService';
import { Tenant, TenantContext } from '@/types/tenant';

const TenantContextValue = createContext<TenantContext>({
  tenant: null,
  isLoading: true,
  error: null
});

export const useTenant = () => {
  const context = useContext(TenantContextValue);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantProvider = ({ children }: TenantProviderProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const detectedSubdomain = tenantService.detectTenantFromUrl();
        
        if (!detectedSubdomain) {
          setError('No tenant detected');
          return;
        }

        const foundTenant = await tenantService.getTenantBySubdomain(detectedSubdomain);
        
        if (!foundTenant) {
          setError(`Tenant "${detectedSubdomain}" not found or inactive`);
          return;
        }

        setTenant(foundTenant);
      } catch (err) {
        console.error('Error initializing tenant:', err);
        setError('Failed to load tenant configuration');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, []);

  return (
    <TenantContextValue.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContextValue.Provider>
  );
};
