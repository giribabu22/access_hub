import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Building,
  CalendarDays,
  Timer
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import DashboardHeader from '../components/common/dashboard/DashboardHeader';
import StatCard from '../components/common/dashboard/StatCard';
import QuickActionButton from '../components/common/dashboard/QuickActionButton';

function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    presentDaysThisMonth: 0,
    totalHoursThisMonth: 0,
    pendingLeaves: 0,
    remainingLeave: 21
  });
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const token = authService.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch all employee data in parallel
      const [statsResponse, attendanceResponse, profileResponse] = await Promise.all([
        fetch('/api/employee/stats/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/employee/attendance/today', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/employee/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      // Process stats
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.status === 'success') {
          const data = statsResult.data;
          setStats({
            attendancePercentage: data.attendance.attendance_percentage,
            presentDaysThisMonth: data.attendance.present_days_this_month,
            totalHoursThisMonth: data.attendance.total_hours_this_month,
            pendingLeaves: data.leaves.pending_requests,
            remainingLeave: data.leaves.remaining_annual_leave
          });
        }
      }

      // Process today's attendance
      if (attendanceResponse.ok) {
        const attendanceResult = await attendanceResponse.json();
        if (attendanceResult.status === 'success') {
          setTodayAttendance(attendanceResult.data);
        }
      }

      // Process profile
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.status === 'success') {
          setProfile(profileResult.data);
        }
      }

    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
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
        title="Employee Dashboard"
        subtitle={`Welcome back, ${profile?.user_info?.first_name || user?.username}! Here's what's happening with your work today.`}
        user={user}
        onLogout={handleLogout}
        onRefresh={() => {
          setLoading(true);
          fetchEmployeeData();
        }}
        refreshing={loading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Today's Status Banner */}
        {todayAttendance && (
          <div className={`rounded-xl p-6 mb-8 border-l-4 shadow-sm bg-white ${todayAttendance.status === 'present'
            ? 'border-green-500'
            : 'border-yellow-500'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {todayAttendance.status === 'present' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Clock className="h-8 w-8 text-yellow-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Today's Status: {todayAttendance.status === 'present' ? 'Present' : 'Not Checked In'}
                  </h3>
                  {todayAttendance.check_in_time && (
                    <p className="text-sm text-gray-600">
                      Checked in at {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
                      {todayAttendance.check_out_time &&
                        ` • Checked out at ${new Date(todayAttendance.check_out_time).toLocaleTimeString()}`
                      }
                    </p>
                  )}
                </div>
              </div>
              {todayAttendance.total_hours > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{todayAttendance.total_hours}h</p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Attendance Rate"
            value={`${stats.attendancePercentage}%`}
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Present Days"
            value={stats.presentDaysThisMonth}
            subtitle="This month"
            color="blue"
          />
          <StatCard
            icon={<Timer className="w-6 h-6" />}
            title="Total Hours"
            value={`${stats.totalHoursThisMonth}h`}
            subtitle="This month"
            color="purple"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Pending Leaves"
            value={stats.pendingLeaves}
            subtitle="Awaiting approval"
            color="orange"
          />
          <StatCard
            icon={<CalendarDays className="w-6 h-6" />}
            title="Remaining Leave"
            value={stats.remainingLeave}
            subtitle="Days available"
            color="indigo"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 p-6 bg-teal-50/95 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionButton
              icon={<Clock className="w-5 h-5" />}
              title="Mark Attendance"
              color="green"
              onClick={() => navigate('/employee/mark-attendance')}
            />
            <QuickActionButton
              icon={<FileText className="w-5 h-5" />}
              title="Apply for Leave"
              color="blue"
              onClick={() => navigate('/employee/leaves')}
            />
            <QuickActionButton
              icon={<Calendar className="w-5 h-5" />}
              title="View Attendance"
              color="purple"
              onClick={() => navigate('/employee/attendance')}
            />
            <QuickActionButton
              icon={<User className="w-5 h-5" />}
              title="My Profile"
              color="indigo"
              onClick={() => navigate('/employee/profile')}
            />
          </div>
        </div>

        {/* Profile Summary */}
        {profile && (
          <div className="bg-teal-50/95 rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Employee ID</p>
                  <p className="text-sm text-gray-600">{profile.employee_info.employee_id || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Department</p>
                  <p className="text-sm text-gray-600">{profile.employee_info.department?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Position</p>
                  <p className="text-sm text-gray-600">{profile.employee_info.position || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{profile.user_info.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{profile.employee_info.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-teal-50 transition-colors">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hire Date</p>
                  <p className="text-sm text-gray-600">
                    {profile.employee_info.hire_date
                      ? new Date(profile.employee_info.hire_date).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
