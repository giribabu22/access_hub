/**
 * Feature Access Control Component
 * Wraps components/features that require subscription access
 */
import React from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { Crown, Lock, ArrowRight } from '../icons/Icons';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgradePrompt = true,
  limitKey = null,
  onUpgradeClick = null 
}) => {
  const { hasFeature, isLimitExceeded, getCurrentPlan, getUpgradeOptions } = useSubscription();
  
  // Get current subscription data with fallbacks
  const currentPlan = getCurrentPlan ? getCurrentPlan() : { name: 'Free' };
  const upgradeOptions = getUpgradeOptions ? getUpgradeOptions() : [];
  
  // Check access with fallback to always allow when subscription context is not available
  const hasAccess = hasFeature ? hasFeature(feature) : true;
  const isOverLimit = limitKey && isLimitExceeded ? isLimitExceeded(limitKey) : false;
  
  // Create limitation message
  const limitationMessage = {
    message: isOverLimit 
      ? `You've reached the limit for ${limitKey?.replace(/_/g, ' ')}` 
      : `This feature requires a ${upgradeOptions[0]?.name || 'premium'} plan or higher`
  };
  
  // If user has feature access and is not over limit, render children
  if (hasAccess && !isOverLimit) {
    return children;
  }

  // If fallback is provided and no upgrade prompt needed, return fallback
  if (fallback && !showUpgradePrompt) {
    return fallback;
  }

  // Render upgrade prompt
  return (
    <div className="relative">
      {/* Disabled content overlay */}
      {children && (
        <div className="relative">
          <div className="opacity-30 pointer-events-none">
            {children}
          </div>
          <div className="absolute inset-0 bg-gray-50 bg-opacity-80 flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {isOverLimit ? 'Usage Limit Reached' : 'Feature Not Available'}
              </h3>
              <p className="text-gray-600 mb-4">
                {limitationMessage?.message || 
                 `This feature is not included in your ${currentPlan?.name || 'current'} plan`}
              </p>
              {onUpgradeClick && upgradeOptions.length > 0 && (
                <button
                  onClick={onUpgradeClick}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alternative upgrade prompt without content */}
      {!children && showUpgradePrompt && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-xl p-8 text-center">
          <div className="mb-4">
            <Crown className="w-16 h-16 text-indigo-400 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {isOverLimit ? 'Usage Limit Reached' : 'Premium Feature'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {limitationMessage?.message || 
             `Unlock this feature by upgrading from your ${currentPlan?.name || 'current'} plan`}
          </p>
          {onUpgradeClick && upgradeOptions.length > 0 && (
            <button
              onClick={onUpgradeClick}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 shadow-lg inline-flex items-center"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      )}

      {/* Fallback content */}
      {fallback && !showUpgradePrompt && fallback}
    </div>
  );
};

export default FeatureGate;