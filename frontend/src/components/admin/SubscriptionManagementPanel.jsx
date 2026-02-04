/**
 * Super Admin Subscription Management Panel
 * Allows super admins to view and manage organization subscriptions
 */
import React, { useState, useEffect } from 'react';
import { Crown, TrendingUp, Users, AlertTriangle } from '../icons/Icons';
import { message } from 'antd';
// import { subscriptionAPI } from '../../services/subscriptionService';
import { organizationsService } from '../../services/organizationsService';
// import SubscriptionModal from '../subscription/SubscriptionModal';

const SubscriptionManagementPanel = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await organizationsService.list();
      
      // Mock subscription status for each organization until subscription API is ready
      const orgsWithStatus = response.data.items.map((org) => ({
        ...org,
        subscriptionStatus: {
          subscription_tier: org.subscription_tier || 'free',
          plan_name: (org.subscription_tier || 'free').charAt(0).toUpperCase() + (org.subscription_tier || 'free').slice(1),
          current_usage: {
            employees: org.employees_count || 0,
            locations: org.locations_count || 0, 
            cameras: org.cameras_count || 0
          },
          usage_percentages: {
            employees: 0,
            locations: 0,
            cameras: 0
          }
        }
      }));
      
      setOrganizations(orgsWithStatus);
    } catch (error) {
      message.error('Failed to load organizations');
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeOrganization = (org) => {
    setSelectedOrg(org);
    setShowModal(true);
  };

  const getFilteredOrganizations = () => {
    switch (filter) {
      case 'free':
      case 'starter':
      case 'professional':
      case 'enterprise':
        return organizations.filter(org => 
          org.subscriptionStatus?.subscription_tier === filter
        );
      case 'near_limit':
        return organizations.filter(org => {
          const percentages = org.subscriptionStatus?.usage_percentages || {};
          return Object.values(percentages).some(p => p >= 80);
        });
      case 'over_limit':
        return organizations.filter(org => {
          const percentages = org.subscriptionStatus?.usage_percentages || {};
          return Object.values(percentages).some(p => p >= 100);
        });
      default:
        return organizations;
    }
  };

  const getPlanColor = (tier) => {
    const colors = {
      free: 'bg-teal-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-green-100 text-green-800',
      enterprise: 'bg-teal-100 text-teal-800'
    };
    return colors[tier] || 'bg-teal-100 text-gray-800';
  };

  const getUsageStatus = (percentages) => {
    const maxPercentage = Math.max(...Object.values(percentages));
    if (maxPercentage >= 100) return { status: 'over', color: 'text-red-600', icon: '🚨' };
    if (maxPercentage >= 80) return { status: 'near', color: 'text-yellow-600', icon: '⚠️' };
    return { status: 'normal', color: 'text-green-600', icon: '✅' };
  };

  const filteredOrganizations = getFilteredOrganizations();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Crown className="w-8 h-8 text-teal-600 mr-3" />
            Subscription Management
          </h1>
          <p className="text-gray-600 mt-1">Manage organization subscription plans and usage</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {['free', 'starter', 'professional', 'enterprise'].map((tier) => {
          const count = organizations.filter(org => 
            org.subscriptionStatus?.subscription_tier === tier
          ).length;
          
          return (
            <div key={tier} className="bg-teal-50/95 rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(tier)}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
              <p className="text-sm text-gray-600">Organizations</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-teal-50/95 rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Organizations' },
            { key: 'free', label: 'Free Plan' },
            { key: 'starter', label: 'Starter Plan' },
            { key: 'professional', label: 'Professional Plan' },
            { key: 'enterprise', label: 'Enterprise Plan' },
            { key: 'near_limit', label: 'Near Limit' },
            { key: 'over_limit', label: 'Over Limit' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-teal-50/95 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Organizations ({filteredOrganizations.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-teal-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrganizations.map((org) => {
                const status = org.subscriptionStatus || {};
                const usageStatus = getUsageStatus(status.usage_percentages || {});
                const usage = status.current_usage || {};
                
                return (
                  <tr key={org.id} className="hover:bg-teal-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        <div className="text-sm text-gray-500">{org.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        getPlanColor(status.subscription_tier)
                      }`}>
                        {status.plan_name || status.subscription_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center ${usageStatus.color}`}>
                        <span className="mr-2">{usageStatus.icon}</span>
                        <span className="text-sm font-medium">
                          {usageStatus.status === 'over' ? 'Over Limit' :
                           usageStatus.status === 'near' ? 'Near Limit' : 'Normal'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>Employees: {usage.employees || 0}</div>
                        <div>Locations: {usage.locations || 0}</div>
                        <div>Cameras: {usage.cameras || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleUpgradeOrganization(org)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Manage Plan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrganizations.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-500">No organizations found matching the selected filter.</p>
          </div>
        )}
      </div>

      {/* Subscription Modal - Temporarily disabled */}
      {/* {showModal && selectedOrg && (
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedOrg(null);
            fetchOrganizations(); // Refresh data after modal closes
          }}
          organizationId={selectedOrg.id}
          organizationName={selectedOrg.name}
        />
      )} */}
    </div>
  );
};

export default SubscriptionManagementPanel;
