"""
Logging configuration for the application
"""

import logging
import logging.config
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler
import sys


def setup_logging(app=None, log_level='INFO'):
    """
    Set up comprehensive logging for the application
    
    Args:
        app: Flask application instance
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Configure logging
    logging_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'detailed': {
                'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
            },
            'simple': {
                'format': '%(levelname)s - %(message)s'
            },
            'json': {
                'format': '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "message": "%(message)s"}'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'level': 'DEBUG',
                'formatter': 'simple',
                'stream': sys.stdout
            },
            'file_info': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'INFO',
                'formatter': 'detailed',
                'filename': os.path.join(log_dir, 'app_info.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            },
            'file_error': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'ERROR',
                'formatter': 'detailed',
                'filename': os.path.join(log_dir, 'app_error.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            },
            'file_audit': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'INFO',
                'formatter': 'json',
                'filename': os.path.join(log_dir, 'audit.log'),
                'maxBytes': 10485760,  # 10MB
                'backupCount': 10
            }
        },
        'loggers': {
            '': {  # Root logger
                'handlers': ['console', 'file_info', 'file_error'],
                'level': log_level,
                'propagate': False
            },
            'audit': {
                'handlers': ['file_audit'],
                'level': 'INFO',
                'propagate': False
            },
            'security': {
                'handlers': ['console', 'file_error', 'file_audit'],
                'level': 'WARNING',
                'propagate': False
            },
            'werkzeug': {
                'handlers': ['file_info'],
                'level': 'WARNING',
                'propagate': False
            }
        }
    }
    
    logging.config.dictConfig(logging_config)
    
    if app:
        # Set Flask app logger level
        app.logger.setLevel(getattr(logging, log_level.upper()))
        
        # Add request logging
        @app.before_request
        def log_request():
            from flask import request, g
            import time
            g.start_time = time.time()
            
            # Log security-relevant requests
            security_logger = logging.getLogger('security')
            if request.endpoint and any(endpoint in request.endpoint for endpoint in ['login', 'logout', 'register', 'reset']):
                security_logger.info(f"Security request: {request.method} {request.url} from {request.remote_addr}")
        
        @app.after_request
        def log_response(response):
            from flask import request, g
            import time
            
            # Calculate request duration
            duration = None
            if hasattr(g, 'start_time'):
                duration = time.time() - g.start_time
            
            # Log response
            app.logger.info(f"{request.method} {request.url} - {response.status_code} "
                          f"({duration:.3f}s)" if duration else f"{request.method} {request.url} - {response.status_code}")
            
            return response
    
    return logging.getLogger(__name__)


class AuditLogger:
    """Utility class for audit logging"""
    
    def __init__(self):
        self.logger = logging.getLogger('audit')
    
    def log_user_action(self, user_id, action, resource_type, resource_id=None, details=None):
        """Log user actions for audit trail"""
        audit_data = {
            'user_id': user_id,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(f"User action: {audit_data}")
    
    def log_security_event(self, event_type, user_id=None, ip_address=None, details=None):
        """Log security-related events"""
        security_data = {
            'event_type': event_type,
            'user_id': user_id,
            'ip_address': ip_address,
            'details': details,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.warning(f"Security event: {security_data}")
    
    def log_data_access(self, user_id, table_name, operation, record_ids=None):
        """Log data access for compliance"""
        access_data = {
            'user_id': user_id,
            'table_name': table_name,
            'operation': operation,
            'record_ids': record_ids,
            'timestamp': datetime.utcnow().isoformat()
        }
        self.logger.info(f"Data access: {access_data}")


class SecurityLogger:
    """Utility class for security logging"""
    
    def __init__(self):
        self.logger = logging.getLogger('security')
    
    def log_login_attempt(self, username, success, ip_address, user_agent=None):
        """Log login attempts"""
        self.logger.info(f"Login attempt - Username: {username}, Success: {success}, IP: {ip_address}, UserAgent: {user_agent}")
    
    def log_permission_denied(self, user_id, resource, action, ip_address):
        """Log permission denied events"""
        self.logger.warning(f"Permission denied - User: {user_id}, Resource: {resource}, Action: {action}, IP: {ip_address}")
    
    def log_token_validation(self, user_id, success, reason=None):
        """Log token validation events"""
        self.logger.info(f"Token validation - User: {user_id}, Success: {success}, Reason: {reason}")
    
    def log_suspicious_activity(self, description, user_id=None, ip_address=None, details=None):
        """Log suspicious activities"""
        self.logger.error(f"Suspicious activity - Description: {description}, User: {user_id}, IP: {ip_address}, Details: {details}")


# Global instances
audit_logger = AuditLogger()
security_logger = SecurityLogger()


def get_logger(name=None):
    """Get a logger instance"""
    return logging.getLogger(name or __name__)