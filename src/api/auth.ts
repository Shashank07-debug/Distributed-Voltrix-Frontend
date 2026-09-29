import { accountApi } from './client';
import { User } from '../store/useAuthStore';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupPayload {
  username: string; // Valid email
  name: string;     // 1-25 chars
  password: string; // Min 4 chars
}

export interface LoginPayload {
  username: string; // Email
  password: string; // 4-50 chars
}

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await accountApi.post<AuthResponse>('/auth/signup', payload);
    return response.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await accountApi.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },
};
