import React, { useState, useEffect } from 'react';
import { DatePicker, Input, Select, Table, Tag, message } from 'antd';
import moment from 'moment';
import { attendanceService } from '../../../services/organizationsService';

const { RangePicker } = DatePicker;
const { Option } = Select;

const EmployeeAttendanceLogs = ({ employees = [], onEmployeeClick, organizationId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState([moment(), moment()]);
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
                organization_id: organizationId,
                page: pagination.current,
                per_page: pagination.pageSize,
            };

            if (statusFilter !== 'all') {
                if (statusFilter === 'active') {
                    params.status = 'present';
                } else if (statusFilter === 'late') {
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
                let items = response.data.items || [];

                if (statusFilter === 'active') {
                    items = items.filter(i => !i.check_out_time);
                } else if (statusFilter === 'late') {
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
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onEmployeeClick && onEmployeeClick(employee.id)}
                >
                    <div className="w-8 h-8 bg-indigo-100 group-hover:bg-indigo-200 transition-colors rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {employee?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {employee?.full_name || 'Unknown'}
                        </div>
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
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-xs">
                    {moment(text).format('HH:mm:ss')}
                </span>
            ) : '-'
        },
        {
            title: 'Check Out',
            dataIndex: 'check_out_time',
            key: 'check_out_time',
            render: (text) => text ? (
                <span className="font-mono text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-xs">
                    {moment(text).format('HH:mm:ss')}
                </span>
            ) : (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    Active
                </span>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location_check_in',
            key: 'location',
            render: (loc) => <span className="text-xs">{loc?.name || 'Main Entrance'}</span>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => {
                let color = 'green';
                let text = status ? status.toUpperCase() : 'PRESENT';

                if (record.check_in_time) {
                    const checkIn = moment(record.check_in_time);
                    if (checkIn.hour() > 9 || (checkIn.hour() === 9 && checkIn.minute() > 15)) {
                        text = 'LATE';
                        color = 'orange';
                    }
                }

                if (status === 'absent') color = 'red';
                if (status === 'on_leave') color = 'blue';

                return <Tag color={color} style={{ fontSize: '10px', lineHeight: '18px' }}>{text}</Tag>;
            }
        },
    ];

    return (
        <div className="space-y-3">
            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-3 flex-1 min-w-[300px]">
                    <Input
                        prefix={<span>🔍</span>}
                        placeholder="Search..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="max-w-xs text-sm"
                        size="small"
                    />
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        size="small"
                        className="w-64"
                    />
                    <Select
                        defaultValue="all"
                        onSelect={setStatusFilter}
                        className="min-w-[120px]"
                        size="small"
                    >
                        <Option value="all">All Status</Option>
                        <Option value="late">Late Arrivals</Option>
                        <Option value="active">Currently Active</Option>
                        <Option value="absent">Absent</Option>
                        <Option value="on_leave">On Leave</Option>
                    </Select>
                </div>
                <button
                    onClick={fetchLogs}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <Table
                    dataSource={logs}
                    columns={columns}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    size="small"
                />
            </div>
        </div>
    );
};

export default EmployeeAttendanceLogs;
