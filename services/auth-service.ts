/**
 * Auth Service
 * Handles authentication-related API calls and token management
 */

import { apiClient } from './api-client';
import type { User } from '@/store/useUserStore';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.data) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async signup(data: SignupRequest) {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    
    if (response.data) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return await apiClient.post('/auth/logout', {});
  }

  async getCurrentUser() {
    const response = await apiClient.get<User>('/auth/me');
    return response;
  }

  async refreshToken() {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {});
    
    if (response.data) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  getTokenFromStorage() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  getUserFromStorage() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getTokenFromStorage();
  }
}

export const authService = new AuthService();
export default AuthService;
