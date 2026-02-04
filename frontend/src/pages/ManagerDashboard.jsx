import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import DashboardHeader from '../components/common/dashboard/DashboardHeader';
import StatCard from '../components/common/dashboard/StatCard';
import QuickActionButton from '../components/common/dashboard/QuickActionButton';

function ManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    teamMembers: 0,
    presentToday: 0,
    pendingLeaves: 0,
    lateArrivals: 0,
    avgWorkHours: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerStats();
    fetchRecentActivities();
  }, []);

  const fetchManagerStats = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) return;

      const response = await fetch('/api/manager/team/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setStats({
            teamMembers: result.data.total_members,
            presentToday: result.data.present_today,
            pendingLeaves: result.data.pending_leaves,
            lateArrivals: 0,
            avgWorkHours: result.data.attendance_percentage
          });
        }
      }
    } catch (error) {
      console.error('Error fetching manager stats:', error);
      // Keep mock data as fallback
      setStats({
        teamMembers: 12,
        presentToday: 10,
        pendingLeaves: 3,
        lateArrivals: 2,
        avgWorkHours: 8.5
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Mock data - replace with actual API
      setRecentActivities([
        {
          id: 1,
          type: 'leave_request',
          employee: 'John Doe',
          action: 'Leave request submitted',
          time: '2 hours ago',
          status: 'pending'
        },
        {
          id: 2,
          type: 'late_arrival',
          employee: 'Jane Smith',
          action: 'Arrived late',
          time: '3 hours ago',
          status: 'flagged'
        },
        {
          id: 3,
          type: 'attendance',
          employee: 'Mike Johnson',
          action: 'Checked in',
          time: '4 hours ago',
          status: 'success'
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 pb-12">
      <DashboardHeader
        title="Manager Dashboard"
        subtitle={`Welcome back, ${user?.full_name || user?.username}. Manage your team and track performance.`}
        user={user}
        onLogout={handleLogout}
        onRefresh={() => {
          setLoading(true);
          fetchManagerStats();
          fetchRecentActivities();
        }}
        refreshing={loading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Team Members"
            value={stats.teamMembers}
            color="blue"
            subtitle="Total reporting to you"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            title="Present Today"
            value={stats.presentToday}
            color="green"
            subtitle="Currently in office"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Pending Leaves"
            value={stats.pendingLeaves}
            color="orange"
            subtitle="Awaiting approval"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Late Arrivals"
            value={stats.lateArrivals}
            color="red"
            subtitle="Today"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Avg Work Hours"
            value={`${stats.avgWorkHours}h`}
            color="purple"
            subtitle="This week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-teal-50/95 rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <QuickActionButton
                  icon={<Users className="w-5 h-5" />}
                  title="Team Dashboard"
                  color="blue"
                  onClick={() => navigate('/manager/dashboard')}
                />
                <QuickActionButton
                  icon={<Users className="w-5 h-5" />}
                  title="Team Members"
                  color="indigo"
                  onClick={() => navigate('/manager/team')}
                />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  title="Leave Requests"
                  color="orange"
                  onClick={() => navigate('/manager/leaves')}
                />
                <QuickActionButton
                  icon={<CheckSquare className="w-5 h-5" />}
                  title="Reports"
                  color="green"
                  onClick={() => navigate('/manager/reports')}
                />
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-teal-50/95 rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
              </div>
              <div className="p-6">
                {recentActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-teal-50 transition-colors border border-transparent hover:border-gray-100">
                        <div className={`p-2 rounded-full ${activity.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                            activity.status === 'flagged' ? 'bg-red-100 text-red-600' :
                              'bg-green-100 text-green-600'
                          }`}>
                          {activity.type === 'leave_request' && <Calendar className="h-5 w-5" />}
                          {activity.type === 'late_arrival' && <AlertTriangle className="h-5 w-5" />}
                          {activity.type === 'attendance' && <CheckSquare className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">
                            {activity.employee}
                          </p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${activity.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            activity.status === 'flagged' ? 'bg-red-100 text-red-800' :
                              'bg-green-100 text-green-800'
                          }`}>
                          {activity.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;
