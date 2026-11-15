import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Check, Sparkles, AlertTriangle, ArrowUpRight, RotateCcw } from 'lucide-react';
import { billingApi, SubscriptionData } from '../../api/billing';
import { PRICING_DISPLAY, PricingCardDisplay } from '../../config/plans';
import { toast } from 'sonner';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const BillingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch current subscription - NEVER fall back to hardcoded data
  const {
    data: subData,
    isLoading,
    isError,
    refetch,
  } = useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: billingApi.getSubscription,
  });

  // Stripe Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (planId: number) => billingApi.createCheckout(planId),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to retrieve checkout URL.');
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { message?: string })?.message ||
        'Failed to initialize checkout session';
      toast.error(msg);
    },
  });

  // Stripe Billing Portal mutation
  const portalMutation = useMutation({
    mutationFn: billingApi.createPortal,
    onSuccess: (data) => {
      if (data?.portalUrl) {
        window.location.href = data.portalUrl;
      } else {
        toast.error('Failed to retrieve billing portal URL.');
      }
    },
    onError: (err: unknown) => {
      const msg =
        (err as { message?: string })?.message ||
        'Failed to open billing portal';
      toast.error(msg);
    },
  });

  // Handle Stripe redirect parameters ?success=true / ?canceled=true
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast.success('Subscription updated successfully! Welcome to your upgraded plan.');
      refetch();
      setSearchParams({}, { replace: true });
    } else if (canceled === 'true') {
      toast.info('Checkout session was canceled.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch]);

  const handleCheckout = (e: React.MouseEvent, card: PricingCardDisplay) => {
    e.stopPropagation();

    if (card.id == null) {
      toast.error('No checkout available for this plan.');
      return;
    }

    checkoutMutation.mutate(card.id);
  };

  // Current plan details from API only
  const currentPlan = subData?.plan;
  const isPlanActive = subData?.status === 'ACTIVE';

  const usedTokens = subData?.tokenUsedThisCycle ?? 0;
  const maxTokens = currentPlan?.maxTokensPerDay;
  const isUnlimitedAi = currentPlan?.unlimitedAi ?? false;

  const usagePercentage =
    isUnlimitedAi || !maxTokens || maxTokens <= 0
      ? 0
      : Math.min(100, Math.round((usedTokens / maxTokens) * 100));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#070709] px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-voltrix-violet/10 border border-voltrix-violet/30 text-voltrix-cyan text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous AI Execution Quotas
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Flexible Plans for High-Voltage Developers
          </h1>
          <p className="text-xs sm:text-sm text-voltrix-muted">
            Scale your AI generation tokens, team workspace seats, and cloud deployment pipelines effortlessly.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-12">
            <div className="p-8 rounded-3xl glass-panel border border-voltrix-border animate-pulse h-48 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-white/10 rounded w-1/4" />
                <div className="h-4 bg-white/5 rounded w-1/6" />
              </div>
              <div className="h-4 bg-white/10 rounded w-1/3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl p-8 glass-panel border border-voltrix-border animate-pulse h-96 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-6 bg-white/10 rounded w-1/3" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-10 bg-white/10 rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-white/10 rounded-xl w-full" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State with Retry Button - NEVER fallback to Free on failure */}
        {!isLoading && (isError || !currentPlan) && (
          <div className="mb-12 p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center max-w-xl mx-auto">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-white mb-2">
              Failed to load subscription details
            </h2>
            <p className="text-xs text-rose-300 mb-6">
              Could not retrieve your current plan information from the server.
            </p>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        )}

        {/* Current Active Plan Status Banner */}
        {!isLoading && !isError && currentPlan && (
          <div className="mb-12 p-6 sm:p-8 rounded-3xl glass-panel border border-voltrix-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-voltrix-violet/10 blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-display text-xl font-bold text-white">
                    Current Plan: <span className="text-voltrix-cyan">{currentPlan.name}</span>
                  </h2>
                  {isPlanActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                  {subData?.status && !isPlanActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {subData.status}
                    </span>
                  )}
                </div>
                <p className="text-xs text-voltrix-muted">
                  Period End:{' '}
                  {subData?.periodEnd
                    ? new Date(subData.periodEnd).toLocaleDateString()
                    : 'N/A'}
                </p>
                {currentPlan.maxProjects != null && (
                  <p className="text-xs text-voltrix-muted mt-1 font-mono">
                    Project Allowance: <span className="text-white font-semibold">{currentPlan.maxProjects}</span> active projects
                  </p>
                )}
              </div>

              {/* Token Usage Progress Bar or Unlimited Badge */}
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-300">Daily Token Usage</span>
                  {isUnlimitedAi ? (
                    <span className="text-voltrix-cyan font-bold">UNLIMITED AI</span>
                  ) : maxTokens != null ? (
                    <span className="text-voltrix-violet-light">
                      {usedTokens.toLocaleString()} / {maxTokens.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-voltrix-violet-light">
                      {usedTokens.toLocaleString()} tokens used
                    </span>
                  )}
                </div>

                {!isUnlimitedAi && maxTokens != null && (
                  <div className="w-full h-2 rounded-full bg-voltrix-card border border-white/10 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        usagePercentage > 90
                          ? 'bg-rose-500'
                          : 'bg-gradient-to-r from-voltrix-violet to-voltrix-cyan'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                )}

                <button
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="mt-2 text-xs font-semibold text-voltrix-cyan hover:underline inline-flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Manage Billing Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards Grid */}
        {!isLoading && !isError && currentPlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING_DISPLAY.map((card: PricingCardDisplay) => {
              // Current plan check based on API plan id or normalized name
              const isCurrent = Boolean(
                (currentPlan.id != null && card.id != null && currentPlan.id === card.id) ||
                (currentPlan.name && (
                  currentPlan.name.toUpperCase() === card.name.toUpperCase() ||
                  currentPlan.name.toUpperCase().includes(card.name.toUpperCase()) ||
                  (card.name === 'BUSINESS' && currentPlan.name.toUpperCase().includes('BUISNESS'))
                ))
              );

              // Build feature bullets:
              // For the CURRENT plan, generate bullets with real numbers from API data
              // For other plans, only display static features (no hardcoded limits/claims)
              const dynamicBullets: string[] = [];
              if (isCurrent) {
                if (currentPlan.maxProjects != null) {
                  dynamicBullets.push(`Up to ${currentPlan.maxProjects} active projects`);
                }
                if (currentPlan.unlimitedAi) {
                  dynamicBullets.push('Unlimited AI token generation');
                } else if (currentPlan.maxTokensPerDay != null) {
                  dynamicBullets.push(`${currentPlan.maxTokensPerDay.toLocaleString()} tokens / day AI generation`);
                }
              }

              const allFeatures = [...dynamicBullets, ...card.staticFeatures];

              return (
                <div
                  key={card.name}
                  className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                    card.isPopular
                      ? 'bg-gradient-to-b from-[#141622] to-[#0D0E15] border-2 border-voltrix-violet shadow-[0_0_40px_rgba(139,92,246,0.2)] scale-105'
                      : 'glass-panel border border-voltrix-border hover:border-white/20'
                  }`}
                >
                  {card.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h3 className="font-display text-xl font-bold text-white mb-2">{card.displayName}</h3>
                    <p className="text-xs text-voltrix-muted mb-6 leading-relaxed">{card.description}</p>

                    <div className="mb-6">
                      <span className="font-display text-4xl font-bold text-white">
                        {currencyFormatter.format(card.priceMonthly)}
                      </span>
                      <span className="text-xs text-voltrix-muted ml-1 font-mono">/ {card.billingCycle}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {allFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                          <Check className="w-4 h-4 text-voltrix-cyan shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCheckout(e, card)}
                    disabled={isCurrent || checkoutMutation.isPending || card.id == null}
                    className={`w-full py-3 rounded-xl text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-white/10 text-gray-400 cursor-default'
                        : card.isPopular
                        ? 'bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white shadow-lg hover:opacity-90 disabled:opacity-50'
                        : 'bg-voltrix-card hover:bg-voltrix-card-hover text-white border border-voltrix-border hover:border-voltrix-cyan disabled:opacity-50'
                    }`}
                  >
                    {isCurrent
                      ? 'Current Plan'
                      : checkoutMutation.isPending && checkoutMutation.variables === card.id
                      ? 'Preparing Checkout...'
                      : `Upgrade to ${card.displayName}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
