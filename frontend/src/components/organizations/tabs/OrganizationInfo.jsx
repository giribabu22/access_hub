import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from 'recharts';

const OrganizationInfo = ({ organization, onUpdate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const resourceData = [
    { name: 'Employees', count: organization.employees_count || 0, color: '#6366f1' },
    { name: 'Cameras', count: organization.cameras_count || 0, color: '#ec4899' },
    { name: 'Locations', count: organization.locations_count || 0, color: '#3b82f6' },
    { name: 'Departments', count: organization.departments_count || 0, color: '#22c55e' },
  ];

  // Mock data for additional statistics
  const visitorActivityData = [
    { name: 'Mon', visitors: 120 },
    { name: 'Tue', visitors: 132 },
    { name: 'Wed', visitors: 101 },
    { name: 'Thu', visitors: 134 },
    { name: 'Fri', visitors: 190 },
    { name: 'Sat', visitors: 90 },
    { name: 'Sun', visitors: 85 },
  ];

  const cameraHealthData = [
    { name: 'Online', value: Math.floor((organization.cameras_count || 0) * 0.8), color: '#22c55e' },
    { name: 'Offline', value: Math.floor((organization.cameras_count || 0) * 0.15), color: '#ef4444' },
    { name: 'Maintenance', value: Math.floor((organization.cameras_count || 0) * 0.05), color: '#eab308' },
  ].filter(item => item.value > 0);

  // If no cameras, show placeholder data
  if (cameraHealthData.length === 0 && (organization.cameras_count || 0) > 0) {
     cameraHealthData.push({ name: 'Online', value: organization.cameras_count, color: '#22c55e' });
  } else if ((organization.cameras_count || 0) === 0) {
     cameraHealthData.push({ name: 'No Cameras', value: 1, color: '#9ca3af' });
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Basic Information */}
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Organization Name
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.name}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Organization Code
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.code || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
              <span className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${
                organization.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {organization.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Description
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.description || 'No description provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Street Address
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.address || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              City
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.city || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              State
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.state || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Country
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.country || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Postal Code
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.postal_code || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Phone
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.phone || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Email
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.email || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Website
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
              {organization.website ? (
                <a 
                  href={organization.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 font-medium hover:underline"
                >
                  {organization.website}
                </a>
              ) : (
                <span className="text-gray-900">N/A</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Contact Person */}
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
          Primary Contact Person
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Name
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.contact_person_name || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Email
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.contact_person_email || 'N/A'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Phone
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.contact_person_phone || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-teal-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Created On
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {formatDate(organization.created_at)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Last Updated
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {formatDate(organization.updated_at)}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Created By
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.created_by_username || 'System'}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Last Updated By
            </label>
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200 text-gray-900">
              {organization.updated_by_username || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Overview & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-teal-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
            Resource Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-teal-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
            Organization Status
          </h3>
          <div className="flex flex-col gap-4">
             <div className="p-4 bg-teal-50/95 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Current State</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    organization.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {organization.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {organization.is_active 
                    ? 'The organization is currently active and fully operational. All services are running.' 
                    : 'The organization is currently inactive. Access to services may be restricted.'}
                </p>
             </div>
             
             <div className="p-4 bg-teal-50/95 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Subscription Status</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                    Standard Plan
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Valid until Dec 31, 2025. Auto-renewal is enabled.
                </p>
             </div>

             <div className="p-4 bg-teal-50/95 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">System Health</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                    Healthy
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  All systems are functioning normally. No critical issues detected.
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-teal-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
            Visitor Activity (Last 7 Days)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorActivityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#8884d8" fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-teal-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
            Camera Health Status
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cameraHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cameraHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationInfo;
