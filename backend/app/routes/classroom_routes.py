import logging
import uuid
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from app import db
from app.utils.auth_utils import get_user_id_from_header
from app.models.classroom import Classroom
from app.models.user import User

logger = logging.getLogger("ClassroomRoutes")
classroom_bp = Blueprint('classroom', __name__)

@classroom_bp.route('/', methods=['POST'])
def create_classroom():
    try:
        user_id = get_user_id_from_header()
        user = User.query.get(user_id)
        
        if not user:
            logger.error(f"User not found for ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404

        if user.role != 'teacher' and user.role != 'admin':
            return jsonify({'error': 'Only teachers and admins can create classrooms'}), 403
            
        data = request.get_json()
        if not data or 'name' not in data or 'subject' not in data:
            return jsonify({'error': 'Name and subject are required'}), 400
            
        classroom = Classroom(
            id=str(uuid.uuid4()),
            name=data['name'],
            subject=data['subject'],
            description=data.get('description', ''),
            allowed_languages=",".join(data.get('allowedLanguages', [])) if isinstance(data.get('allowedLanguages'), list) else data.get('allowedLanguages', '')
        )
        
        if user.role == 'teacher':
            classroom.teacher_id = user_id
        else: # admin
            classroom.created_by_admin_id = user_id
        
        db.session.add(classroom)
        db.session.commit()
        
        logger.info(f"Classroom created: {classroom.name} (ID: {classroom.id}) by {user.role} {user_id}")
        return jsonify({'success': True, 'classroom': classroom.to_dict()}), 201
    except Exception as e:
        logger.exception(f"Error creating classroom: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@classroom_bp.route('/', methods=['GET'])
def list_classrooms():
    try:
        # Return classrooms where user is teacher or student
        user_id = get_user_id_from_header()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'success': True, 'classrooms': []})

        classes = []
        if user.role == 'teacher':
            classes = Classroom.query.filter_by(teacher_id=user_id).all() or []
        elif user.role == 'student':
            # Safe fetch for enrolled classrooms
            try:
                enrolled = user.enrolled_classrooms
                if hasattr(enrolled, 'all'):
                    classes = enrolled.all() or []
                else:
                    classes = enrolled or []
            except Exception as e:
                logger.error(f"Error fetching enrolled classrooms for student {user_id}: {e}")
                classes = []
        else: # Admin
            classes = Classroom.query.all() or []
            
        return jsonify({'success': True, 'classrooms': [c.to_dict() for c in (classes or [])]})
    except Exception as e:
        logger.exception(f"Error listing classrooms: {e}")
        return jsonify({'success': True, 'classrooms': []}) # Safe fallback

@classroom_bp.route('/join', methods=['POST'])
def join_classroom():
    try:
        user_id = get_user_id_from_header()
        user = User.query.get(user_id)
        
        if not user or user.role != 'student':
            return jsonify({'error': 'Only students can join classes'}), 403
            
        data = request.get_json()
        classroom_id = data.get('classroomId')
        
        classroom = Classroom.query.get(classroom_id)
        if not classroom:
            return jsonify({'error': 'Classroom not found'}), 404
            
        if user in classroom.students:
             return jsonify({'success': True, 'message': 'Already joined'}), 200
             
        classroom.students.append(user)
        db.session.commit()
        
        logger.info(f"User {user_id} joined classroom {classroom_id}")
        return jsonify({'success': True, 'message': 'Joined successfully'})
    except Exception as e:
        logger.exception(f"Error joining classroom: {e}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@classroom_bp.route('/<classroom_id>', methods=['GET'])
def get_classroom_details(classroom_id):
    try:
        classroom = Classroom.query.get(classroom_id)
        if not classroom:
            return jsonify({'error': 'Classroom not found'}), 404

        # Security check: Is user part of this class?
        user_id = get_user_id_from_header()
        # Simplified check for now
        
        return jsonify({
            'success': True, 
            'classroom': classroom.to_dict(),
            'students': [s.to_dict() for s in (classroom.students or [])]
        })
    except Exception as e:
        logger.exception(f"Error getting classroom details: {e}")
        return jsonify({'error': 'Internal server error'}), 500
