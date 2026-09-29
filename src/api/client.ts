import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { VITE_API_BASE_URL, ACCOUNT_PREFIX, WORKSPACE_PREFIX, INTELLIGENCE_PREFIX } from './config';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'sonner';

/**
 * Helper to create an Axios instance configured for a specific Gateway service prefix.
 */
const createServiceClient = (prefix: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${VITE_API_BASE_URL}${prefix}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor: Attach Authorization Bearer token unless auth endpoint
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

  // Response Interceptor: Handle 401, 403, 404, 429 errors globally
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || 'An unexpected error occurred';

        if (status === 401) {
          // Clear authentication state and redirect to login
          useAuthStore.getState().logout();
          toast.error('Session expired. Please log in again.');
          if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            window.location.href = '/login';
          }
        } else if (status === 403) {
          toast.error('Access Denied: You do not have permission to perform this action.');
        } else if (status === 404) {
          toast.error(`Resource Not Found: ${message}`);
        } else if (status === 429) {
          toast.error('Token limit exceeded or rate limited. Upgrade your plan on Billing to continue.', {
            action: {
              label: 'Upgrade Plan',
              onClick: () => {
                window.location.href = '/billing';
              },
            },
          });
        }
      } else if (error.request) {
        toast.error('Network Error: Unable to reach the Voltrix Gateway server.');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const accountApi = createServiceClient(ACCOUNT_PREFIX);
export const workspaceApi = createServiceClient(WORKSPACE_PREFIX);
export const intelligenceApi = createServiceClient(INTELLIGENCE_PREFIX);
