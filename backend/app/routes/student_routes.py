
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.utils.auth_utils import get_user_id_from_header
from app.models.classroom import Classroom
from app.models.content import Content
from app.models.user import User
import logging

logger = logging.getLogger("StudentRoutes")
student_bp = Blueprint('student', __name__)

@student_bp.route('/get_my_classrooms', methods=['GET'])
def get_my_classrooms():
    user_id = get_user_id_from_header()
    user = User.query.get(user_id)
    
    if user.role != 'student':
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Using the backref 'enrolled_classrooms' defined in models/classroom.py
    classes = user.enrolled_classrooms.all()
    
    return jsonify({'success': True, 'classrooms': [c.to_dict() for c in classes]})

@student_bp.route('/get_classroom_content', methods=['GET'])
def get_classroom_content():
    user_id = get_user_id_from_header()
    user = User.query.get(user_id)
    
    if user.role != 'student':
        return jsonify({'error': 'Unauthorized'}), 403
        
    classroom_id = request.args.get('classroomId')
    if not classroom_id:
        return jsonify({'error': 'classroomId required'}), 400
        
    classroom = Classroom.query.get(classroom_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404
        
    # Security check: Is student enrolled?
    if user not in classroom.students:
        return jsonify({'error': 'You are not enrolled in this classroom'}), 403
        
    contents = Content.query.filter_by(classroom_id=classroom_id).all()
    
    return jsonify({'success': True, 'contents': [c.to_dict(include_translations=True) for c in contents]})
