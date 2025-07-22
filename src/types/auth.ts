export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}