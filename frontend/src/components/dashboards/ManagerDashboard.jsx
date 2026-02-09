import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import '../../styles/Dashboard.css';


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_members: 0,
    present_today: 0,
    pending_leaves: 0,
    attendance_percentage: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchTeamStats(),
        fetchTeamMembers(),
        fetchCameras(),
        fetchLocations(),
        fetchPendingLeaves()
      ]);
    } catch (error) {
      console.error('Error fetching manager data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamStats = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/api/manager/team/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch team stats');
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
      setError('Failed to load team statistics');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/api/manager/team/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setTeamMembers(result.data.team_members || []);
      } else {
        throw new Error(result.message || 'Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
    }
  };

  const fetchCameras = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/api/manager/cameras`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setCameras(result.data.cameras || []);
      } else {
        throw new Error(result.message || 'Failed to fetch cameras');
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      setError('Failed to load camera information');
    }
  };

  const fetchLocations = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/api/manager/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setLocations(result.data.locations || []);
      } else {
        throw new Error(result.message || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load location information');
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/api/manager/leaves/pending?per_page=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success') {
        setPendingLeaves(result.data.leaves || []);
      } else {
        throw new Error(result.message || 'Failed to fetch pending leaves');
      }
    } catch (error) {
      console.error('Error fetching pending leaves:', error);
      setError('Failed to load pending leave requests');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/leaves/${leaveId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comments: 'Approved from dashboard'
        })
      });

      if (response.ok) {
        // Refresh the data
        fetchPendingLeaves();
        fetchTeamStats();
        // You could add a toast notification here
        console.log('Leave request approved successfully');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;

      const reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;

      const response = await fetch(`${API_BASE_URL}/api/manager/leaves/${leaveId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comments: reason
        })
      });

      if (response.ok) {
        // Refresh the data
        fetchPendingLeaves();
        fetchTeamStats();
        // You could add a toast notification here
        console.log('Leave request rejected successfully');
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Show loading screen
  if (loading && !stats.total_members && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading Dashboard</h2>
          <p className="text-slate-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  // Show error screen
  if (error && !stats.total_members && teamMembers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Failed to Load Dashboard</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchManagerData();
            }}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-teal-600 via-purple-600 to-teal-700 shadow-xl border-b border-purple-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-lg">
              Manager Dashboard
            </h1>
            <p className="text-lg text-white/90 font-medium">
              Welcome back, <span className="font-bold text-white">{user?.employee?.full_name || user?.username}</span>! 👋
              <br />
              <span className="text-sm text-white/80">
                {user?.employee?.department?.name} • {user?.employee?.designation}
              </span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500/80 hover:bg-red-600 backdrop-blur-md border border-red-400/30 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Team Members Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-teal-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl group-hover:scale-125 transition-transform duration-300">👥</div>
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <span className="text-lg">→</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Team Members</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-600 mb-3">
                {loading ? '...' : stats.total_members || teamMembers.length}
              </p>
              <p className="text-sm text-slate-600 font-medium">Under your management</p>
            </div>
          </div>

          {/* Present Today Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-green-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl group-hover:scale-125 transition-transform duration-300">✅</div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <span className="text-lg">✓</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Present Today</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3">
                {loading ? '...' : stats.present_today || 0}
              </p>
              <p className="text-sm text-slate-600 font-medium">Team attendance</p>
            </div>
          </div>

          {/* Pending Leave Requests Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-orange-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl group-hover:scale-125 transition-transform duration-300">📋</div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <span className="text-lg">⚠️</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Leave Requests</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 mb-3">
                {loading ? '...' : stats.pending_leaves || 0}
              </p>
              <p className="text-sm text-slate-600 font-medium">Pending your approval</p>
            </div>
          </div>

          {/* Team Performance Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-blue-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl group-hover:scale-125 transition-transform duration-300">📊</div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-lg">📈</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Team Attendance</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-3">
                {loading ? '...' : `${Math.round(stats.attendance_percentage || 0)}%`}
              </p>
              <p className="text-sm text-slate-600 font-medium">This month</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/manager/reports')}
              className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
            >
              ✅ Review Attendance
            </button>
            <button
              onClick={() => navigate('/manager/leaves')}
              className="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
            >
              📋 Approve Leave Requests
            </button>
            <button
              onClick={() => navigate('/manager/team')}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
            >
              👥 View Team
            </button>
            <button
              onClick={() => navigate('/manager/reports')}
              className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300"
            >
              📊 Team Reports
            </button>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Pending Leave Approvals</h2>
          <div className="bg-teal-50/95 rounded-2xl shadow-lg border border-slate-200/50 p-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading pending approvals...</p>
              </div>
            ) : pendingLeaves.length > 0 ? (
              <div className="space-y-4">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold">
                            {leave.employee?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {leave.employee?.name || 'Unknown Employee'}
                          </h4>
                          <p className="text-sm text-slate-600">
                            {leave.leave_type} • {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-slate-500">{leave.reason}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <button
                    onClick={() => navigate('/manager/leaves')}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    View all pending requests →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-7xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h3>
                <p className="text-lg text-slate-600">No pending leave requests at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Organization Overview */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Organization Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Info Card */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-50 border-2 border-teal-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-teal-900 mb-6">Organization Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-700">Your Department:</span>
                  <span className="text-lg font-bold text-teal-600">
                    {user?.employee?.department?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-700">Position:</span>
                  <span className="text-lg font-bold text-teal-600">
                    {user?.employee?.designation || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-700">Employee Code:</span>
                  <span className="text-lg font-bold text-teal-600">
                    {user?.employee?.employee_code || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-700">Shift:</span>
                  <span className="text-lg font-bold text-teal-600">
                    {user?.employee?.shift?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resources Overview Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-green-900 mb-6">Resource Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-teal-50/95 rounded-xl p-4 border border-green-300">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    📹 {loading ? '...' : cameras.length}
                  </div>
                  <div className="text-sm font-medium text-green-700">Cameras</div>
                </div>
                <div className="bg-teal-50/95 rounded-xl p-4 border border-green-300">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    📍 {loading ? '...' : locations.length}
                  </div>
                  <div className="text-sm font-medium text-green-700">Locations</div>
                </div>
                <div className="bg-teal-50/95 rounded-xl p-4 border border-green-300">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    👥 {loading ? '...' : stats.total_members || teamMembers.length}
                  </div>
                  <div className="text-sm font-medium text-green-700">Team Members</div>
                </div>
                <div className="bg-teal-50/95 rounded-xl p-4 border border-green-300">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    🏢 {user?.employee?.department?.code || 'N/A'}
                  </div>
                  <div className="text-sm font-medium text-green-700">Department Code</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Team Activity */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Recent Team Activity</h2>
          <div className="bg-teal-50/95 rounded-2xl shadow-lg border border-slate-200/50 p-8">
            {teamMembers.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Your Team Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamMembers.slice(0, 6).map((member, index) => (
                    <div key={member.id || index} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-teal-600">
                            {member.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{member.name}</h4>
                          <p className="text-sm text-slate-600">{member.position || 'Employee'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {teamMembers.length > 6 && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => navigate('/manager/team')}
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      View all {teamMembers.length} team members →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-7xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {loading ? 'Loading team data...' : 'No team data available'}
                </h3>
                <p className="text-lg text-slate-600">
                  {loading ? 'Please wait while we fetch your team information.' : 'Team members will appear here once data is available.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
