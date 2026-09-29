import { accountApi } from './client';

export interface PlanInfo {
  id: number;
  name: string;
  maxProjects: number | string;
  maxTokensPerDay: number;
  unlimitedAi: boolean;
  price?: number | string;
}

export interface SubscriptionData {
  plan: PlanInfo;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';
  periodEnd: string;
  tokenUsedThisCycle: number;
}

export interface CheckoutResponse {
  url: string;
}

export interface PortalResponse {
  portalUrl: string;
}

export const billingApi = {
  getSubscription: async (): Promise<SubscriptionData> => {
    const response = await accountApi.get<SubscriptionData>('/api/me/subscription');
    return response.data;
  },

  createCheckout: async (planId: number): Promise<CheckoutResponse> => {
    const response = await accountApi.post<CheckoutResponse>('/api/payments/checkout', { planId });
    return response.data;
  },

  createPortal: async (): Promise<PortalResponse> => {
    const response = await accountApi.post<PortalResponse>('/api/payments/portal');
    return response.data;
  },
};
