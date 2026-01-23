import React, { useState, useEffect } from 'react';
import VisitorEntryForm from './VisitorEntryForm';
import VisitorLogsList from './VisitorLogsList';
import SecurityGateEntry from './SecurityGateEntry';
import BlacklistManagement from './BlacklistManagement';
import PreRegistrationList from './PreRegistrationList';
import { visitorService } from '../../../services/visitorService';

const OrganizationVisitors = ({ organizationId, organization }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview'); // checkin, security, logs, overview
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    active_visitors: 0,
    entries_today: 0,
    alerts_today: 0
  });

  const handleVisitorCreated = () => {
    // Trigger refresh of visitor logs
    setRefreshTrigger(prev => prev + 1);
    setActiveSubTab('logs');
    fetchStats();
  };

  useEffect(() => {
    if (organizationId && activeSubTab === 'overview') {
      fetchStats();
      // Auto-refresh stats every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [organizationId, activeSubTab]);

  const fetchStats = async () => {
    try {
      const res = await visitorService.getStats(organizationId);
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch visitor stats", error);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">👥</span> Visitor Management System
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Streamline guest access, security, and tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'overview' && (
            <button
              onClick={fetchStats}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
              title="Refresh Data"
            >
              🔄
            </button>
          )}

          {/* Sub-tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'overview'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveSubTab('checkin')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'checkin'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              ✅ Check In
            </button>
            <button
              onClick={() => setActiveSubTab('security')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'security'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              🚪 Security Gate
            </button>
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'logs'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              📋 Logs
            </button>
            <button
              onClick={() => setActiveSubTab('preregister')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'preregister'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              📅 Pre-Reg
            </button>
            <button
              onClick={() => setActiveSubTab('blacklist')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${activeSubTab === 'blacklist'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
                }`}
            >
              🚫 Blacklist
            </button>
          </div>
        </div>
      </div>


      {/* Content */}
      <div>
        {activeSubTab === 'overview' && (
          <>
            {/* Primary Stats - 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Active Visitors</p>
                    <h3 className="text-4xl font-black text-purple-900">{stats.active_visitors || 0}</h3>
                  </div>
                  <span className="text-3xl">🎫</span>
                </div>
                <p className="text-sm text-purple-600 mt-2 font-medium">Currently on premises</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Total Entries Today</p>
                    <h3 className="text-4xl font-black text-blue-900">{stats.entries_today || 0}</h3>
                  </div>
                  <span className="text-3xl">👣</span>
                </div>
                <p className="text-sm text-blue-600 mt-2 font-medium">Checked in since midnight</p>
              </div>

              <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Security Alerts</p>
                    <h3 className="text-4xl font-black text-amber-900">{stats.alerts_today || 0}</h3>
                  </div>
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-sm text-amber-600 mt-2 font-medium">Requires attention</p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">Health Cleared</p>
                    <h3 className="text-4xl font-black text-green-900">{stats.health_cleared_today || 0}</h3>
                  </div>
                  <span className="text-3xl">🌡️</span>
                </div>
                <p className="text-sm text-green-600 mt-2 font-medium">Passed screening today</p>
              </div>
            </div>

            {/* Secondary Stats - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">VIP Visitors</p>
                    <h4 className="text-3xl font-black text-indigo-900">{stats.vip_visitors_today || 0}</h4>
                    <p className="text-xs text-indigo-600 mt-1">Today</p>
                  </div>
                  <span className="text-4xl">👑</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-xl border border-cyan-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">Contractors</p>
                    <h4 className="text-3xl font-black text-cyan-900">{stats.contractors_active || 0}</h4>
                    <p className="text-xs text-cyan-600 mt-1">Currently working</p>
                  </div>
                  <span className="text-4xl">👷</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Deliveries</p>
                    <h4 className="text-3xl font-black text-emerald-900">{stats.deliveries_today || 0}</h4>
                    <p className="text-xs text-emerald-600 mt-1">Packages today</p>
                  </div>
                  <span className="text-4xl">📦</span>
                </div>
              </div>
            </div>

            {/* Visitor Types Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">👤</span>
                <p className="text-xs text-slate-600 font-medium">Guests</p>
                <p className="text-xl font-bold text-slate-900">{stats.guests_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">👷</span>
                <p className="text-xs text-slate-600 font-medium">Contractors</p>
                <p className="text-xl font-bold text-slate-900">{stats.contractors_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">🏢</span>
                <p className="text-xs text-slate-600 font-medium">Vendors</p>
                <p className="text-xl font-bold text-slate-900">{stats.vendors_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">💼</span>
                <p className="text-xs text-slate-600 font-medium">Interviews</p>
                <p className="text-xl font-bold text-slate-900">{stats.interviews_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">📦</span>
                <p className="text-xs text-slate-600 font-medium">Delivery</p>
                <p className="text-xl font-bold text-slate-900">{stats.delivery_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">🔧</span>
                <p className="text-xs text-slate-600 font-medium">Service</p>
                <p className="text-xl font-bold text-slate-900">{stats.service_today || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
                <span className="text-2xl block mb-1">👑</span>
                <p className="text-xs text-slate-600 font-medium">VIP</p>
                <p className="text-xl font-bold text-slate-900">{stats.vip_today || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Quick Actions</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveSubTab('checkin')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">✅</span>
                    <span className="font-semibold text-slate-700">New Check-In</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('security')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-300 text-left transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🛑</span>
                    <span className="font-semibold text-slate-700">Security Gate</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('preregister')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 text-left transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📅</span>
                    <span className="font-semibold text-slate-700">Pre-Register</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('blacklist')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 text-left transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">🚫</span>
                    <span className="font-semibold text-slate-700">Blacklist</span>
                  </button>
                  <button
                    onClick={() => setActiveSubTab('logs')}
                    className="p-4 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left transition-all flex flex-col gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                    <span className="font-semibold text-slate-700">View Logs</span>
                  </button>
                  <button className="p-4 border border-slate-200 rounded-lg hover:bg-green-50 hover:border-green-300 text-left transition-all flex flex-col gap-2 group">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📥</span>
                    <span className="font-semibold text-slate-700">Export Report</span>
                  </button>
                </div>
              </div>

              {/* System Status & Health */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">System Status & Health</h3>
                </div>
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🟢</span>
                        <div>
                          <p className="font-semibold text-green-900">Visitor Kiosk</p>
                          <p className="text-xs text-green-600">Online & Operational</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-700">✓</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🟢</span>
                        <div>
                          <p className="font-semibold text-green-900">Security Gate</p>
                          <p className="text-xs text-green-600">Online & Operational</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-700">✓</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌡️</span>
                        <div>
                          <p className="font-semibold text-blue-900">Health Screening</p>
                          <p className="text-xs text-blue-600">{stats.health_cleared_today || 0} cleared today</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-700">Active</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="font-semibold text-purple-900">Pre-Registrations</p>
                          <p className="text-xs text-purple-600">{stats.pending_preregistrations || 0} pending approval</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-purple-700">{stats.pending_preregistrations || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {activeSubTab === 'checkin' && (
          <VisitorEntryForm
            organizationId={organizationId}
            organization={organization}
            onSubmitSuccess={handleVisitorCreated}
          />
        )}
        {activeSubTab === 'security' && (
          <SecurityGateEntry
            organizationId={organizationId}
            organization={organization}
          />
        )}
        {activeSubTab === 'logs' && (
          <VisitorLogsList
            organizationId={organizationId}
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeSubTab === 'preregister' && (
          <PreRegistrationList organizationId={organizationId} />
        )}
        {activeSubTab === 'blacklist' && (
          <BlacklistManagement organizationId={organizationId} />
        )}
      </div>
    </div>
  );
};

export default OrganizationVisitors;
