import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { organizationsService } from '../../services/organizationsService';
import OrganizationInfo from './tabs/OrganizationInfo';
import OrganizationEmployees from './tabs/OrganizationEmployees';
import OrganizationCameras from './tabs/OrganizationCameras';
import OrganizationLocations from './tabs/OrganizationLocations';
import OrganizationRules from './tabs/OrganizationRules';
import OrganizationDepartments from './tabs/OrganizationDepartments';
import OrganizationShifts from './tabs/OrganizationShifts';
import OrganizationAlerts from './tabs/OrganizationAlerts';
import OrganizationStatistics from './tabs/OrganizationStatistics';

import OrganizationVisitors from './tabs/OrganizationVisitors';
import OrganizationLPR from './tabs/OrganizationLPR';
import SubscriptionModal from '../subscription/SubscriptionModal';
import FeatureGate from '../subscription/FeatureGate';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAuth } from '../../contexts/AuthContext';

const OrganizationDetail = ({
  backPath = '/super-admin/organizations',
  dashboardPath = '/super-admin/dashboard'
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { hasFeature, subscriptionStatus } = useSubscription();
  const { user } = useAuth();

  // Verify user has access to this organization
  useEffect(() => {
    if (user && user.organization_id && user.organization_id !== id) {
      message.error('Access denied. You can only view your own organization.');
      navigate(dashboardPath);
    }
  }, [user, id, navigate, dashboardPath]);

  // Get active tab from URL or default to 'info'
  const activeTab = searchParams.get('tab') || 'info';

  // Function to update tab in URL
  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Get enabled features for this organization
  const getEnabledFeatures = () => {
    const defaults = {
      visitor_management: hasFeature('visitor_management'),
      employee_attendance: true,
      advanced_analytics: hasFeature('advanced_analytics'),
      camera_integration: hasFeature('camera_integration'),
      multi_location: hasFeature('multi_location'),
      api_access: hasFeature('api_access'),
      mobile_app: hasFeature('mobile_app'),
      custom_branding: hasFeature('custom_branding'),
      lpr_integration: true // Default to true for dev/testing if not explicitly disabled
    };

    if (organization?.enabled_features) {
      // Merge defaults with organization specific overrides
      // This ensures new features (like lpr) appear even if not yet in DB record
      return {
        ...defaults,
        ...organization.enabled_features,
        // Ensure LPR is visible if the key is missing in DB but intended for this update
        lpr_integration: organization.enabled_features.lpr_integration ?? true
      };
    }

    return defaults;
  };

  const enabledFeatures = getEnabledFeatures();

  // Define available tabs based on enabled features
  const getAvailableTabs = () => {
    const tabs = [
      { id: 'info', name: '▤ Organization Info', component: 'info', alwaysShow: true }
    ];

    if (enabledFeatures.employee_attendance) {
      tabs.push(
        { id: 'employees', name: '▣ Employees Attendance', component: 'employees' },
        { id: 'departments', name: '▦ Departments', component: 'departments' },
        { id: 'shifts', name: '⧖ Shifts', component: 'shifts' }
      );
    }


    if (enabledFeatures.visitor_management) {
      tabs.push({ id: 'visitors', name: '◉ Visitor Management', component: 'visitors' });
    }

    if (enabledFeatures.lpr_integration) {
      tabs.push({ id: 'lpr', name: '~ License Plate Recognition', component: 'lpr' });
    }

    if (enabledFeatures.camera_integration) {
      tabs.push({ id: 'cameras', name: '⬢ Cameras', component: 'cameras' });
    }

    if (enabledFeatures.multi_location) {
      tabs.push({ id: 'locations', name: '◈ Locations', component: 'locations' });
    }

    if (enabledFeatures.advanced_analytics) {
      tabs.push({ id: 'statistics', name: '◐ Analytics', component: 'statistics' });
    }



    // Always show alerts and rules
    tabs.push(
      { id: 'alerts', name: '⚠ Alerts', component: 'alerts', alwaysShow: true },
      { id: 'rules', name: '≡ Rules', component: 'rules', alwaysShow: true }
    );

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Ensure active tab is available
  const ensureValidActiveTab = () => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab('info');
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (organization) {
      ensureValidActiveTab();
    }
  }, [organization, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      // v2 API returns: { success: true, data: {...organization object...}, message: "Success" }
      const response = await organizationsService.getById(id);
      setOrganization(response.data);
    } catch (error) {
      console.error('Error fetching organization:', error);
      message.error(error.response?.data?.message || 'Failed to load organization details');
      navigate(backPath);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Determine the edit path based on current path or user role
    // Assuming simple appending for now
    navigate(`${window.location.pathname}/edit`);
  };

  const handleDisable = async () => {
    if (!window.confirm(`Are you sure you want to ${organization.is_active ? 'disable' : 'enable'} this organization?`)) {
      return;
    }

    try {
      await organizationsService.update(id, { is_active: !organization.is_active });
      message.success(organization.is_active ? 'Organization disabled successfully' : 'Organization enabled successfully');
      fetchOrganization();
    } catch (error) {
      console.error('Error updating organization:', error);
      message.error(error.response?.data?.message || 'Failed to update organization status');
    }
  };

  const handleBack = () => {
    navigate(backPath);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading organization details...</p>
      </div>
    );
  }

  if (!organization) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 min-h-full">
      {/* Enhanced Page Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Row - Back Button and Organization Name */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(backPath)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 text-slate-700 hover:bg-white hover:border-slate-300/80 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {organization.name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm text-slate-600 font-medium">Code: <span className="font-bold text-slate-900">{organization.code}</span></span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${organization.is_active
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                    {organization.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-white text-indigo-600 hover:bg-gray-50 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 text-sm"
                onClick={handleEdit}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 text-sm ${organization.is_active
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                onClick={handleDisable}
              >
                {organization.is_active ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {organization.is_active ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-2 font-medium text-xs whitespace-nowrap flex items-center gap-1 transition-all duration-300 relative border-b-2 ${activeTab === tab.id
                  ? 'text-indigo-600 bg-white border-indigo-600'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100 border-transparent'
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Feature Status Indicator */}
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex flex-wrap gap-2 text-sm justify-center">
              <span className="text-blue-700 font-medium">Active Features:</span>
              {Object.entries(enabledFeatures)
                .filter(([key, enabled]) => enabled)
                .map(([key, enabled]) => (
                  <span key={key} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))
              }
              {Object.values(enabledFeatures).filter(Boolean).length === 0 && (
                <span className="text-gray-500 italic">Basic features only</span>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'info' && (
              <OrganizationInfo
                organization={organization}
                onUpdate={fetchOrganization}
              />
            )}
            {activeTab === 'employees' && (
              <OrganizationEmployees
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'cameras' && (
              <OrganizationCameras
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'locations' && (
              <OrganizationLocations
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'departments' && (
              <OrganizationDepartments
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'shifts' && (
              <OrganizationShifts
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'rules' && (
              <OrganizationRules
                organizationId={id}
                organization={organization}
                onUpdate={fetchOrganization}
              />
            )}
            {activeTab === 'alerts' && (
              <OrganizationAlerts
                organizationId={id}
              />
            )}
            {activeTab === 'statistics' && (
              <OrganizationStatistics
                organization={organization}
              />
            )}
            {activeTab === 'visitors' && (
              <OrganizationVisitors
                organizationId={id}
                organization={organization}
              />
            )}
            {activeTab === 'lpr' && (
              <OrganizationLPR
                organization={organization}
              />
            )}
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        organizationId={organization?.id}
      />
    </div>
  );
};

export default OrganizationDetail;