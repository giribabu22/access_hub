import React, { useState, useEffect } from 'react';
import { DatePicker, Input, Select, Table, Tag, message } from 'antd';
import moment from 'moment';
import { attendanceService } from '../../../services/organizationsService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const EmployeeAttendanceLogs = ({ employees = [] }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        fetchLogs();
    }, [pagination.current, pagination.pageSize, statusFilter, dateRange, searchText]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current,
                per_page: pagination.pageSize,
            };

            if (statusFilter !== 'all') {
                if (statusFilter === 'active') {
                    // Active usually means checked in but not checked out? 
                    // Or we filter by status='present'.
                    // For now, let's just pass 'present' if 'active' is selected, 
                    // or maybe the API supports a custom way.
                    // The API supports: present, absent, half_day, on_leave, holiday.
                    // Let's assume 'active' in UI context means 'present'.
                    params.status = 'present';
                } else if (statusFilter === 'late') {
                    // API doesn't have 'late' status in schema enum. 
                    // Late is usually derived from time. 
                    // We might handle this by fetching 'present' and filtering on client side if API doesn't support 'late_arrival' param.
                    params.status = 'present';
                } else {
                    params.status = statusFilter;
                }
            }

            if (searchText) {
                params.search = searchText;
            }

            if (dateRange && dateRange[0] && dateRange[1]) {
                params.start_date = dateRange[0].format('YYYY-MM-DD');
                params.end_date = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await attendanceService.list(params);

            if (response.success) {
                // Determine 'active' (no checkout) and 'late' client-side if API doesn't filter perfectly
                // But generally we just show what API gives.
                // For 'active' filter specifically, we might want to check for null check_out_time.
                let items = response.data.items || [];

                if (statusFilter === 'active') {
                    items = items.filter(i => !i.check_out_time);
                } else if (statusFilter === 'late') {
                    // Simple heuristic for late (e.g. after 9:15 AM)
                    items = items.filter(i => {
                        if (!i.check_in_time) return false;
                        const checkIn = moment(i.check_in_time);
                        return checkIn.hour() > 9 || (checkIn.hour() === 9 && checkIn.minute() > 15);
                    });
                }

                setLogs(items);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination.total_items
                }));
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            message.error('Failed to load attendance logs');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'employee',
            key: 'employee',
            render: (employee) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {employee?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{employee?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{employee?.employee_code || 'N/A'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <span className="text-gray-600">{moment(text).format('MMM DD, YYYY')}</span>
        },
        {
            title: 'Check In',
            dataIndex: 'check_in_time',
            key: 'check_in_time',
            render: (text) => text ? (
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {moment(text).format('HH:mm:ss')}
                </span>
            ) : '-'
        },
        {
            title: 'Check Out',
            dataIndex: 'check_out_time',
            key: 'check_out_time',
            render: (text) => text ? (
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {moment(text).format('HH:mm:ss')}
                </span>
            ) : (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-100 animate-pulse">
                    Active
                </span>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location_check_in',
            key: 'location',
            render: (loc) => loc?.name || 'Main Entrance' // Fallback or use real field
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                let color = 'green';
                let text = status ? status.toUpperCase() : 'PRESENT';

                // Calculate Late manually if needed
                if (record.check_in_time) {
                    const checkIn = moment(record.check_in_time);
                    if (checkIn.hour() > 9 || (checkIn.hour() === 9 && checkIn.minute() > 15)) {
                        text = 'LATE';
                        color = 'orange';
                    }
                }

                if (status === 'absent') color = 'red';
                if (status === 'on_leave') color = 'blue';

                return <Tag color={color}>{text}</Tag>;
            }
        },
    ];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 flex-1 min-w-[300px]">
                    <Input
                        prefix={<span>🔍</span>}
                        placeholder="Search by employee name or code..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="max-w-xs"
                    />
                    <RangePicker onChange={setDateRange} />
                    <Select defaultValue="all" onSelect={setStatusFilter} className="min-w-[120px]">
                        <Option value="all">All Status</Option>
                        <Option value="late">Late Arrivals</Option>
                        <Option value="active">Currently Active</Option>
                        <Option value="absent">Absent</Option>
                        <Option value="on_leave">On Leave</Option>
                    </Select>
                </div>
                <button
                    onClick={fetchLogs}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
                >
                    🔄 Refresh Logs
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Table
                    dataSource={logs}
                    columns={columns}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </div>
        </div>
    );
};

export default EmployeeAttendanceLogs;
