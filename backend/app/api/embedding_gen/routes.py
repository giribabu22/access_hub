# app/api/routes/face_enroll.py
from flask import Blueprint, request, jsonify
from app.utils import face_enrollment_background
from app.utils.face_enrollment_background import process_face_enrollment_background

face_enroll_bp = Blueprint("face_enroll_bp", __name__)

@face_enroll_bp.route("/api/v1/face/enroll", methods=["POST"])
def face_enroll():
    data = request.get_json(silent=True) or {}
    employee_id = data.get("employee_id")
    img_b64 = data.get("img_b64")

    if not employee_id or not img_b64:
        return jsonify({
            "ok": False,
            "error": "employee_id and img_b64 are required"
        }), 400

    # Runs the heavy pipeline in-request (will block)
    process_face_enrollment_background(employee_id=employee_id, img_b64=img_b64)

    return jsonify({
        "ok": True,
        "message": "Enrollment processed"
    }), 200
