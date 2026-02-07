
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.doubt import DoubtThread, DoubtMessage
import uuid

doubt_bp = Blueprint('doubt', __name__)

@doubt_bp.route('/threads', methods=['POST'])
@jwt_required()
def create_thread():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    thread = DoubtThread(
        id=str(uuid.uuid4()),
        classroom_id=data.get('classroom_id', data.get('classroomId')),
        student_id=user_id,
        topic=data['topic']
    )
    db.session.add(thread)
    db.session.commit()
    return jsonify({'success': True, 'thread': thread.to_dict()}), 201

@doubt_bp.route('/threads/<thread_id>/messages', methods=['POST'])
@jwt_required()
def send_message(thread_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    
    msg = DoubtMessage(
        thread_id=thread_id,
        sender_id=user_id,
        content=data['content'],
        message_type=data.get('type', 'text')
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'success': True, 'message': msg.to_dict()})

@doubt_bp.route('/classroom/<classroom_id>', methods=['GET'])
@jwt_required()
def get_threads(classroom_id):
    threads = DoubtThread.query.filter_by(classroom_id=classroom_id).all()
    return jsonify({'success': True, 'threads': [t.to_dict() for t in threads]})

@doubt_bp.route('/threads/<thread_id>', methods=['GET'])
@jwt_required()
def get_thread_messages(thread_id):
    thread = DoubtThread.query.get_or_404(thread_id)
    messages = thread.messages.order_by(DoubtMessage.created_at).all()
    return jsonify({
        'success': True, 
        'thread': thread.to_dict(),
        'messages': [m.to_dict() for m in messages]
    })
