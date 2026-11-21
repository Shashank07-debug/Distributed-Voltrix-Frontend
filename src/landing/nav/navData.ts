import React from 'react';
import {
  Layers,
  GitBranch,
  Cpu,
  FileCode,
  BookOpen,
  GraduationCap,
  LayoutTemplate,
  History,
  Users,
  LifeBuoy,
  CreditCard,
  Receipt,
  Sparkles,
  Workflow as WorkflowIcon,
  HelpCircle,
  Code2,
} from 'lucide-react';

export interface NavItem {
  title: string;
  description: string;
  to?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  groupName?: string;
  items: NavItem[];
}

export interface NavMenu {
  id: string;
  label: string;
  groups: NavGroup[];
  widthClass?: string;
}

export const NAV_MENUS: NavMenu[] = [
  {
    id: 'product',
    label: 'Product',
    widthClass: 'w-[480px]',
    groups: [
      {
        items: [
          {
            title: 'Overview',
            description: 'What Voltrix builds and how it works',
            href: '#overview',
            icon: Sparkles,
          },
          {
            title: 'Workflow',
            description: 'From prompt to deployed app in four stages',
            href: '#workflow',
            icon: GitBranch,
          },
          {
            title: 'Features',
            description: 'Editor, preview, streaming, and teams',
            href: '#features',
            icon: Layers,
          },
          {
            title: 'Architecture',
            description: 'How the distributed platform is put together',
            href: '#architecture',
            icon: Cpu,
          },
        ],
      },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    widthClass: 'w-[520px]',
    groups: [
      {
        groupName: 'Learn',
        items: [
          {
            title: 'Blog',
            description: 'Technical essays on distributed code generation',
            href: '#resources',
            icon: BookOpen,
          },
          {
            title: 'Tutorials',
            description: 'Step-by-step guides for custom components',
            href: '#resources',
            icon: GraduationCap,
          },
          {
            title: 'Templates',
            description: 'Production starters for dashboards and full-stack apps',
            href: '#resources',
            icon: LayoutTemplate,
          },
        ],
      },
      {
        groupName: 'Community',
        items: [
          {
            title: 'Changelog',
            description: 'Weekly engine improvements and bug fixes',
            href: '#resources',
            icon: History,
          },
          {
            title: 'Community',
            description: 'Discuss architectures with other builders',
            href: '#resources',
            icon: Users,
          },
          {
            title: 'Support',
            description: 'Direct assistance from the core engineering team',
            href: '#resources',
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    widthClass: 'w-[420px]',
    groups: [
      {
        items: [
          {
            title: 'Plans',
            description: 'Compare what each tier includes for teams',
            to: '/billing',
            icon: CreditCard,
          },
          {
            title: 'Billing',
            description: 'Manage your subscription and compute units',
            to: '/billing',
            icon: Receipt,
          },
        ],
      },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    widthClass: 'w-[580px]',
    groups: [
      {
        groupName: 'Getting started',
        items: [
          {
            title: 'Quickstart',
            description: 'Generate your first full application in 60 seconds',
            href: '#overview',
            icon: Sparkles,
          },
          {
            title: 'Your first app',
            description: 'Prompt formulation and file inspection guide',
            href: '#workflow',
            icon: FileCode,
          },
        ],
      },
      {
        groupName: 'Concepts',
        items: [
          {
            title: 'Architecture',
            description: 'Kubernetes workers and MinIO artifact storage',
            href: '#architecture',
            icon: Cpu,
          },
          {
            title: 'Workflow',
            description: 'How generation pipeline streams to editor',
            href: '#workflow',
            icon: WorkflowIcon,
          },
        ],
      },
      {
        groupName: 'Reference',
        items: [
          {
            title: 'API Reference',
            description: 'REST and WebSocket telemetry specifications',
            href: '#architecture',
            icon: Code2,
          },
          {
            title: 'FAQ',
            description: 'Common technical questions and answers',
            href: '#overview',
            icon: HelpCircle,
          },
        ],
      },
    ],
  },
];
