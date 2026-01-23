/**
 * Subscription Modal Component
 * Shows subscription plans, current usage, and upgrade options
 */
import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Zap, Rocket } from '../icons/Icons';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';
import { subscriptionAPI } from '../../services/subscriptionService';

const SubscriptionModal = ({ isOpen, onClose, initialTab = 'plans' }) => {
  const { subscriptionStatus, availablePlans: contextPlans, getCurrentPlan, getUpgradeOptions, fetchSubscriptionStatus } = useSubscription();
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  
  const isSuperAdmin = hasRole('super_admin');

  // Use context plans if available, otherwise use mock data
  const mockPlans = [
    {
      tier: 'free',
      name: 'Free',
      description: 'Basic visitor registration',
      price: 0,
      features: ['visitor_management'],
      limits: { visitors_per_month: 25, locations: 1, employees: 10 },
      ui_display: { highlight: false }
    },
    {
      tier: 'starter', 
      name: 'Starter',
      description: 'Small business visitor management',
      price: 29,
      features: ['visitor_management', 'visitor_analytics'],
      limits: { visitors_per_month: 500, locations: 3, employees: 50 },
      ui_display: { highlight: false }
    },
    {
      tier: 'professional',
      name: 'Professional', 
      description: 'Complete workforce management',
      price: 99,
      features: ['visitor_management', 'visitor_analytics', 'employee_management'],
      limits: { visitors_per_month: -1, locations: 10, employees: 200 },
      ui_display: { highlight: true }
    }
  ];

  // Use context data or fallback to mock data
  const availablePlans = contextPlans?.length > 0 ? contextPlans : mockPlans;
  const currentPlan = subscriptionStatus?.current_plan || 'free';

  const handleUpgrade = async (newTier) => {
    if (!isSuperAdmin) {
      message.error('Only super admins can upgrade subscriptions');
      return;
    }

    try {
      setLoading(true);
      if (subscriptionAPI && fetchSubscriptionStatus) {
        await subscriptionAPI.upgradeOrganization(subscriptionStatus?.organization_id, newTier);
        await fetchSubscriptionStatus();
      }
      message.success(`Successfully upgraded to ${newTier} plan`);
      onClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to upgrade subscription');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (tier) => {
    const icons = {
      free: '📦',
      starter: <Zap className="w-6 h-6" />,
      professional: <Crown className="w-6 h-6" />,
      enterprise: <Rocket className="w-6 h-6" />
    };
    return icons[tier] || '📦';
  };

  // Mock data for testing when context is not available
  const currentPlanData = getCurrentPlan ? getCurrentPlan() : availablePlans.find(p => p.tier === currentPlan) || availablePlans[0];
  const upgradeOptions = getUpgradeOptions ? getUpgradeOptions() : availablePlans.filter(p => p.tier !== currentPlan);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const formatLimit = (limit) => {
    return limit === -1 ? 'Unlimited' : limit.toLocaleString();
  };

  const renderUsageItem = (key, label, current, limit, percentage) => {
    const isOverLimit = percentage >= 100;
    const isNearLimit = percentage >= 80;
    
    return (
      <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-900">{label}</span>
          <span className={`text-sm font-semibold ${
            isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {current} / {formatLimit(limit)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        {isOverLimit && (
          <p className="text-xs text-red-600 mt-1">Limit exceeded - upgrade required</p>
        )}
        {isNearLimit && !isOverLimit && (
          <p className="text-xs text-yellow-600 mt-1">Approaching limit</p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
            {currentPlan && (
              <p className="text-gray-600">Current Plan: <span className="font-semibold text-indigo-600">{currentPlan.name}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            Plans & Pricing
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'usage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('usage')}
          >
            Current Usage
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'plans' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                {availablePlans.map((plan) => {
                  const isCurrentPlan = currentPlan?.tier === plan.tier;
                  const canUpgrade = upgradeOptions.some(opt => opt.tier === plan.tier);
                  
                  return (
                    <div
                      key={plan.tier}
                      className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                        isCurrentPlan ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                      } ${plan.ui_display?.highlight ? 'ring-2 ring-indigo-200' : ''}`}
                    >
                      {plan.ui_display?.highlight && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      {isCurrentPlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Current Plan
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="text-4xl mb-2">
                          {typeof getPlanIcon(plan.tier) === 'string' ? (
                            getPlanIcon(plan.tier)
                          ) : (
                            <div className="flex justify-center text-indigo-600">
                              {getPlanIcon(plan.tier)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                        <div className="text-3xl font-bold text-gray-900">
                          ${plan.price}
                          <span className="text-lg text-gray-600 font-normal">/month</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                        <ul className="space-y-2">
                          {plan.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-center text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{plan.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Limits */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Limits:</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>Visitors: {formatLimit(plan.limits.visitors_per_month)}/month</div>
                          <div>Locations: {formatLimit(plan.limits.locations)}</div>
                          <div>Employees: {formatLimit(plan.limits.employees)}</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isCurrentPlan ? (
                        <button disabled className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold">
                          Current Plan
                        </button>
                      ) : canUpgrade && isSuperAdmin ? (
                        <button
                          onClick={() => handleUpgrade(plan.tier)}
                          disabled={loading}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Upgrading...' : 'Upgrade'}
                        </button>
                      ) : (
                        <button disabled className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-semibold">
                          {!isSuperAdmin ? 'Admin Only' : 'Contact Sales'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isSuperAdmin && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Only super administrators can upgrade subscription plans. Contact your system administrator for plan changes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subscriptionStatus ? (
                    Object.entries(subscriptionStatus.limits || {}).map(([key, limit]) => {
                      const current = subscriptionStatus.current_usage?.[key] || 0;
                      const percentage = subscriptionStatus.usage_percentages?.[key] || 0;
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                      
                      return renderUsageItem(key, label, current, limit, percentage);
                    })
                  ) : (
                    <div className="col-span-3 text-center text-gray-500">
                      <p>Usage data not available. Please log in to view your subscription usage.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade Recommendation */}
              {subscriptionStatus?.usage_percentages && 
               Object.values(subscriptionStatus.usage_percentages).some(p => p >= 80) && (
                <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Crown className="w-6 h-6 text-indigo-600 mr-3" />
                    <h4 className="text-lg font-semibold text-indigo-900">Consider Upgrading Your Plan</h4>
                  </div>
                  <p className="text-indigo-700 mb-4">
                    You're approaching or have exceeded some of your plan limits. Upgrading your plan will give you more resources and access to additional features.
                  </p>
                  {upgradeOptions.length > 0 && (
                    <button
                      onClick={() => setActiveTab('plans')}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      View Upgrade Options
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;