import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import moment from 'moment';
import { attendanceService } from '../../../services/organizationsService';
import api from '../../../services/api';

const EmployeeAnalytics = ({ employees = [], organizationId }) => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [typeDistribution, setTypeDistribution] = useState([]);
    const [departmentDistribution, setDepartmentDistribution] = useState([]);
    const [stats, setStats] = useState({
        attendanceRate: 0,
        onTimeRate: 0,
        avgWorkHours: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
    }, [organizationId]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            // Call server-side analytics endpoint (returns aggregated metrics)
            const endDate = moment().format('YYYY-MM-DD');
            const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
            const resp = await api.get('/api/analytics/attendance', {
                params: {
                    organization_id: organizationId,
                    start_date: startDate,
                    end_date: endDate,
                }
            });

            if (resp?.data?.success) {
                const data = resp.data.data || {};

                // Set summary stats
                setStats({
                    attendanceRate: data.summary?.avg_attendance_rate || 0,
                    onTimeRate: data.summary?.on_time_rate || 0,
                    avgWorkHours: data.summary?.avg_work_hours || 0
                });

                // Set series
                const series = (data.series || []).map(d => ({ name: moment(d.date).format('ddd'), present: d.present, late: d.late, absent: d.absent }));
                setAttendanceData(series);

                // Employment type distribution
                const typeData = (data.employment_type_distribution || []).map((e, idx) => ({
                    name: (e.type || 'Unknown').replace('_', ' ').toUpperCase(),
                    value: e.count,
                    color: ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b'][idx % 4]
                }));
                setTypeDistribution(typeData.length ? typeData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]);

                // Department distribution
                const deptData = (data.department_distribution || []).map((d, idx) => ({
                    name: d.department || 'Unassigned',
                    value: d.count,
                    color: ['#10b981', '#3b82f6', '#f43f5e', '#f97316'][idx % 4]
                }));
                setDepartmentDistribution(deptData.length ? deptData : [{ name: 'No Data', value: 1, color: '#e5e7eb' }]);
            }
        } catch (error) {
            console.error('Error fetching analytics data:', error);
            // Fallback to empty if failed
        } finally {
            setLoading(false);
        }
    };

    const processAttendanceData = (logs, startDate, endDate, totalEmployees) => {
        // Init daily buckets
        const dailyStats = {};
        for (let i = 0; i <= 6; i++) {
            const dateStr = startDate.clone().add(i, 'days').format('YYYY-MM-DD');
            dailyStats[dateStr] = { date: dateStr, day: startDate.clone().add(i, 'days').format('ddd'), present: 0, late: 0, absent: 0 };
        }

        let totalPresent = 0;
        let totalLate = 0;
        let totalHours = 0;
        let hoursCount = 0;

        logs.forEach(log => {
            const dateStr = moment(log.date).format('YYYY-MM-DD');
            const checkIn = log.check_in_time ? moment(log.check_in_time) : null;
            const checkOut = log.check_out_time ? moment(log.check_out_time) : null;

            if (dailyStats[dateStr]) {
                dailyStats[dateStr].present++;
                totalPresent++;

                // Check Late (after 9:15)
                if (checkIn && (checkIn.hour() > 9 || (checkIn.hour() === 9 && checkIn.minute() > 15))) {
                    dailyStats[dateStr].late++;
                    totalLate++;
                }

                // Check Work Hours
                if (checkIn && checkOut) {
                    const duration = moment.duration(checkOut.diff(checkIn)).asHours();
                    if (duration > 0 && duration < 24) { // consistency check
                        totalHours += duration;
                        hoursCount++;
                    }
                }
            }
        });

        // Convert to array for chart
        const chartData = Object.values(dailyStats).map(dayStat => {
            // Absent = Total Active Employees - Present (Approximation)
            // If totalEmployees is 0 (or unknown), assume absent = 0
            const absent = Math.max(0, totalEmployees - dayStat.present);
            return {
                name: dayStat.day,
                present: dayStat.present,
                late: dayStat.late,
                absent: absent
            };
        });
        setAttendanceData(chartData);

        // Stats
        const avgAttendance = totalEmployees > 0 ? ((totalPresent / (totalEmployees * 7)) * 100).toFixed(1) : 0; // over 7 days
        const onTimeRate = totalPresent > 0 ? (((totalPresent - totalLate) / totalPresent) * 100).toFixed(1) : 0;
        const avgHours = hoursCount > 0 ? (totalHours / hoursCount).toFixed(1) : 0;

        setStats({
            attendanceRate: avgAttendance,
            onTimeRate: onTimeRate,
            avgWorkHours: avgHours
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-teal-50/95 p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Avg. Attendance Rate (7d)</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</span>
                    </div>
                </div>
                <div className="bg-teal-50/95 p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">On-Time Arrival</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.onTimeRate}%</span>
                    </div>
                </div>
                <div className="bg-teal-50/95 p-6 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Avg. Work Hours</p>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-gray-900">{stats.avgWorkHours}h</span>
                        <span className="text-sm font-medium text-blue-600 mb-1">Target: 8h</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trends */}
                <div className="bg-teal-50/95 p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Attendance Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="present" name="Present" stackId="a" fill="#22c55e" radius={[0, 0, 4, 4]} />
                                <Bar dataKey="late" name="Late" stackId="a" fill="#eab308" />
                                <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Employment Type Distribution */}
                <div className="bg-teal-50/95 p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Employment Type Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {typeDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeAnalytics;
