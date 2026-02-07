
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.utils.auth_utils import get_user_id_from_header
from app.models.classroom import Classroom
from app.models.user import User
import uuid
import logging

logger = logging.getLogger("AdminRoutes")
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/create_classroom', methods=['POST'])
def create_classroom():
    user_id = get_user_id_from_header()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Only admins can access these endpoints'}), 403
        
    data = request.get_json()
    if not data.get('name') or not data.get('subject'):
        return jsonify({'error': 'Name and subject are required'}), 400
        
    classroom = Classroom(
        id=str(uuid.uuid4()),
        name=data['name'],
        subject=data['subject'],
        description=data.get('description', ''),
        created_by_admin_id=user_id,
        allowed_languages=",".join(data.get('allowedLanguages', [])) if isinstance(data.get('allowedLanguages'), list) else data.get('allowedLanguages', '')
    )
    
    db.session.add(classroom)
    db.session.commit()
    
    return jsonify({'success': True, 'classroom': classroom.to_dict()}), 201

@admin_bp.route('/assign_teacher_to_classroom', methods=['POST'])
def assign_teacher():
    admin_id = get_user_id_from_header()
    admin = User.query.get(admin_id)
    
    if admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    classroom_id = data.get('classroomId')
    teacher_id = data.get('teacherId')
    
    classroom = Classroom.query.get(classroom_id)
    teacher = User.query.get(teacher_id)
    
    if not classroom or not teacher:
        return jsonify({'error': 'Classroom or Teacher not found'}), 404
        
    if teacher.role != 'teacher':
        return jsonify({'error': 'User is not a teacher'}), 400
        
    if teacher not in classroom.teachers:
        classroom.teachers.append(teacher)
        # For backward compatibility, set teacher_id if not set
        if not classroom.teacher_id:
            classroom.teacher_id = teacher_id
        db.session.commit()
    
    return jsonify({'success': True, 'message': f'Teacher {teacher.name} assigned to {classroom.name}'})

@admin_bp.route('/add_student_to_classroom', methods=['POST'])
def add_student():
    admin_id = get_user_id_from_header()
    admin = User.query.get(admin_id)
    
    if admin.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
        
    data = request.get_json()
    classroom_id = data.get('classroomId')
    student_id = data.get('studentId')
    
    classroom = Classroom.query.get(classroom_id)
    student = User.query.get(student_id)
    
    if not classroom or not student:
        return jsonify({'error': 'Classroom or Student not found'}), 404
        
    if student.role != 'student':
        return jsonify({'error': 'User is not a student'}), 400
        
    if student not in classroom.students:
        classroom.students.append(student)
        db.session.commit()
    
    return jsonify({'success': True, 'message': f'Student {student.name} added to {classroom.name}'})
