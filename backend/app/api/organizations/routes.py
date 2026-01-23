"""
Organizations API routes (v2).
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from ...utils.helpers import (
    success_response,
    error_response,
    paginate,
    validate_request,
    validate_query,
    get_current_user
)
from ...utils.exceptions import NotFoundError, ForbiddenError
from ...schemas.organization import (
    OrganizationSchema,
    OrganizationCreateSchema,
    OrganizationUpdateSchema,
    OrganizationListSchema
)
from ...services.organization_service import OrganizationService
from ...middlewares.rbac_middleware import require_permission

bp = Blueprint('organizations_api', __name__, url_prefix='/api/v2/organizations')


@bp.route('', methods=['POST'])
@jwt_required()
@require_permission('organizations:create')
@validate_request(OrganizationCreateSchema)
def create_organization():
    """
    Create a new organization
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - code
          properties:
            name:
              type: string
              example: "Acme Corporation"
            code:
              type: string
              example: "ACME001"
            address:
              type: string
              example: "123 Main St, City, Country"
            contact_email:
              type: string
              example: "contact@acme.com"
            contact_phone:
              type: string
              example: "+1234567890"
            organization_type:
              type: string
              enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
              example: "office"
            timezone:
              type: string
              example: "Asia/Kolkata"
            working_hours:
              type: object
              example: {"start": "09:00", "end": "18:00", "days": [1,2,3,4,5]}
    responses:
      201:
        description: Organization created successfully
        schema:
          $ref: '#/definitions/Success'
      400:
        $ref: '#/responses/BadRequestError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
      409:
        description: Organization with this code/name already exists
    """
    data = request.validated_data
    organization = OrganizationService.create_organization(data)
    
    schema = OrganizationSchema()
    return success_response(
        data=schema.dump(organization),
        message='Organization created successfully',
        status_code=201
    )


@bp.route('', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
@validate_query(OrganizationListSchema)
def list_organizations():
    """
    List all organizations with pagination and filters
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
        description: Page number
      - name: per_page
        in: query
        type: integer
        default: 20
        description: Items per page
      - name: search
        in: query
        type: string
        description: Search by name or code
      - name: organization_type
        in: query
        type: string
        enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
        description: Filter by organization type
      - name: is_active
        in: query
        type: boolean
        description: Filter by active status
    responses:
      200:
        description: List of organizations
        schema:
          type: object
          properties:
            success:
              type: boolean
              example: true
            message:
              type: string
              example: "Success"
            data:
              type: object
              properties:
                items:
                  type: array
                  items:
                    type: object
                pagination:
                  type: object
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    filters = request.validated_query
    page = filters.pop('page', 1)
    per_page = filters.pop('per_page', 20)
    
    query = OrganizationService.list_organizations(filters)
    result = paginate(query, page, per_page, OrganizationSchema)
    
    return success_response(data=result)


@bp.route('/<string:org_id>', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
def get_organization(org_id):
    """
    Get organization by ID
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
    responses:
      200:
        description: Organization details
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    # Return organization details along with relation counts
    stats = OrganizationService.get_organization_stats(org_id)
    return success_response(data=stats)


@bp.route('/<string:org_id>', methods=['PUT'])
@jwt_required()
@require_permission('organizations:update')
@validate_request(OrganizationUpdateSchema)
def update_organization(org_id):
    """
    Update an organization
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
            address:
              type: string
            contact_email:
              type: string
            contact_phone:
              type: string
            organization_type:
              type: string
              enum: [school, office, apartment, home, hospital, retail, warehouse, factory, hotel, restaurant, gym, other]
            timezone:
              type: string
            working_hours:
              type: object
            settings:
              type: object
            is_active:
              type: boolean
    responses:
      200:
        description: Organization updated successfully
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    data = request.validated_data
    organization = OrganizationService.update_organization(org_id, data)
    
    schema = OrganizationSchema()
    return success_response(
        data=schema.dump(organization),
        message='Organization updated successfully'
    )


@bp.route('/<string:org_id>', methods=['DELETE'])
@jwt_required()
@require_permission('organizations:delete')
def delete_organization(org_id):
    """
    Delete an organization (soft delete)
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
      - name: hard_delete
        in: query
        type: boolean
        default: false
        description: Perform hard delete instead of soft delete
    responses:
      200:
        description: Organization deleted successfully
        schema:
          $ref: '#/definitions/Success'
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    hard_delete = request.args.get('hard_delete', 'false').lower() == 'true'
    OrganizationService.delete_organization(org_id, soft_delete=not hard_delete)
    
    return success_response(message='Organization deleted successfully')


@bp.route('/<string:org_id>/stats', methods=['GET'])
@jwt_required()
@require_permission('organizations:read')
def get_organization_stats(org_id):
    """
    Get organization statistics
    ---
    tags:
      - Organizations
    security:
      - Bearer: []
    parameters:
      - name: org_id
        in: path
        type: string
        required: true
        description: Organization ID
    responses:
      200:
        description: Organization statistics
        schema:
          type: object
          properties:
            success:
              type: boolean
            message:
              type: string
            data:
              type: object
              properties:
                organization:
                  type: object
                departments_count:
                  type: integer
                employees_count:
                  type: integer
                locations_count:
                  type: integer
                cameras_count:
                  type: integer
                shifts_count:
                  type: integer
      404:
        $ref: '#/responses/NotFoundError'
      401:
        $ref: '#/responses/UnauthorizedError'
      403:
        $ref: '#/responses/ForbiddenError'
    """
    stats = OrganizationService.get_organization_stats(org_id)
    return success_response(data=stats)