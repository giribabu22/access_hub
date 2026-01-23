"""
Service layer for organization visitor management.
Handles visitor check-in, check-out, movement tracking, and alert generation.
"""

from ..models import (
    OrganizationVisitor, VisitorMovementLog, VisitorAlert, Organization,
    VisitorBlacklist, VisitorPreRegistration, VisitorBadge, GroupVisit,
    VisitorDocument, VisitorHealthScreening, VisitorAsset, ContractorTimeLog,
    DeliveryLog, VIPVisitorPreference
)
from ..extensions import db
from .image_service import ImageService
from datetime import datetime
from sqlalchemy import and_, or_


class VisitorService:
    """Service for managing visitors at organization level"""

    @staticmethod
    def create_visitor(organization_id, visitor_data):
        """
        Create a new visitor entry with check-in.
        
        Args:
            organization_id: Organization UUID
            visitor_data: Dict with {name, mobile_number, purpose_of_visit, allowed_floor, image_base64}
        
        Returns:
            OrganizationVisitor instance
        """
        # Verify organization exists
        org = Organization.query.get(organization_id)
        if not org:
            raise ValueError(f"Organization {organization_id} not found")

        visitor = OrganizationVisitor(
            organization_id=organization_id,
            visitor_name=visitor_data.get('name'),
            mobile_number=visitor_data.get('mobile_number'),
            purpose_of_visit=visitor_data.get('purpose_of_visit'),
            allowed_floor=visitor_data.get('allowed_floor'),
            is_checked_in=True,
            
             # New fields mapping
            visitor_type=visitor_data.get('visitor_type', 'guest'),
            host_name=visitor_data.get('host_name'),
            host_phone=visitor_data.get('host_phone'),
            company_name=visitor_data.get('company_name'),
            company_address=visitor_data.get('company_address'),
            is_recurring=visitor_data.get('is_recurring', False),
            
            # Contractor fields
            # work_description mapped later via contractor log or added to model if simple
            
            # Delivery fields
            delivery_package_count=visitor_data.get('delivery_package_count'),
            delivery_recipient_name=visitor_data.get('delivery_recipient_name'),
            
            # VIP fields
            special_instructions=visitor_data.get('special_instructions'),
            
            # Vehicle fields
            vehicle_number=visitor_data.get('vehicle_number'),
            vehicle_type=visitor_data.get('vehicle_type'),
            parking_slot=visitor_data.get('parking_slot'),
            vehicle_check_status=visitor_data.get('vehicle_checklist', {}),
            material_declaration=visitor_data.get('material_declaration'),
            vehicle_security_check_notes=visitor_data.get('vehicle_security_check_notes')
        )
        
        db.session.add(visitor)
        db.session.flush()  # Flush to get the visitor ID without committing
        
        # Save visitor photo (primary)
        if visitor_data.get('image_base64'):
            try:
                ImageService.create_image(
                    entity_type='visitor',
                    entity_id=visitor.id,
                    organization_id=organization_id,
                    image_base64=visitor_data.get('image_base64'),
                    image_type='photo',
                    capture_device='webcam',
                    primary=True
                )
            except Exception as e:
                print(f"Warning: Failed to save visitor image: {str(e)}")

        # Save vehicle photos
        vehicle_photos = visitor_data.get('vehicle_photos')
        if vehicle_photos and isinstance(vehicle_photos, list):
            saved_vehicle_photos = []
            for idx, photo in enumerate(vehicle_photos):
                if photo.get('base64'):
                   try:
                       # Create image record
                       img = ImageService.create_image(
                           entity_type='visitor',
                           entity_id=visitor.id,
                           organization_id=organization_id,
                           image_base64=photo.get('base64'),
                           image_type=f"vehicle_{photo.get('type', 'generic')}",
                           capture_device='webcam',
                           primary=False
                       )
                       saved_vehicle_photos.append({
                           'type': photo.get('type'),
                           'image_id': img.id,
                           'url': img.file_path # Assuming ImageService returns object with file_path or url
                       })
                   except Exception as e:
                       print(f"Warning: Failed to save vehicle photo {idx}: {str(e)}")
            
            # Update visitor record with reference to saved photos
            visitor.vehicle_photos = saved_vehicle_photos

        db.session.commit()
        
        return visitor

    @staticmethod
    def get_visitor(organization_id, visitor_id):
        """Get a specific visitor by ID"""
        visitor = OrganizationVisitor.query.filter_by(
            id=visitor_id,
            organization_id=organization_id
        ).first()
        
        if not visitor:
            raise ValueError(f"Visitor {visitor_id} not found")
        
        return visitor

    @staticmethod
    def get_visitors_by_organization(organization_id, page=1, limit=10):
        """
        Get all visitors for an organization with pagination.
        
        Args:
            organization_id: Organization UUID
            page: Page number (1-indexed)
            limit: Items per page
        
        Returns:
            (total_count, visitors_list)
        """
        query = OrganizationVisitor.query.filter_by(organization_id=organization_id)
        total = query.count()
        
        visitors = query.order_by(OrganizationVisitor.check_in_time.desc()).paginate(
            page=page,
            per_page=limit,
            error_out=False
        )
        
        return total, visitors.items

    @staticmethod
    def search_visitors(organization_id, query='', status='all', limit=50):
        """
        Search visitors by name, mobile number, or visitor ID.
        If no query is provided, returns all visitors sorted by latest first.
        
        Args:
            organization_id: Organization UUID
            query: Search term (optional - empty string returns all)
            status: Filter by status (checked_in, checked_out, all)
            limit: Maximum number of records to return
        
        Returns:
            List of matching visitors sorted by check_in_time desc (latest first)
        """
        base_query = OrganizationVisitor.query.filter_by(organization_id=organization_id)
        
        # Apply search filters only if query is provided
        if query.strip():
            search_filter = or_(
                OrganizationVisitor.visitor_name.ilike(f'%{query}%'),
                OrganizationVisitor.mobile_number.ilike(f'%{query}%'),
                OrganizationVisitor.id.ilike(f'%{query}%')
            )
            base_query = base_query.filter(search_filter)
        
        # Apply status filter
        if status == 'checked_in':
            base_query = base_query.filter(OrganizationVisitor.is_checked_in == True)
        elif status == 'checked_out':
            base_query = base_query.filter(OrganizationVisitor.is_checked_in == False)
        
        # Sort by latest first (most recent check_in_time)
        visitors = base_query.order_by(OrganizationVisitor.check_in_time.desc()).limit(limit).all()
        
        return visitors

    @staticmethod
    def check_in_visitor(organization_id, visitor_id, check_in_data=None):
        """Check in a visitor"""
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        visitor.is_checked_in = True
        visitor.check_in_time = datetime.utcnow()
        visitor.check_out_time = None
        
        if check_in_data and check_in_data.get('current_floor'):
            visitor.current_floor = check_in_data.get('current_floor')
        
        db.session.commit()
        
        return visitor

    @staticmethod
    def check_out_visitor(organization_id, visitor_id, check_out_data=None):
        """Check out a visitor"""
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        visitor.is_checked_in = False
        visitor.check_out_time = datetime.utcnow()
        
        db.session.commit()
        
        return visitor

    @staticmethod
    def log_visitor_movement(organization_id, visitor_id, floor):
        """
        Log visitor movement to a floor and check for violations.
        
        Args:
            organization_id: Organization UUID
            visitor_id: Visitor UUID
            floor: Floor name/code
        
        Returns:
            (movement_log, alert_if_any)
        """
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        # Update current floor
        visitor.current_floor = floor
        
        # Log movement
        movement_log = VisitorMovementLog(
            visitor_id=visitor_id,
            floor=floor,
            entry_time=datetime.utcnow()
        )
        
        alert = None
        
        # Check for floor violation
        if floor != visitor.allowed_floor:
            alert = VisitorAlert(
                visitor_id=visitor_id,
                organization_id=organization_id,
                alert_type='floor_violation',
                current_floor=floor,
                allowed_floor=visitor.allowed_floor,
                alert_time=datetime.utcnow(),
                details={
                    'visitor_name': visitor.name,
                    'mobile_number': visitor.mobile_number
                }
            )
            db.session.add(alert)
        
        db.session.add(movement_log)
        db.session.commit()
        
        return movement_log, alert

    @staticmethod
    def get_visitor_movement_logs(organization_id, visitor_id, limit=50):
        """Get movement logs for a specific visitor"""
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        logs = VisitorMovementLog.query.filter_by(visitor_id=visitor_id).order_by(
            VisitorMovementLog.entry_time.desc()
        ).limit(limit).all()
        
        return logs

    @staticmethod
    def get_visitor_alerts(organization_id, visitor_id=None, limit=100):
        """
        Get alerts for an organization or specific visitor.
        
        Args:
            organization_id: Organization UUID
            visitor_id: Optional visitor UUID to filter by
            limit: Maximum alerts to return
        
        Returns:
            List of alerts
        """
        query = VisitorAlert.query.filter_by(organization_id=organization_id)
        
        if visitor_id:
            query = query.filter_by(visitor_id=visitor_id)
        
        alerts = query.order_by(VisitorAlert.alert_time.desc()).limit(limit).all()
        
        return alerts

    @staticmethod
    def update_visitor(organization_id, visitor_id, update_data):
        """Update visitor information"""
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        # Only allow updating specific fields
        allowed_fields = ['purpose_of_visit', 'allowed_floor', 'current_floor']
        
        for field in allowed_fields:
            if field in update_data:
                setattr(visitor, field, update_data[field])
        
        db.session.commit()
        
        return visitor

    @staticmethod
    def delete_visitor(organization_id, visitor_id):
        """Delete a visitor record"""
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        db.session.delete(visitor)
        db.session.commit()

    @staticmethod
    def get_active_visitors(organization_id):
        """Get currently checked-in visitors"""
        visitors = OrganizationVisitor.query.filter_by(
            organization_id=organization_id,
            is_checked_in=True
        ).all()
        
        return visitors

    @staticmethod
    def acknowledge_alert(organization_id, alert_id):
        """Mark an alert as acknowledged"""
        alert = VisitorAlert.query.filter_by(
            id=alert_id,
            organization_id=organization_id
        ).first()
        
        if not alert:
            raise ValueError(f"Alert {alert_id} not found")
        
        alert.acknowledged = True
        alert.acknowledged_at = datetime.utcnow()
        
        db.session.commit()
        
        return alert

    @staticmethod
    def get_dashboard_stats(organization_id):
        from sqlalchemy import func, and_
        today = datetime.now().date()
        
        try:
            # Active visitors
            active_visitors = OrganizationVisitor.query.filter_by(
                organization_id=organization_id,
                is_checked_in=True
            ).count()
            
            # Entries today
            entries_today = OrganizationVisitor.query.filter(
                OrganizationVisitor.organization_id == organization_id,
                func.date(OrganizationVisitor.check_in_time) == today
            ).count()
            
            # Alerts today
            alerts_today = VisitorAlert.query.filter(
                VisitorAlert.organization_id == organization_id,
                func.date(VisitorAlert.alert_time) == today
            ).count()
            
            # --- NEW STATISTICS ---
            
            # Health Screenings Cleared Today
            health_cleared_today = 0
            try:
                # Basic check for table existence if needed, or just let it fail/pass
                health_cleared_today = VisitorHealthScreening.query.join(OrganizationVisitor).filter(
                    OrganizationVisitor.organization_id == organization_id,
                    func.date(VisitorHealthScreening.created_at) == today,
                    VisitorHealthScreening.result == 'pass'
                ).count()
            except Exception:
                db.session.rollback() # Rollback inner failure if any
                health_cleared_today = 0
                
            # VIP Visitors Today
            vip_visitors_today = OrganizationVisitor.query.filter(
                OrganizationVisitor.organization_id == organization_id,
                func.date(OrganizationVisitor.check_in_time) == today,
                OrganizationVisitor.visitor_type == 'vip'
            ).count()
            
            # Active Contractors
            contractors_active = OrganizationVisitor.query.filter_by(
                organization_id=organization_id,
                visitor_type='contractor',
                is_checked_in=True
            ).count()
            
            # Deliveries Today
            deliveries_today = 0
            try:
                deliveries_today = DeliveryLog.query.join(OrganizationVisitor).filter(
                    OrganizationVisitor.organization_id == organization_id,
                    func.date(DeliveryLog.created_at) == today
                ).count()
            except Exception:
                db.session.rollback()
                deliveries_today = 0
                
            # Pending Pre-Registrations
            pending_preregistrations = 0
            try:
                pending_preregistrations = VisitorPreRegistration.query.filter_by(
                    organization_id=organization_id,
                    status='pending'
                ).count()
            except Exception:
                db.session.rollback()
                pending_preregistrations = 0

            # Visitor Types Breakdown (Today)
            visitor_types = db.session.query(
                OrganizationVisitor.visitor_type, 
                func.count(OrganizationVisitor.id)
            ).filter(
                OrganizationVisitor.organization_id == organization_id,
                func.date(OrganizationVisitor.check_in_time) == today
            ).group_by(OrganizationVisitor.visitor_type).all()
            
            type_counts = {t[0]: t[1] for t in visitor_types}
            
            return {
                'active_visitors': active_visitors,
                'entries_today': entries_today,
                'alerts_today': alerts_today,
                'health_cleared_today': health_cleared_today,
                'vip_visitors_today': vip_visitors_today,
                'contractors_active': contractors_active,
                'deliveries_today': deliveries_today,
                'pending_preregistrations': pending_preregistrations,
                
                # Type breakdowns
                'guests_today': type_counts.get('guest', 0),
                'contractors_today': type_counts.get('contractor', 0),
                'vendors_today': type_counts.get('vendor', 0),
                'interviews_today': type_counts.get('interview_candidate', 0),
                'delivery_today': type_counts.get('delivery', 0),
                'service_today': type_counts.get('service_provider', 0),
                'vip_today': type_counts.get('vip', 0)
            }

        except Exception as e:
            db.session.rollback()
            raise e

    # ==================== BLACKLIST MANAGEMENT ====================
    
    @staticmethod
    def check_blacklist(organization_id, phone=None, email=None, id_proof=None):
        """
        Check if visitor is blacklisted.
        
        Returns:
            (is_blacklisted, blacklist_entry_or_none)
        """
        from sqlalchemy import func
        
        query = VisitorBlacklist.query.filter_by(organization_id=organization_id)
        
        # Check if blacklist is still active (end_date is null or in future)
        query = query.filter(
            or_(
                VisitorBlacklist.end_date.is_(None),
                VisitorBlacklist.end_date > datetime.utcnow()
            )
        )
        
        # Check against provided criteria
        criteria = []
        if phone:
            criteria.append(VisitorBlacklist.phone_number == phone)
        if email:
            criteria.append(VisitorBlacklist.email == email)
        if id_proof:
            criteria.append(VisitorBlacklist.id_proof_number == id_proof)
        
        if not criteria:
            return False, None
        
        entry = query.filter(or_(*criteria)).first()
        
        return entry is not None, entry
    
    @staticmethod
    def add_to_blacklist(organization_id, blacklist_data, added_by=None):
        """Add visitor to blacklist."""
        entry = VisitorBlacklist(
            organization_id=organization_id,
            phone_number=blacklist_data.get('phone_number'),
            email=blacklist_data.get('email'),
            id_proof_number=blacklist_data.get('id_proof_number'),
            visitor_name=blacklist_data.get('visitor_name'),
            reason=blacklist_data.get('reason', 'other'),
            severity=blacklist_data.get('severity', 'warning'),
            notes=blacklist_data.get('notes'),
            watchlist_type=blacklist_data.get('watchlist_type', 'internal'),
            end_date=blacklist_data.get('end_date'),
            added_by=added_by
        )
        
        db.session.add(entry)
        db.session.commit()
        
        return entry
    
    @staticmethod
    def remove_from_blacklist(organization_id, blacklist_id):
        """Remove visitor from blacklist."""
        entry = VisitorBlacklist.query.filter_by(
            id=blacklist_id,
            organization_id=organization_id
        ).first()
        
        if not entry:
            raise ValueError(f"Blacklist entry {blacklist_id} not found")
        
        db.session.delete(entry)
        db.session.commit()
    
    @staticmethod
    def get_blacklist(organization_id, active_only=True):
        """Get blacklist entries."""
        query = VisitorBlacklist.query.filter_by(organization_id=organization_id)
        
        if active_only:
            query = query.filter(
                or_(
                    VisitorBlacklist.end_date.is_(None),
                    VisitorBlacklist.end_date > datetime.utcnow()
                )
            )
        
        return query.order_by(VisitorBlacklist.created_at.desc()).all()

    # ==================== PRE-REGISTRATION ====================
    
    @staticmethod
    def create_pre_registration(organization_id, prereg_data):
        """Create pre-registration request."""
        import uuid
        
        prereg = VisitorPreRegistration(
            organization_id=organization_id,
            visitor_name=prereg_data.get('visitor_name'),
            mobile_number=prereg_data.get('mobile_number'),
            email=prereg_data.get('email'),
            company_name=prereg_data.get('company_name'),
            purpose_of_visit=prereg_data.get('purpose_of_visit'),
            host_name=prereg_data.get('host_name'),
            host_phone=prereg_data.get('host_phone'),
            scheduled_arrival_time=prereg_data.get('scheduled_arrival_time'),
            scheduled_departure_time=prereg_data.get('scheduled_departure_time'),
            qr_code=str(uuid.uuid4())  # Generate unique QR code
        )
        
        db.session.add(prereg)
        db.session.commit()
        
        return prereg
    
    @staticmethod
    def approve_pre_registration(organization_id, prereg_id, approved_by=None):
        """Approve pre-registration."""
        prereg = VisitorPreRegistration.query.filter_by(
            id=prereg_id,
            organization_id=organization_id
        ).first()
        
        if not prereg:
            raise ValueError(f"Pre-registration {prereg_id} not found")
        
        prereg.status = 'approved'
        prereg.approved_by = approved_by
        prereg.approved_at = datetime.utcnow()
        
        db.session.commit()
        
        # TODO: Send email confirmation with QR code
        
        return prereg
    
    @staticmethod
    def reject_pre_registration(organization_id, prereg_id, reason=None):
        """Reject pre-registration."""
        prereg = VisitorPreRegistration.query.filter_by(
            id=prereg_id,
            organization_id=organization_id
        ).first()
        
        if not prereg:
            raise ValueError(f"Pre-registration {prereg_id} not found")
        
        prereg.status = 'rejected'
        prereg.rejection_reason = reason
        
        db.session.commit()
        
        return prereg
    
    @staticmethod
    def get_pre_registrations(organization_id, status=None):
        """Get pre-registrations."""
        query = VisitorPreRegistration.query.filter_by(organization_id=organization_id)
        
        if status:
            query = query.filter_by(status=status)
        
        return query.order_by(VisitorPreRegistration.scheduled_arrival_time.desc()).all()

    # ==================== VIP MANAGEMENT ====================
    
    @staticmethod
    def create_vip_profile(organization_id, visitor_id, vip_data):
        """Create or update VIP visitor profile."""
        # Check if profile exists
        profile = VIPVisitorPreference.query.filter_by(
            visitor_id=visitor_id,
            organization_id=organization_id
        ).first()
        
        if profile:
            # Update existing
            profile.vip_tier = vip_data.get('vip_tier', profile.vip_tier)
            profile.preferred_greeting = vip_data.get('preferred_greeting')
            profile.dietary_requirements = vip_data.get('dietary_requirements')
            profile.accessibility_requirements = vip_data.get('accessibility_requirements')
            profile.other_preferences = vip_data.get('other_preferences', {})
            profile.room_preparation_settings = vip_data.get('room_preparation_settings', {})
        else:
            # Create new
            profile = VIPVisitorPreference(
                visitor_id=visitor_id,
                organization_id=organization_id,
                vip_tier=vip_data.get('vip_tier', 'silver'),
                preferred_greeting=vip_data.get('preferred_greeting'),
                dietary_requirements=vip_data.get('dietary_requirements'),
                accessibility_requirements=vip_data.get('accessibility_requirements'),
                other_preferences=vip_data.get('other_preferences', {}),
                room_preparation_settings=vip_data.get('room_preparation_settings', {})
            )
            db.session.add(profile)
        
        db.session.commit()
        
        return profile
    
    @staticmethod
    def get_vip_preferences(organization_id, visitor_id):
        """Get VIP preferences for visitor."""
        return VIPVisitorPreference.query.filter_by(
            visitor_id=visitor_id,
            organization_id=organization_id
        ).first()

    # ==================== CONTRACTOR TIME TRACKING ====================
    
    @staticmethod
    def contractor_clock_in(organization_id, visitor_id, work_details=None):
        """Clock in contractor."""
        time_log = ContractorTimeLog(
            visitor_id=visitor_id,
            organization_id=organization_id,
            work_description=work_details.get('work_description') if work_details else None,
            work_location=work_details.get('work_location') if work_details else None
        )
        
        db.session.add(time_log)
        db.session.commit()
        
        return time_log
    
    @staticmethod
    def contractor_clock_out(organization_id, visitor_id, time_log_id=None):
        """Clock out contractor and calculate billable hours."""
        # Get the most recent unclosed time log
        if time_log_id:
            time_log = ContractorTimeLog.query.get(time_log_id)
        else:
            time_log = ContractorTimeLog.query.filter_by(
                visitor_id=visitor_id,
                organization_id=organization_id
            ).filter(ContractorTimeLog.clock_out_time.is_(None)).first()
        
        if not time_log:
            raise ValueError("No active time log found")
        
        time_log.clock_out_time = datetime.utcnow()
        
        # Calculate billable hours
        duration = time_log.clock_out_time - time_log.clock_in_time
        time_log.billable_hours = duration.total_seconds() / 3600  # Convert to hours
        
        db.session.commit()
        
        return time_log
    
    @staticmethod
    def get_contractor_timesheet(organization_id, visitor_id, start_date=None, end_date=None):
        """Get contractor timesheet."""
        query = ContractorTimeLog.query.filter_by(
            visitor_id=visitor_id,
            organization_id=organization_id
        )
        
        if start_date:
            query = query.filter(ContractorTimeLog.clock_in_time >= start_date)
        if end_date:
            query = query.filter(ContractorTimeLog.clock_in_time <= end_date)
        
        return query.order_by(ContractorTimeLog.clock_in_time.desc()).all()

    # ==================== DELIVERY MANAGEMENT ====================
    
    @staticmethod
    def log_delivery(organization_id, visitor_id, delivery_data):
        """Log delivery."""
        delivery = DeliveryLog(
            visitor_id=visitor_id,
            organization_id=organization_id,
            package_count=delivery_data.get('package_count', 1),
            package_description=delivery_data.get('package_description'),
            delivery_photo_path=delivery_data.get('delivery_photo_path'),
            recipient_name=delivery_data.get('recipient_name')
        )
        
        db.session.add(delivery)
        db.session.commit()
        
        return delivery
    
    @staticmethod
    def complete_delivery(organization_id, delivery_id, signature_data=None):
        """Complete delivery with recipient signature."""
        delivery = DeliveryLog.query.filter_by(
            id=delivery_id,
            organization_id=organization_id
        ).first()
        
        if not delivery:
            raise ValueError(f"Delivery {delivery_id} not found")
        
        delivery.status = 'delivered'
        delivery.delivered_at = datetime.utcnow()
        delivery.recipient_signature = signature_data
        
        db.session.commit()
        
        return delivery
    
    @staticmethod
    def get_delivery_logs(organization_id, status=None):
        """Get delivery logs."""
        query = DeliveryLog.query.filter_by(organization_id=organization_id)
        
        if status:
            query = query.filter_by(status=status)
        
        return query.order_by(DeliveryLog.created_at.desc()).all()

    # ==================== HEALTH SCREENING ====================
    
    @staticmethod
    def perform_health_screening(organization_id, visitor_id, screening_data):
        """Perform health screening."""
        screening = VisitorHealthScreening(
            visitor_id=visitor_id,
            organization_id=organization_id,
            temperature=screening_data.get('temperature'),
            questionnaire_responses=screening_data.get('questionnaire_responses', {}),
            vaccination_verified=screening_data.get('vaccination_verified', False),
            vaccination_type=screening_data.get('vaccination_type'),
            result=screening_data.get('result', 'passed'),
            screener_notes=screening_data.get('screener_notes'),
            screened_by=screening_data.get('screened_by')
        )
        
        # Update visitor health status
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        visitor.temperature = screening_data.get('temperature')
        visitor.health_declaration_status = screening_data.get('result', 'passed')
        visitor.vaccination_verified = screening_data.get('vaccination_verified', False)
        
        db.session.add(screening)
        db.session.commit()
        
        return screening

    # ==================== DOCUMENT SIGNING ====================
    
    @staticmethod
    def sign_document(organization_id, visitor_id, document_data):
        """Sign document (NDA, waiver, etc.)."""
        document = VisitorDocument(
            visitor_id=visitor_id,
            organization_id=organization_id,
            document_type=document_data.get('document_type', 'nda'),
            document_template_id=document_data.get('document_template_id'),
            signature_data=document_data.get('signature_data'),
            pdf_path=document_data.get('pdf_path')
        )
        
        # Update visitor NDA status if applicable
        if document_data.get('document_type') == 'nda':
            visitor = VisitorService.get_visitor(organization_id, visitor_id)
            visitor.nda_signed = True
            visitor.nda_signed_at = datetime.utcnow()
        
        db.session.add(document)
        db.session.commit()
        
        return document
    
    @staticmethod
    def get_signed_documents(organization_id, visitor_id):
        """Get signed documents for visitor."""
        return VisitorDocument.query.filter_by(
            visitor_id=visitor_id,
            organization_id=organization_id
        ).order_by(VisitorDocument.signed_at.desc()).all()

    # ==================== ASSET TRACKING ====================
    
    @staticmethod
    def register_assets(organization_id, visitor_id, assets_data):
        """Register assets carried by visitor."""
        assets = []
        
        for asset_data in assets_data:
            asset = VisitorAsset(
                visitor_id=visitor_id,
                asset_type=asset_data.get('asset_type'),
                description=asset_data.get('description'),
                serial_number=asset_data.get('serial_number'),
                security_seal_number=asset_data.get('security_seal_number')
            )
            db.session.add(asset)
            assets.append(asset)
        
        db.session.commit()
        
        return assets
    
    @staticmethod
    def verify_assets_on_exit(organization_id, visitor_id):
        """Verify assets when visitor leaves."""
        assets = VisitorAsset.query.filter_by(visitor_id=visitor_id).all()
        
        for asset in assets:
            if not asset.exit_verified:
                asset.exit_verified = True
                asset.exit_time = datetime.utcnow()
        
        db.session.commit()
        
        return assets

    # ==================== BADGE MANAGEMENT ====================
    
    @staticmethod
    def generate_badge(organization_id, visitor_id, badge_type='standard'):
        """Generate visitor badge."""
        import uuid
        
        visitor = VisitorService.get_visitor(organization_id, visitor_id)
        
        # Generate unique badge number
        badge_number = f"VB-{str(uuid.uuid4())[:8].upper()}"
        
        badge = VisitorBadge(
            visitor_id=visitor_id,
            organization_id=organization_id,
            badge_number=badge_number,
            badge_type=badge_type,
            qr_code_data=visitor.id,  # QR code contains visitor ID
            access_permissions={'allowed_floor': visitor.allowed_floor}
        )
        
        # Update visitor badge info
        visitor.badge_number = badge_number
        visitor.badge_status = 'issued'
        visitor.badge_printed_at = datetime.utcnow()
        
        db.session.add(badge)
        db.session.commit()
        
        return badge
    
    @staticmethod
    def return_badge(organization_id, visitor_id):
        """Mark badge as returned."""
        badge = VisitorBadge.query.filter_by(
            visitor_id=visitor_id,
            organization_id=organization_id,
            status='issued'
        ).first()
        
        if badge:
            badge.status = 'returned'
            badge.returned_at = datetime.utcnow()
            
            visitor = VisitorService.get_visitor(organization_id, visitor_id)
            visitor.badge_status = 'returned'
            
            db.session.commit()
        
        return badge

    # ==================== RECURRING VISITORS ====================
    
    @staticmethod
    def get_recurring_visitors(organization_id, min_frequency=3):
        """Get frequent/recurring visitors."""
        return OrganizationVisitor.query.filter(
            OrganizationVisitor.organization_id == organization_id,
            OrganizationVisitor.visit_frequency >= min_frequency
        ).order_by(OrganizationVisitor.visit_frequency.desc()).all()
    
    @staticmethod
    def quick_checkin_recurring(organization_id, phone_number):
        """Quick check-in for recurring visitor by phone."""
        # Find most recent visitor with this phone
        visitor = OrganizationVisitor.query.filter_by(
            organization_id=organization_id,
            mobile_number=phone_number,
            is_recurring=True
        ).order_by(OrganizationVisitor.last_visit_date.desc()).first()
        
        if not visitor:
            raise ValueError(f"No recurring visitor found with phone {phone_number}")
        
        # Create new visit based on previous visit
        new_visitor = OrganizationVisitor(
            organization_id=organization_id,
            visitor_name=visitor.visitor_name,
            mobile_number=visitor.mobile_number,
            email=visitor.email,
            purpose_of_visit=visitor.purpose_of_visit,
            allowed_floor=visitor.allowed_floor,
            visitor_type=visitor.visitor_type,
            is_recurring=True,
            visit_frequency=visitor.visit_frequency + 1,
            host_name=visitor.host_name,
            host_phone=visitor.host_phone,
            company_name=visitor.company_name
        )
        
        db.session.add(new_visitor)
        
        # Update original visitor's frequency and last visit
        visitor.visit_frequency += 1
        visitor.last_visit_date = datetime.utcnow()
        
        db.session.commit()
        
        return new_visitor

    # ==================== ANALYTICS ====================
    
    @staticmethod
    def get_visitor_analytics(organization_id, start_date=None, end_date=None):
        """Get visitor analytics."""
        from sqlalchemy import func
        
        query = OrganizationVisitor.query.filter_by(organization_id=organization_id)
        
        if start_date:
            query = query.filter(OrganizationVisitor.check_in_time >= start_date)
        if end_date:
            query = query.filter(OrganizationVisitor.check_in_time <= end_date)
        
        # Visitor type distribution
        type_distribution = db.session.query(
            OrganizationVisitor.visitor_type,
            func.count(OrganizationVisitor.id)
        ).filter_by(organization_id=organization_id).group_by(
            OrganizationVisitor.visitor_type
        ).all()
        
        # Peak hours (simplified - hour of day)
        peak_hours = db.session.query(
            func.extract('hour', OrganizationVisitor.check_in_time).label('hour'),
            func.count(OrganizationVisitor.id).label('count')
        ).filter_by(organization_id=organization_id).group_by('hour').all()
        
        # Average duration
        avg_duration = db.session.query(
            func.avg(OrganizationVisitor.actual_duration_hours)
        ).filter_by(organization_id=organization_id).scalar()
        
        return {
            'type_distribution': dict(type_distribution),
            'peak_hours': dict(peak_hours),
            'average_duration_hours': avg_duration or 0,
            'total_visitors': query.count()
        }
