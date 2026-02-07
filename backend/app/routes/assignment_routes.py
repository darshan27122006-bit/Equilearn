
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.assignment import Assignment, Submission
from app.models.user import User
import uuid
import datetime

assignment_bp = Blueprint('assignment', __name__)

@assignment_bp.route('/', methods=['POST'])
@jwt_required()
def create_assignment():
    # Only Teachers
    data = request.form
    user_id = get_jwt_identity()
    
    file_url = None
    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(path)
        file_url = filename

    assignment = Assignment(
        id=str(uuid.uuid4()),
        classroom_id=data['classroomId'],
        title=data['title'],
        description=data.get('description'),
        file_url=file_url,
        due_date=datetime.datetime.fromisoformat(data['dueDate']) if data.get('dueDate') else None
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify({'success': True, 'assignment': assignment.to_dict()}), 201

@assignment_bp.route('/<assignment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assignment(assignment_id):
    user_id = get_jwt_identity()
    if 'file' not in request.files:
        return jsonify({'error': 'File required'}), 400
        
    file = request.files['file']
    filename = secure_filename(f"sub_{user_id}_{assignment_id}_{file.filename}")
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(path)
    
    submission = Submission(
        id=str(uuid.uuid4()),
        assignment_id=assignment_id,
        student_id=user_id,
        file_url=filename,
        status='submitted'
    )
    db.session.add(submission)
    db.session.commit()
    return jsonify({'success': True, 'submission': submission.to_dict()})

@assignment_bp.route('/classroom/<classroom_id>', methods=['GET'])
@jwt_required()
def get_classroom_assignments(classroom_id):
    assignments = Assignment.query.filter_by(classroom_id=classroom_id).all()
    return jsonify({'success': True, 'assignments': [a.to_dict() for a in assignments]})
