import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { VITE_API_BASE_URL, ACCOUNT_PREFIX, WORKSPACE_PREFIX, INTELLIGENCE_PREFIX } from './config';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const createServiceClient = (prefix: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${VITE_API_BASE_URL}${prefix}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url || '';
      const isPublicAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup');
      if (!isPublicAuthEndpoint) {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => {
      // 204 No Content has no body by HTTP specification
      if (response.status === 204) {
        return response;
      }

      const contentType = String(response.headers['content-type'] || '');
      const isJsonResponse = contentType.includes('application/json');
      const isTextRequest = response.config.responseType === 'text';

      // Check empty body only when JSON is expected
      if (isJsonResponse && !isTextRequest) {
        if (response.data === null || response.data === undefined || response.data === '') {
          return Promise.reject(
            new ApiError(response.status, 'Unexpected empty response')
          );
        }
      }

      return response;
    },
    (error) => {
      if (error instanceof ApiError) {
        return Promise.reject(error);
      }

      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          'An unexpected error occurred';
        const code = error.response.data?.code;

        if (status === 401) {
          useAuthStore.getState().logout();
          toast.error('Session expired. Please log in again.');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
          return Promise.reject(new ApiError(401, 'Session expired. Please log in again.', code));
        }

        if (status === 429) {
          toast.error('Token limit exceeded or rate limited. Upgrade your plan on Billing to continue.', {
            action: {
              label: 'Upgrade Plan',
              onClick: () => {
                window.location.href = '/billing';
              },
            },
          });
        }

        return Promise.reject(new ApiError(status, message, code));
      }

      if (error.request) {
        return Promise.reject(
          new ApiError(0, 'Network Error: Unable to reach the Voltrix Gateway server.')
        );
      }

      return Promise.reject(
        new ApiError(0, error.message || 'An unexpected error occurred')
      );
    }
  );

  return instance;
};

export const accountApi = createServiceClient(ACCOUNT_PREFIX);
export const workspaceApi = createServiceClient(WORKSPACE_PREFIX);
export const intelligenceApi = createServiceClient(INTELLIGENCE_PREFIX);
