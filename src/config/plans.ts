export interface PlanDefinition {
  id: number;
  name: string;
  price: string;
  billingCycle: string;
  description: string;
  maxProjects: number | 'Unlimited';
  maxTokensPerDay: number;
  unlimitedAi: boolean;
  features: string[];
  isPopular?: boolean;
}

// TODO: Replace numeric plan placeholder IDs (Free=1, Pro=2, Business=3) with real production plan IDs once backend pricing tables are finalized.
export const PLANS: PlanDefinition[] = [
  {
    id: 1,
    name: 'Free',
    price: '$0',
    billingCycle: 'forever',
    description: 'For hobbyists exploring AI-powered rapid prototyping.',
    maxProjects: 3,
    maxTokensPerDay: 50000,
    unlimitedAi: false,
    features: [
      'Up to 3 active projects',
      '50,000 tokens / day AI generation',
      'Standard Vite preview container',
      'Community Discord support',
    ],
  },
  {
    id: 2,
    name: 'Pro',
    price: '$29',
    billingCycle: 'per month',
    description: 'For professional developers and fast-moving solo founders.',
    maxProjects: 25,
    maxTokensPerDay: 500000,
    unlimitedAi: false,
    isPopular: true,
    features: [
      'Up to 25 active projects',
      '500,000 tokens / day high-speed AI',
      'Instant cloud deployment & SSL',
      'Multi-role team collaboration (Editor/Viewer)',
      'Priority streaming latency',
    ],
  },
  {
    id: 3,
    name: 'Business',
    price: '$79',
    billingCycle: 'per month',
    description: 'For agencies and scaling dev teams needing unlimited AI execution.',
    maxProjects: 'Unlimited',
    maxTokensPerDay: 10000000,
    unlimitedAi: true,
    features: [
      'Unlimited active projects',
      'Unlimited AI token generation',
      'Custom domains & dedicated preview runners',
      'Role management (Owner, Editor, Viewer)',
      'Direct 1-on-1 engineering support',
    ],
  },
];
