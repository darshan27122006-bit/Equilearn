
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.utils.auth_utils import get_user_id_from_header
from app.models.classroom import Classroom
from app.models.user import User
import logging

logger = logging.getLogger("TeacherRoutes")
teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/get_assigned_classrooms', methods=['GET'])
def get_assigned_classrooms():
    user_id = get_user_id_from_header()
    user = User.query.get(user_id)
    
    if user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
        
    # Get classrooms where user is a teacher (either lead or in the association table)
    # Using the backref 'assigned_classrooms' defined in models/classroom.py
    classes = user.assigned_classrooms.all()
    
    # Also include lead classrooms for backward compatibility
    lead_classes = Classroom.query.filter_by(teacher_id=user_id).all()
    # Merge and remove duplicates
    all_classes = {c.id: c for c in classes + lead_classes}.values()
    
    return jsonify({'success': True, 'classrooms': [c.to_dict() for c in all_classes]})

@teacher_bp.route('/add_student_to_classroom', methods=['POST'])
def add_student():
    user_id = get_user_id_from_header()
    user = User.query.get(user_id)
    
    if user.role != 'teacher':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    classroom_id = data.get('classroomId')
    student_id = data.get('studentId')
    
    classroom = Classroom.query.get(classroom_id)
    student = User.query.get(student_id)
    
    if not classroom or not student:
        return jsonify({'error': 'Classroom or Student not found'}), 404
        
    # Security check: Does the teacher manage this classroom?
    if user != classroom.teacher and user not in classroom.teachers:
        return jsonify({'error': 'You do not have permission to manage this classroom'}), 403
        
    if student.role != 'student':
        return jsonify({'error': 'User is not a student'}), 400
        
    if student not in classroom.students:
        classroom.students.append(student)
        db.session.commit()
    
    return jsonify({'success': True, 'message': f'Student {student.name} added to {classroom.name}'})
