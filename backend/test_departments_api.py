#!/usr/bin/env python3
from app import create_app, db
from app.models import Organization, Department, User
from app.services.auth_service import AuthService
import json

app = create_app()

with app.app_context():
    # Get organization
    org = Organization.query.first()
    if not org:
        print("No organizations found")
        exit(1)
    
    org_id = org.id
    print(f"Organization ID: {org_id}")
    print(f"Organization Name: {org.name}\n")
    
    # Get departments for this organization
    departments = Department.query.filter_by(organization_id=org_id, deleted_at=None).all()
    print(f"Total Departments: {len(departments)}\n")
    
    for dept in departments:
        print(f"  - {dept.name} ({dept.code})")
    
    # Generate token for testing
    user = User.query.filter_by(email='prem@sparquer.com').first()
    if user:
        token = AuthService.generate_token(user)
        print(f"\nTest Token: {token}")
        print(f"\nTest URL: http://localhost:5001/api/v2/departments/by-organization/{org_id}")
        print(f"Header: Authorization: Bearer {token}")
