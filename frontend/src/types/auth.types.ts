// src/types/auth.types.ts
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MODERATOR = "MODERATOR",
  SELLER = "SELLER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  roles: UserRole[];
  verified: boolean;
  avatar?: string;
  lastLoginAt?: string;
  portfolioCount?: number;
}

export interface AuthTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthSession {
  deviceId: string;
  deviceType: string;
  rememberMe: boolean;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: (allDevices?: boolean) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}
