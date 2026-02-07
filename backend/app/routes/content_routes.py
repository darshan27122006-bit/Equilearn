
import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.utils.auth_utils import get_user_id_from_header
from app.models.content import Content, Translation
from app.models.user import User
from app.services.ocr_service import OCRService
from app.services.stt_service import STTService
from app.services.translation_service import TranslationService
from app.services.simplification_service import SimplificationService
from app.services.tts_service import TTSService
from app.services.chatbot_service import ChatbotService
import uuid

content_bp = Blueprint('content', __name__)
ocr_service = OCRService()
stt_service = STTService()
translation_service = TranslationService()
simplification_service = SimplificationService()
tts_service = TTSService()
chatbot_service = ChatbotService()

@content_bp.route('/', methods=['POST'])
def upload_content():
    user_id = get_user_id_from_header()
    if 'file' not in request.files and 'text' not in request.form:
        return jsonify({'error': 'No content provided'}), 400

    data = request.form
    text_content = data.get('text', '')
    original_file_url = None
    file_type = None

    # Handle File Upload & OCR / STT
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            original_file_url = filename
            file_type = filename.rsplit('.', 1)[1].lower()
            
            # Extract Text
            if file_type in ['mp4', 'mov', 'avi', 'mkv']:
                extracted_text = stt_service.extract_text_from_video(file_path, language=data.get('language', 'en'))
            else:
                extracted_text = ocr_service.extract_text(file_path, file_type)
                
            if extracted_text:
                # AI Fallback trigger for various failure patterns
                is_failed = (
                    extracted_text == "__OCR_FAILED__" or 
                    "OCR failed" in extracted_text or 
                    "Error extracting text" in extracted_text
                )
                
                if is_failed:
                    text_content = chatbot_service.generate_lesson_content(
                        topic=data.get('topic', 'Education'),
                        subject=data.get('subject', 'General'),
                        level=data.get('level', 'beginner')
                    )
                else:
                    text_content = extracted_text
    
    # Create Content Entry
    content = Content(
        content_id=str(uuid.uuid4()),
        subject=data['subject'],
        topic=data['topic'],
        level=data.get('level', 'beginner'),
        language=data.get('language', 'en'),
        text=text_content,
        classroom_id=data.get('classroomId'),
        uploaded_by=user_id,
        original_file_url=original_file_url,
        file_type=file_type,
        allowed_languages=data.get('allowedLanguages', '') # New
    )
    
    # Base Simplification (for original language)
    content.simplified_text = simplification_service.simplify_text(text_content, data.get('level', 'beginner'))
    
    db.session.add(content)
    db.session.commit()
    
    # Multilingual Processing
    target_langs = data.get('targetLanguages', '').split(',')
    if target_langs and target_langs[0]:
        translations = translation_service.translate_to_multiple(text_content, target_langs)
        for lang, t_text in translations.items():
            # Generate simplification for each translated language
            s_text = simplification_service.simplify_text(t_text, data.get('level', 'beginner'))
            trans = Translation(
                content_id=content.content_id, 
                language=lang, 
                translated_text=t_text,
                simplified_text=s_text
            )
            db.session.add(trans)
        db.session.commit()
    
    return jsonify({'success': True, 'content': content.to_dict()}), 201

@content_bp.route('/', methods=['GET'])
def get_contents():
    classroom_id = request.args.get('classroomId')
    if classroom_id:
        contents = Content.query.filter_by(classroom_id=classroom_id).all()
    else:
        # Public or teacher specific logic
        user_id = get_user_id_from_header()
        user = User.query.get(user_id)
        if user.role == 'student':
            # Students see content from their classes (handled by UI filtering usually or complex join)
             contents = Content.query.filter(Content.classroom_id.in_([c.id for c in user.enrolled_classrooms])).all()
        else:
             contents = Content.query.all()

    return jsonify({'success': True, 'contents': [c.to_dict(include_translations=True) for c in contents]})

    content = Content.query.get_or_404(content_id)
    return jsonify({'success': True, 'content': content.to_dict(include_translations=True)})

@content_bp.route('/tts', methods=['GET'])
def get_tts():
    text = request.args.get('text')
    lang = request.args.get('lang', 'en')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    audio_url = tts_service.generate_audio(text, lang)
    if audio_url:
        return jsonify({'success': True, 'audioUrl': audio_url})
    else:
        return jsonify({'error': 'Failed to generate audio'}), 500
