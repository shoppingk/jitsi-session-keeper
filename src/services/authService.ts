
import { User, LoginCredentials, AuthState } from '@/types/auth';
import { tenantService } from '@/services/tenantService';

// Mock user database - now organized by tenant
const mockUsersByTenant: Record<string, Array<User & { password: string }>> = {
  'male': [
    {
      id: 'male-admin-1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      avatar: '👨‍💼'
    },
    {
      id: 'male-user-1',
      username: 'john',
      password: 'user123',
      role: 'user',
      avatar: '👤'
    },
    {
      id: 'male-user-2',
      username: 'mike',
      password: 'user123',
      role: 'user',
      avatar: '👨‍💻'
    }
  ],
  'female': [
    {
      id: 'female-admin-1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      avatar: '👩‍💼'
    },
    {
      id: 'female-user-1',
      username: 'sarah',
      password: 'user123',
      role: 'user',
      avatar: '👩'
    },
    {
      id: 'female-user-2',
      username: 'jane',
      password: 'user123',
      role: 'user',
      avatar: '👩‍💻'
    }
  ],
  'admin': [
    {
      id: 'super-admin-1',
      username: 'superadmin',
      password: 'super123',
      role: 'admin',
      avatar: '🔧'
    }
  ]
};

// Simple token generation for browser compatibility
function generateToken(user: User, tenantId: string): string {
  const tokenData = {
    userId: user.id,
    username: user.username,
    role: user.role,
    tenantId,
    timestamp: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(tokenData));
}

function verifyToken(token: string): boolean {
  try {
    const tokenData = JSON.parse(atob(token));
    return tokenData.expiresAt > Date.now();
  } catch {
    return false;
  }
}

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  constructor() {
    this.loadFromStorage();
  }

  private getStorageKey(): string {
    const tenant = tenantService.getCurrentTenant();
    return `video-conf-auth-${tenant?.id || 'default'}`;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        const parsedState = JSON.parse(stored);
        if (parsedState.token && this.verifyToken(parsedState.token)) {
          this.state = parsedState;
        } else {
          this.clearStorage();
        }
      }
    } catch (error) {
      this.clearStorage();
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
  }

  private clearStorage() {
    localStorage.removeItem(this.getStorageKey());
    this.state = { isAuthenticated: false, user: null, token: null };
  }

  private verifyToken(token: string): boolean {
    return verifyToken(token);
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    const currentTenant = tenantService.getCurrentTenant();
    
    if (!currentTenant) {
      return { success: false, error: 'No tenant context available' };
    }

    const tenantUsers = mockUsersByTenant[currentTenant.subdomain] || [];
    const user = tenantUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const { password, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword, currentTenant.id);

    this.state = {
      isAuthenticated: true,
      user: userWithoutPassword,
      token
    };

    this.saveToStorage();
    return { success: true };
  }

  logout() {
    this.clearStorage();
  }

  getState(): AuthState {
    return { ...this.state };
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  isAdmin(): boolean {
    return this.state.user?.role === 'admin';
  }

  isSuperAdmin(): boolean {
    const currentTenant = tenantService.getCurrentTenant();
    return this.state.user?.role === 'admin' && currentTenant?.subdomain === 'admin';
  }

  getToken(): string | null {
    return this.state.token;
  }

  getTenantUsers(): Array<User & { password: string }> {
    const currentTenant = tenantService.getCurrentTenant();
    if (!currentTenant || !this.isAdmin()) {
      return [];
    }
    return mockUsersByTenant[currentTenant.subdomain] || [];
  }
}

export const authService = new AuthService();
