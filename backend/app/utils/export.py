"""
Data export utilities for generating reports and exports
"""

import csv
import json
from io import StringIO, BytesIO
from datetime import datetime, date
import pandas as pd
from flask import make_response
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class DataExporter:
    """Utility class for exporting data in various formats"""
    
    @staticmethod
    def to_csv(data, filename=None, columns=None):
        """Export data to CSV format"""
        try:
            if not data:
                return DataExporter._empty_response('csv', filename)
            
            # Convert data to list of dictionaries if needed
            if hasattr(data[0], '__dict__'):
                data = [DataExporter._serialize_object(item) for item in data]
            
            output = StringIO()
            
            # Determine columns
            if columns is None:
                columns = list(data[0].keys()) if data else []
            
            writer = csv.DictWriter(output, fieldnames=columns)
            writer.writeheader()
            
            for row in data:
                # Filter only requested columns
                filtered_row = {k: v for k, v in row.items() if k in columns}
                writer.writerow(filtered_row)
            
            # Create response
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "export.csv"}"'
            
            return response
            
        except Exception as e:
            logger.error(f"CSV export error: {e}")
            return DataExporter._error_response('CSV export failed')
    
    @staticmethod
    def to_json(data, filename=None, pretty=True):
        """Export data to JSON format"""
        try:
            if not data:
                return DataExporter._empty_response('json', filename)
            
            # Serialize data
            serialized_data = DataExporter._serialize_data(data)
            
            # Convert to JSON
            if pretty:
                json_data = json.dumps(serialized_data, indent=2, ensure_ascii=False)
            else:
                json_data = json.dumps(serialized_data, ensure_ascii=False)
            
            # Create response
            response = make_response(json_data)
            response.headers['Content-Type'] = 'application/json'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "export.json"}"'
            
            return response
            
        except Exception as e:
            logger.error(f"JSON export error: {e}")
            return DataExporter._error_response('JSON export failed')
    
    @staticmethod
    def to_excel(data, filename=None, sheet_name='Sheet1', columns=None):
        """Export data to Excel format"""
        try:
            if not data:
                return DataExporter._empty_response('excel', filename)
            
            # Convert data to DataFrame
            if hasattr(data[0], '__dict__'):
                data = [DataExporter._serialize_object(item) for item in data]
            
            df = pd.DataFrame(data)
            
            # Filter columns if specified
            if columns:
                df = df[columns]
            
            # Create Excel file in memory
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            output.seek(0)
            
            # Create response
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "export.xlsx"}"'
            
            return response
            
        except Exception as e:
            logger.error(f"Excel export error: {e}")
            return DataExporter._error_response('Excel export failed')
    
    @staticmethod
    def _serialize_object(obj):
        """Serialize a single object"""
        if hasattr(obj, '__dict__'):
            result = {}
            for key, value in obj.__dict__.items():
                if not key.startswith('_'):
                    result[key] = DataExporter._serialize_value(value)
            return result
        return DataExporter._serialize_value(obj)
    
    @staticmethod
    def _serialize_data(data):
        """Serialize data for JSON export"""
        if isinstance(data, list):
            return [DataExporter._serialize_object(item) for item in data]
        elif isinstance(data, dict):
            return {key: DataExporter._serialize_value(value) for key, value in data.items()}
        else:
            return DataExporter._serialize_object(data)
    
    @staticmethod
    def _serialize_value(value):
        """Serialize a single value"""
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        elif isinstance(value, Decimal):
            return float(value)
        elif hasattr(value, '__dict__') and not value.__dict__.get('_sa_instance_state'):
            return DataExporter._serialize_object(value)
        else:
            return value
    
    @staticmethod
    def _empty_response(format_type, filename):
        """Return an empty response for empty data"""
        if format_type == 'csv':
            response = make_response('')
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "empty.csv"}"'
        elif format_type == 'json':
            response = make_response('[]')
            response.headers['Content-Type'] = 'application/json'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "empty.json"}"'
        else:  # excel
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                pd.DataFrame().to_excel(writer, index=False)
            output.seek(0)
            response = make_response(output.getvalue())
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = f'attachment; filename="{filename or "empty.xlsx"}"'
        
        return response
    
    @staticmethod
    def _error_response(message):
        """Return an error response"""
        response = make_response(f'Error: {message}')
        response.headers['Content-Type'] = 'text/plain'
        response.status_code = 500
        return response


