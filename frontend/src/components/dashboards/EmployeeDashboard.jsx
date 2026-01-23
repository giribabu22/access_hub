import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Dashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 shadow-xl border-b border-purple-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-lg">
              Dashboard
            </h1>
            <p className="text-lg text-white/90 font-medium">
              Welcome back, <span className="font-bold text-white">{user?.employee?.full_name || user?.username}</span>! 👋
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
          {/* Today's Status Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-indigo-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl">📅</div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">→</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Today's Status</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-3">Pending</p>
              <p className="text-sm text-slate-600 font-medium">Mark your attendance</p>
            </div>
          </div>

          {/* This Month Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-purple-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl">⏰</div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">📊</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">This Month</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">0</p>
              <p className="text-sm text-slate-600 font-medium">Days present</p>
            </div>
          </div>

          {/* Leave Balance Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-green-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl">🏖️</div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">✓</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Leave Balance</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-3">0</p>
              <p className="text-sm text-slate-600 font-medium">Days remaining</p>
            </div>
          </div>

          {/* Work Hours Card */}
          <div className="group bg-white backdrop-blur-xl p-8 rounded-2xl border border-slate-200/50 hover:border-blue-400/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="text-6xl">⏱️</div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">⌚</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Work Hours</h3>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 mb-3">0h</p>
              <p className="text-sm text-slate-600 font-medium">This week</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">✅ Mark Attendance</button>
            <button className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">📝 Apply for Leave</button>
            <button className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">📊 View History</button>
            <button className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300">👤 My Profile</button>
          </div>
        </div>

        {/* Under Development Info */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-yellow-900 mb-3">🚧 Under Development</h3>
          <p className="text-lg text-yellow-800 mb-6">
            Attendance marking and face recognition features coming in Phase 5!
          </p>
          <div className="bg-white rounded-xl p-6 border border-yellow-300">
            <h4 className="text-xl font-bold text-slate-900 mb-4">Your Profile</h4>
            <div className="space-y-2 text-slate-700">
              <p><strong className="text-indigo-600">Email:</strong> {user?.email}</p>
              <p><strong className="text-indigo-600">Username:</strong> {user?.username}</p>
              <p><strong className="text-indigo-600">Role:</strong> {user?.role?.name}</p>
              {user?.employee && (
                <>
                  <p><strong className="text-indigo-600">Employee Code:</strong> {user.employee.employee_code}</p>
                  <p><strong className="text-indigo-600">Department:</strong> {user.employee.department?.name || 'N/A'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
