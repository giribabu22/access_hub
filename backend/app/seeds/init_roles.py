"""
Initialize default roles and permissions in the database.
Run this script after database migration to set up RBAC.
"""
from ..extensions import db
from ..models import Role
from sqlalchemy import text
import json


def init_roles():
    """Create default roles with permissions"""
    
    roles_data = [
        {
            "name": "super_admin",
            "description": "Super Administrator with full system access",
            "permissions": {
                "organizations": ["create", "read", "update", "delete"],
                "departments": ["create", "read", "update", "delete"],
                "employees": ["create", "read", "update", "delete"],
                "users": ["create", "read", "update", "delete"],
                "roles": ["create", "read", "update", "delete"],
                "attendance": ["create", "read", "update", "delete", "approve"],
                "leaves": ["create", "read", "update", "delete", "approve"],
                "shifts": ["create", "read", "update", "delete"],
                "visitors": ["create", "read", "update", "delete", "checkin", "checkout", "movement", "search"],
                "analytics": ["read"],
                "settings": ["read", "update"],
            }
        },
        {
            "name": "admin",
            "description": "Organization Admin with access to own organization",
            "permissions": {
                "organizations": ["read"],
                "departments": ["create", "read", "update", "delete"],
                "employees": ["create", "read", "update", "delete"],
                "users": ["create", "read", "update"],
                "attendance": ["read", "update", "approve"],
                "leaves": ["read", "approve"],
                "shifts": ["create", "read", "update", "delete"],
                "visitors": ["create", "read", "update", "delete", "checkin", "checkout", "movement", "search"],
                "cameras": ["read"],
                "locations": ["read"],
                "analytics": ["read"],
                "settings": ["read", "update"],
            }
        },
        {
            "name": "org_admin",
            "description": "Organization Administrator with access to own organization",
            "permissions": {
                "departments": ["create", "read", "update", "delete"],
                "employees": ["create", "read", "update", "delete"],
                "users": ["create", "read", "update"],
                "attendance": ["read", "update", "approve"],
                "leaves": ["read", "approve"],
                "shifts": ["create", "read", "update", "delete"],
                "visitors": ["create", "read", "update", "delete", "checkin", "checkout", "movement", "search"],
                "analytics": ["read"],
                "settings": ["read", "update"],
            }
        },
        {
            "name": "manager",
            "description": "Department Manager with team management access",
            "permissions": {
                "departments": ["read"],
                "employees": ["read", "update"],
                "users": ["read"],
                "attendance": ["read", "update", "approve"],
                "leaves": ["read", "approve", "reject"],
                "shifts": ["read"],
                "analytics": ["read"],
                "team_reports": ["read"],
                "profile": ["read", "update"],
            }
        },
        {
            "name": "employee",
            "description": "Regular Employee with limited access",
            "permissions": {
                "attendance": ["create", "read"],
                "leaves": ["create", "read"],
                "profile": ["read", "update"],
            }
        }
    ]
    
    created_roles = []
    
    # Use raw SQL for compatibility with databases that may be missing
    # some Role columns (older schema). This avoids ORM SELECTs that
    # reference non-existent columns.
    try:
        try:
            engine = db.get_engine()
        except Exception:
            engine = db.engine

        with engine.connect() as conn:
            rows = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='roles' ORDER BY ordinal_position")).fetchall()
            cols = [r[0] for r in rows]
            cols_types = {r[0]: r[1] for r in rows}

            for role_data in roles_data:
                # Check existence by name
                exists = conn.execute(text("SELECT id FROM roles WHERE name = :name LIMIT 1"), {"name": role_data["name"]}).fetchone()
                if exists:
                    # Update only columns that exist
                    updates = []
                    params = {"name": role_data["name"]}
                    if "description" in cols:
                        updates.append("description = :description")
                        params["description"] = role_data["description"]
                    if "permissions" in cols:
                        updates.append("permissions = :permissions")
                        params["permissions"] = json.dumps(role_data["permissions"]) if role_data.get("permissions") is not None else None
                    if updates:
                        sql = f"UPDATE roles SET {', '.join(updates)} WHERE name = :name"
                        conn.execute(text(sql), params)
                    # update timestamp if column exists
                    if "updated_at" in cols:
                        conn.execute(text("UPDATE roles SET updated_at = NOW() WHERE name = :name"), {"name": role_data["name"]})
                    # Also update code column if present
                    if "code" in cols:
                        conn.execute(text("UPDATE roles SET code = :code WHERE name = :name"), {"code": role_data.get("code", role_data["name"]), "name": role_data["name"]})
                    print(f"Updated role: {role_data['name']}")
                    created_roles.append(role_data["name"])
                else:
                    # Insert with only available columns. If the existing `id`
                    # column is an integer type, let the DB generate it.
                    insert_cols = ["name"]
                    insert_vals = [":name"]
                    params = {"name": role_data["name"]}

                    id_type = cols_types.get("id")
                    use_id = False
                    if "id" in cols and id_type and id_type.lower() not in ("integer", "bigint", "smallint", "serial", "bigserial"):
                        use_id = True

                    if use_id:
                        import uuid
                        params["id"] = str(uuid.uuid4())
                        insert_cols.insert(0, "id")
                        insert_vals.insert(0, ":id")

                    if "description" in cols:
                        insert_cols.append("description")
                        insert_vals.append(":description")
                        params["description"] = role_data.get("description")
                    if "code" in cols:
                        insert_cols.append("code")
                        insert_vals.append(":code")
                        params["code"] = role_data.get("code", role_data["name"])
                    if "permissions" in cols:
                        insert_cols.append("permissions")
                        insert_vals.append(":permissions")
                        params["permissions"] = json.dumps(role_data.get("permissions")) if role_data.get("permissions") is not None else None

                    # Ensure timestamp and active flags are set for schemas
                    if "created_at" in cols and "created_at" not in insert_cols:
                        insert_cols.append("created_at")
                        insert_vals.append("NOW()")
                    if "updated_at" in cols and "updated_at" not in insert_cols:
                        insert_cols.append("updated_at")
                        insert_vals.append("NOW()")
                    if "is_active" in cols and "is_active" not in insert_cols:
                        insert_cols.append("is_active")
                        insert_vals.append(":is_active")
                        params["is_active"] = True

                    col_list = ",".join(insert_cols)
                    val_list = ",".join(insert_vals)
                    conn.execute(text(f"INSERT INTO roles ({col_list}) VALUES ({val_list})"), params)
                    print(f"Created role: {role_data['name']}")
                    created_roles.append(role_data["name"])

            # Commit if using transactional engine
            try:
                conn.execute(text("COMMIT"))
            except Exception:
                pass
    except Exception as e:
        print(f"Error writing roles via raw SQL: {e}")
        raise
    
    print(f"\n✅ Successfully initialized {len(created_roles)} roles")

    return created_roles


if __name__ == "__main__":
    from flask import Flask
    from ..config import Config
    
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        init_roles()
