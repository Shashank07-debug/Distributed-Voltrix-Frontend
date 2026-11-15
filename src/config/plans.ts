/**
 * Display configuration for pricing cards.
 * 
 * NOTE: All limits (projects, tokens, previews) for the active plan come dynamically
 * from the GET /api/v1/account/api/me/subscription API contract.
 *
 * This configuration holds display-only metadata (descriptions, static features,
 * and display pricing matching Stripe checkout) to avoid hardcoding plan limits.
 */

export interface PricingCardDisplay {
  id: number;
  name: string; // Internal name / code: 'FREE' | 'PRO' | 'BUSINESS'
  displayName: string;
  priceMonthly: number;
  billingCycle: string;
  description: string;
  isPopular?: boolean;
  staticFeatures: string[];
}

export const PRICING_DISPLAY: PricingCardDisplay[] = [
  {
    // TODO: Ensure id: 1 matches the backend plan table ID for Free plan
    id: 1,
    name: 'FREE',
    displayName: 'Free',
    // TODO: Free tier monthly cost (0 INR) - must match backend plan table
    priceMonthly: 0,
    billingCycle: 'forever',
    description: 'For hobbyists exploring AI-powered rapid prototyping.',
    staticFeatures: [
      'Standard Vite preview container',
      'Community Discord support',
    ],
  },
  {
    // TODO: Ensure id: 2 matches the backend plan table ID for Pro plan
    id: 2,
    name: 'PRO',
    displayName: 'Pro',
    // TODO: Pro tier monthly cost (399 INR) - must match backend plan table & Stripe charge
    priceMonthly: 399,
    billingCycle: 'per month',
    description: 'For professional developers and fast-moving solo founders.',
    isPopular: true,
    staticFeatures: [
      'Instant cloud deployment & SSL',
      'Multi-role team collaboration (Editor/Viewer)',
      'Priority streaming latency',
    ],
  },
  {
    // TODO: Ensure id: 3 matches the backend plan table ID for Business plan
    id: 3,
    name: 'BUSINESS',
    displayName: 'Business',
    // TODO: Business tier monthly cost (699 INR) - must match backend plan table & Stripe charge
    priceMonthly: 699,
    billingCycle: 'per month',
    description: 'For agencies and scaling dev teams needing high-performance AI execution.',
    staticFeatures: [
      'Custom domains & dedicated preview runners',
      'Role management (Owner, Editor, Viewer)',
      'Direct 1-on-1 engineering support',
    ],
  },
];
