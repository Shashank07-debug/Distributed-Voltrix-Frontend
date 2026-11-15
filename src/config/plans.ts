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
  id: number | null;
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
    // Free tier has no payable database ID (not subscribed via Stripe checkout)
    id: null,
    name: 'FREE',
    displayName: 'Free',
    priceMonthly: 0,
    billingCycle: 'forever',
    description: 'For hobbyists exploring AI-powered rapid prototyping.',
    staticFeatures: [
      'Standard Vite preview container',
      'Community Discord support',
    ],
  },
  {
    // Matches backend database plan table ID for Pro plan (₹399 INR)
    id: 1,
    name: 'PRO',
    displayName: 'Pro',
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
    // Matches backend database plan table ID for Business plan (₹699 INR)
    id: 2,
    name: 'BUSINESS',
    displayName: 'Business',
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
