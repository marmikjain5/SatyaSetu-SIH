export type UserRole = 'admin' | 'inspector' | 'consumer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  avatar?: string;
  badgeNumber?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}
