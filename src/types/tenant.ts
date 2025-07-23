
export interface Tenant {
  id: string;
  subdomain: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive: boolean;
  createdAt: Date;
  settings: TenantSettings;
}

export interface TenantSettings {
  allowRegistration: boolean;
  maxUsers: number;
  recordingsEnabled: boolean;
  customBranding: boolean;
  allowGuestAccess: boolean;
}

export interface TenantContext {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}
