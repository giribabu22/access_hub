import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { visitorService } from '../../../services/visitorService';

const VisitorLogsList = ({ organizationId, refreshTrigger }) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [selectedTab, setSelectedTab] = useState('visitors');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchVisitors();
  }, [organizationId, refreshTrigger, page, pageSize]);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching visitors for organization:', {
        organizationId,
        page,
        pageSize
      });
      
      const response = await visitorService.getVisitorsByOrganization(organizationId, {
        page,
        limit: pageSize
      });
      
      console.log('📊 Visitors response received:', {
        success: response?.success,
        visitorsLength: response?.data?.visitors?.length,
        totalCount: response?.data?.pagination?.total
      });
      
      if (response.success) {
        setVisitors(response.data?.visitors || []);
        console.log('✅ Visitors loaded:', response.data?.visitors?.length || 0);
      } else {
        console.warn('⚠️ Visitors response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching visitors:', error);
      console.error('Fetch error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      message.error('Failed to load visitor logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await visitorService.getVisitorAlerts(organizationId);
      if (response.success) {
        setAlerts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      message.error('Failed to load visitor alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
    if (tab === 'alerts') {
      fetchAlerts();
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCheckout = async (visitorId) => {
    try {
      const response = await visitorService.checkOutVisitor(organizationId, visitorId, {});
      message.success('Visitor checked out successfully');
      fetchVisitors();
    } catch (error) {
      console.error('Error checking out visitor:', error);
      const errorMessage = error.response?.data?.message || 'Failed to check out visitor';
      message.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex bg-teal-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => handleTabChange('visitors')}
          className={`px-6 py-2.5 font-semibold rounded-md transition-all duration-300 flex items-center gap-2 ${
            selectedTab === 'visitors'
              ? 'bg-white text-teal-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Active Visitors
        </button>
        <button
          onClick={() => handleTabChange('alerts')}
          className={`px-6 py-2.5 font-semibold rounded-md transition-all duration-300 flex items-center gap-2 ${
            selectedTab === 'alerts'
              ? 'bg-white text-teal-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ⚠️ Alerts
        </button>
      </div>

      {/* Visitors Tab */}
      {selectedTab === 'visitors' && (
        <div className="bg-teal-50/95 rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-gray-600 font-semibold">No visitors currently checked in</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Allowed Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-teal-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {visitor.visitor_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visitor.mobile_number}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visitor.purpose_of_visit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {visitor.allowed_floor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(visitor.check_in_time)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {visitor.image_base64 ? (
                          <button
                            onClick={() => {
                              const img = new Image();
                              img.src = visitor.image_base64;
                              const w = window.open('');
                              w.document.write(img.outerHTML);
                            }}
                            className="px-3 py-1 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors duration-200 text-xs font-semibold"
                          >
                            📷 View
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No photo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!visitor.check_out_time && (
                          <button
                            onClick={() => handleCheckout(visitor.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-xs font-semibold flex items-center gap-1"
                          >
                            🚪 Check Out
                          </button>
                        )}
                        {visitor.check_out_time && (
                          <span className="text-green-700 text-xs font-semibold flex items-center gap-1">
                            ✅ Checked Out
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {visitors.length > 0 && (
            <div className="bg-teal-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{page}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-teal-50/95 border border-gray-300 rounded-lg hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-teal-50/95 border border-gray-300 rounded-lg hover:bg-teal-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {selectedTab === 'alerts' && (
        <div className="bg-teal-50/95 rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-gray-600 font-semibold">No alerts recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Visitor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Alert Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Unauthorized Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Allowed Floor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-red-700 uppercase tracking-wider">
                      Alert Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-red-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {alert.visitor_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                          ⚠️ Floor Violation
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-600">
                        {alert.current_floor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {alert.allowed_floor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(alert.alert_time)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorLogsList;
