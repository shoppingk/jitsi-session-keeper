import jwt from 'jsonwebtoken';
import { User, LoginCredentials, AuthState } from '@/types/auth';

const JWT_SECRET = 'video-conference-secret-key';
const STORAGE_KEY = 'video-conf-auth';

// Mock user database
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    avatar: '👨‍💼'
  },
  {
    id: '2',
    username: 'user1',
    password: 'user123',
    role: 'user',
    avatar: '👤'
  },
  {
    id: '3',
    username: 'user2',
    password: 'user123',
    role: 'user',
    avatar: '👩‍💻'
  }
];

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        if (this.verifyToken(parsedState.token)) {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  private clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = { isAuthenticated: false, user: null, token: null };
  }

  private verifyToken(token: string): boolean {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    const user = mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password, ...userWithoutPassword } = user;

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

  getToken(): string | null {
    return this.state.token;
  }
}

export const authService = new AuthService();