class ReportGenerator:
    """Generate various types of reports"""
    
    @staticmethod
    def attendance_report(attendance_data, start_date, end_date, format_type='csv'):
        """Generate attendance report"""
        if not attendance_data:
            return DataExporter._empty_response(format_type, f'attendance_report_{start_date}_to_{end_date}.{format_type}')
        
        # Format data for report
        report_data = []
        for record in attendance_data:
            formatted_record = {
                'Employee ID': getattr(record, 'employee_id', ''),
                'Employee Name': getattr(record, 'employee_name', ''),
                'Date': record.date.strftime('%Y-%m-%d') if record.date else '',
                'Clock In': record.clock_in.strftime('%H:%M:%S') if record.clock_in else '',
                'Clock Out': record.clock_out.strftime('%H:%M:%S') if record.clock_out else '',
                'Total Hours': float(record.total_hours) if record.total_hours else 0,
                'Overtime Hours': float(record.overtime_hours) if record.overtime_hours else 0,
                'Status': record.status or ''
            }
            report_data.append(formatted_record)
        
        filename = f'attendance_report_{start_date}_to_{end_date}.{format_type}'
        
        if format_type == 'csv':
            return DataExporter.to_csv(report_data, filename)
        elif format_type == 'json':
            return DataExporter.to_json(report_data, filename)
        elif format_type == 'excel':
            return DataExporter.to_excel(report_data, filename, 'Attendance Report')
    
    @staticmethod
    def leave_report(leave_data, start_date, end_date, format_type='csv'):
        """Generate leave report"""
        if not leave_data:
            return DataExporter._empty_response(format_type, f'leave_report_{start_date}_to_{end_date}.{format_type}')
        
        # Format data for report
        report_data = []
        for record in leave_data:
            formatted_record = {
                'Employee ID': getattr(record, 'employee_id', ''),
                'Employee Name': getattr(record, 'employee_name', ''),
                'Leave Type': record.leave_type or '',
                'Start Date': record.start_date.strftime('%Y-%m-%d') if record.start_date else '',
                'End Date': record.end_date.strftime('%Y-%m-%d') if record.end_date else '',
                'Days': record.days or 0,
                'Status': record.status or '',
                'Reason': record.reason or '',
                'Applied Date': record.created_at.strftime('%Y-%m-%d') if record.created_at else ''
            }
            report_data.append(formatted_record)
        
        filename = f'leave_report_{start_date}_to_{end_date}.{format_type}'
        
        if format_type == 'csv':
            return DataExporter.to_csv(report_data, filename)
        elif format_type == 'json':
            return DataExporter.to_json(report_data, filename)
        elif format_type == 'excel':
            return DataExporter.to_excel(report_data, filename, 'Leave Report')
    
    @staticmethod
    def employee_report(employee_data, format_type='csv'):
        """Generate employee report"""
        if not employee_data:
            return DataExporter._empty_response(format_type, f'employee_report.{format_type}')
        
        # Format data for report
        report_data = []
        for employee in employee_data:
            formatted_record = {
                'Employee ID': employee.employee_id or '',
                'First Name': employee.user.first_name if employee.user else '',
                'Last Name': employee.user.last_name if employee.user else '',
                'Email': employee.user.email if employee.user else '',
                'Position': employee.position or '',
                'Department': employee.department.name if employee.department else '',
                'Hire Date': employee.hire_date.strftime('%Y-%m-%d') if employee.hire_date else '',
                'Phone': employee.phone or '',
                'Status': 'Active' if employee.user and employee.user.is_active else 'Inactive'
            }
            report_data.append(formatted_record)
        
        filename = f'employee_report_{datetime.now().strftime("%Y%m%d")}.{format_type}'
        
        if format_type == 'csv':
            return DataExporter.to_csv(report_data, filename)
        elif format_type == 'json':
            return DataExporter.to_json(report_data, filename)
        elif format_type == 'excel':
            return DataExporter.to_excel(report_data, filename, 'Employee Report')
    
    @staticmethod
    def department_summary_report(department_data, format_type='csv'):
        """Generate department summary report"""
        if not department_data:
            return DataExporter._empty_response(format_type, f'department_summary.{format_type}')
        
        # Format data for report
        report_data = []
        for dept in department_data:
            formatted_record = {
                'Department ID': dept.id or '',
                'Department Name': dept.name or '',
                'Department Code': dept.code or '',
                'Manager': f"{dept.manager.user.first_name} {dept.manager.user.last_name}" if dept.manager and dept.manager.user else 'Not Assigned',
                'Employee Count': len(dept.employees) if hasattr(dept, 'employees') else 0,
                'Description': dept.description or ''
            }
            report_data.append(formatted_record)
        
        filename = f'department_summary_{datetime.now().strftime("%Y%m%d")}.{format_type}'
        
        if format_type == 'csv':
            return DataExporter.to_csv(report_data, filename)
        elif format_type == 'json':
            return DataExporter.to_json(report_data, filename)
        elif format_type == 'excel':
            return DataExporter.to_excel(report_data, filename, 'Department Summary')


# Global exporter instance
data_exporter = DataExporter()
report_generator = ReportGenerator()