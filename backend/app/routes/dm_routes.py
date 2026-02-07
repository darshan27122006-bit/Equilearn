from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.dm import DirectMessage
from app.models.user import User
# from app.utils.file_handler import save_file
from werkzeug.utils import secure_filename
import os

dm_bp = Blueprint('dm', __name__)

@dm_bp.route('/users', methods=['GET'])
def get_contact_users():
    """Get list of users to chat with (excluding self)"""
    # In a real app, we might limit this to users in the same class
    # For demo, the frontend passes current user id or we just return all
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'name': u.name,
        'role': u.role,
        'email': u.email
    } for u in users]), 200

@dm_bp.route('/messages/<user_id>', methods=['GET'])
def get_messages(user_id):
    """Get conversation with specific user"""
    # For demo, we expect sender_id to be provided in query params or we just use a default
    current_user_id = request.args.get('sender_id')
    
    messages = DirectMessage.query.filter(
        ((DirectMessage.sender_id == current_user_id) & (DirectMessage.receiver_id == user_id)) |
        ((DirectMessage.sender_id == user_id) & (DirectMessage.receiver_id == current_user_id))
    ).order_by(DirectMessage.timestamp.asc()).all()
    
    return jsonify([m.to_dict() for m in messages]), 200

@dm_bp.route('/send', methods=['POST'])
def send_message():
    current_user_id = request.form.get('sender_id')
    
    receiver_id = request.form.get('receiver_id')
    content = request.form.get('content', '')
    
    if not receiver_id:
        return jsonify({'error': 'Receiver ID required'}), 400
        
    media_url = None
    media_type = None
    
    # Handle File Upload
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename:
            filename = secure_filename(file.filename)
            # Determine type
            ext = filename.rsplit('.', 1)[1].lower()
            if ext in ['jpg', 'jpeg', 'png', 'gif']:
                media_type = 'image'
            elif ext in ['mp4', 'webm', 'mov']:
                media_type = 'video'
            elif ext in ['pdf', 'doc', 'docx']:
                media_type = 'document'
            else:
                media_type = 'other'
                
            # Use shared file handler
            # Assuming basic uploads dir for now if save_file not robust
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            # In prod, this would be a full URL
            media_url = f"/uploads/{filename}" 

    new_msg = DirectMessage(
        sender_id=current_user_id,
        receiver_id=receiver_id,
        content=content,
        media_url=media_url,
        media_type=media_type
    )
    
    db.session.add(new_msg)
    db.session.commit()
    
    # Auto-reply logic for Demo
    try:
        auto_reply = DirectMessage(
            sender_id=receiver_id,
            receiver_id=current_user_id,
            content=f"Thanks for your message! This is an automated response for the demo."
        )
        db.session.add(auto_reply)
        db.session.commit()
    except Exception as e:
        # Don't fail the original message if auto-reply fails
        print(f"Auto-reply failed: {e}")
    
    return jsonify(new_msg.to_dict()), 201
