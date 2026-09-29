import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Zap, CreditCard, Check, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { billingApi, SubscriptionData } from '../../api/billing';
import { PLANS, PlanDefinition } from '../../config/plans';
import { toast } from 'sonner';

export const BillingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Fetch current subscription
  const { data: subData, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ['subscription'],
    queryFn: billingApi.getSubscription,
  });

  // Stripe Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (planId: number) => billingApi.createCheckout(planId),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to initialize checkout';
      toast.error(msg);
    },
  });

  // Stripe Billing Portal mutation
  const portalMutation = useMutation({
    mutationFn: billingApi.createPortal,
    onSuccess: (data) => {
      if (data?.portalUrl) {
        window.location.href = data.portalUrl;
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to open billing portal';
      toast.error(msg);
    },
  });

  // Handle Stripe return query parameters ?success=true / ?canceled=true
  // TODO: Confirm exact Stripe redirect return paths and parameter names with backend owner.
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

  const currentPlanId = subData?.plan?.id || 1;
  const maxTokens = subData?.plan?.maxTokensPerDay || 50000;
  const usedTokens = subData?.tokenUsedThisCycle || 0;
  const isUnlimited = subData?.plan?.unlimitedAi ?? false;
  const usagePercentage = isUnlimited ? 0 : Math.min(100, Math.round((usedTokens / maxTokens) * 100));

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

        {/* Current Active Plan Status Banner */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl glass-panel border border-voltrix-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-voltrix-violet/10 blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="font-display text-xl font-bold text-white">
                  Current Plan: <span className="text-voltrix-cyan">{subData?.plan?.name || 'Free Tier'}</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {subData?.status || 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-voltrix-muted">
                Period End:{' '}
                {subData?.periodEnd
                  ? new Date(subData.periodEnd).toLocaleDateString()
                  : 'Renews Daily'}
              </p>
            </div>

            {/* Token Usage Progress Bar or Unlimited Badge */}
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-300">Daily Token Usage</span>
                {isUnlimited ? (
                  <span className="text-voltrix-cyan font-bold">UNLIMITED AI</span>
                ) : (
                  <span className="text-voltrix-violet-light">
                    {usedTokens.toLocaleString()} / {maxTokens.toLocaleString()}
                  </span>
                )}
              </div>

              {!isUnlimited && (
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan: PlanDefinition) => {
            const isCurrent = currentPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-[#141622] to-[#0D0E15] border-2 border-voltrix-violet shadow-[0_0_40px_rgba(139,92,246,0.2)] scale-105'
                    : 'glass-panel border border-voltrix-border hover:border-white/20'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-display text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-voltrix-muted mb-6 leading-relaxed">{plan.description}</p>

                  <div className="mb-6">
                    <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-xs text-voltrix-muted ml-1 font-mono">/ {plan.billingCycle}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <Check className="w-4 h-4 text-voltrix-cyan shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => checkoutMutation.mutate(plan.id)}
                  disabled={isCurrent || checkoutMutation.isPending}
                  className={`w-full py-3 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-gray-400 cursor-default'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-voltrix-violet to-voltrix-cyan text-white shadow-lg hover:opacity-90'
                      : 'bg-voltrix-card hover:bg-voltrix-card-hover text-white border border-voltrix-border hover:border-voltrix-cyan'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
