
import { Tenant, TenantSettings } from '@/types/tenant';

// Mock tenant database - in production this would come from your backend
const mockTenants: Tenant[] = [
  {
    id: 'male-tenant',
    subdomain: 'male',
    name: 'Male Portal',
    logo: '👨‍💼',
    primaryColor: 'hsl(220, 100%, 50%)',
    secondaryColor: 'hsl(220, 50%, 80%)',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    settings: {
      allowRegistration: true,
      maxUsers: 100,
      recordingsEnabled: true,
      customBranding: true,
      allowGuestAccess: false
    }
  },
  {
    id: 'female-tenant',
    subdomain: 'female',
    name: 'Female Portal',
    logo: '👩‍💻',
    primaryColor: 'hsl(300, 100%, 50%)',
    secondaryColor: 'hsl(300, 50%, 80%)',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    settings: {
      allowRegistration: true,
      maxUsers: 100,
      recordingsEnabled: true,
      customBranding: true,
      allowGuestAccess: false
    }
  },
  {
    id: 'admin-tenant',
    subdomain: 'admin',
    name: 'Admin Portal',
    logo: '⚙️',
    primaryColor: 'hsl(0, 0%, 20%)',
    secondaryColor: 'hsl(0, 0%, 60%)',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    settings: {
      allowRegistration: false,
      maxUsers: 10,
      recordingsEnabled: true,
      customBranding: false,
      allowGuestAccess: false
    }
  }
];

class TenantService {
  private currentTenant: Tenant | null = null;

  detectTenantFromUrl(): string | null {
    const hostname = window.location.hostname;
    
    // For development (localhost), check for query parameter
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('tenant');
    }
    
    // For production, extract subdomain
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts[0]; // First part is the subdomain
    }
    
    // Default to admin if no subdomain
    return 'admin';
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const tenant = mockTenants.find(t => t.subdomain === subdomain && t.isActive);
    this.currentTenant = tenant || null;
    return this.currentTenant;
  }

  getCurrentTenant(): Tenant | null {
    return this.currentTenant;
  }

  async getAllTenants(): Promise<Tenant[]> {
    // Only available for admin tenant
    if (this.currentTenant?.subdomain !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return mockTenants;
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> {
    if (this.currentTenant?.subdomain !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Date.now()}`,
      createdAt: new Date()
    };

    mockTenants.push(newTenant);
    return newTenant;
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    if (this.currentTenant?.subdomain !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const index = mockTenants.findIndex(t => t.id === tenantId);
    if (index === -1) {
      throw new Error('Tenant not found');
    }

    mockTenants[index] = { ...mockTenants[index], ...updates };
    return mockTenants[index];
  }

  isAdminTenant(): boolean {
    return this.currentTenant?.subdomain === 'admin';
  }
}

export const tenantService = new TenantService();
