export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'manager';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
