
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Basic Validation
    required_fields = ['name', 'email', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'success': False, 'error': 'Missing fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'error': 'Email already exists'}), 409
    
    # Create User
    new_user = User(
        id=str(uuid.uuid4()),
        name=data['name'],
        email=data['email'],
        role=data['role'],
        language=data.get('language', 'en'),
        institution_id=data.get('institutionId'),
        learning_pace=data.get('learningPace', 'medium'),
        preferred_style=data.get('preferredStyle', 'visual')
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    token = create_access_token(identity=new_user.id)
    
    return jsonify({
        'success': True,
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user and user.check_password(data.get('password')):
        token = create_access_token(identity=user.id)
        return jsonify({
            'success': True,
            'token': token,
            'user': user.to_dict()
        }), 200
        
    return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'success': True, 'user': user.to_dict()})
