import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.content import Content, Translation
from app.services.ocr_service import OCRService
from app.services.stt_service import STTService
from app.services.chatbot_service import ChatbotService
from app.services.quiz_service import QuizService
from app.services.translation_service import TranslationService
from app.services.simplification_service import SimplificationService
from app.services.tts_service import TTSService
import logging

logger = logging.getLogger("AI_Routes")
ai_bp = Blueprint('ai', __name__)

# Initialize services
ocr_service = OCRService()
stt_service = STTService()
chatbot_service = ChatbotService()
quiz_service = QuizService()
translation_service = TranslationService()
simplification_service = SimplificationService()
tts_service = TTSService()

@ai_bp.route('/chatbot_query', methods=['POST'])
def chatbot_query():
    try:
        data = request.get_json()
        logger.info(f"DEMO LOG: Chatbot request received for text length: {len(data.get('text', ''))}")
        question = data.get('question')
        content_id = data.get('contentId')
        language = data.get('language', 'en')
        level = data.get('level', 'medium')
        
        logger.info(f"DEMO API: /chatbot_query | Lang: {language} | Level: {level}")
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
            
        context = ""
        try:
            if content_id:
                content = Content.query.get(content_id)
                if content:
                    # Issue 2: Combine original and simplified text for better grounding
                    context = f"Original Lesson: {content.text}\n\nSimplified Overview: {content.simplified_text or ''}"
            
            # Fallback if context is still empty
            if not context:
                logger.warning("DEMO LOG: Missing context for chatbot, providing safe fallback.")
                context = "This is a general educational support query."

            response = chatbot_service.get_response(question, context, level, language)
            return jsonify({'success': True, 'response': response})
        except Exception as e:
            logger.error(f"DEMO API ERROR: Chatbot query failed: {e}")
            return jsonify({
                'success': False, 
                'response': "I encounterd a system glitch. Please stick to current lesson content.",
                'error': str(e)
            }), 500
    except Exception as e:
        logger.error(f"DEMO API ERROR: Chatbot request processing failed: {e}")
        return jsonify({
            'success': False, 
            'response': "I encounterd a system glitch. Please try again later.",
            'error': str(e)
        }), 500

@ai_bp.route('/extract_text', methods=['POST'])
def extract_text():
    logger.info("DEMO LOG: OCR Text Extraction request received")
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    filename = secure_filename(file.filename)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    file_type = filename.rsplit('.', 1)[1].lower()
    logger.info(f"DEMO API: /extract_text | File: {filename} | Type: {file_type}")
    
    try:
        if file_type in ['mp4', 'mov', 'avi', 'mkv', 'wav', 'mp3']:
            text = stt_service.extract_text_from_video(file_path)
        else:
            text = ocr_service.extract_text(file_path, file_type)
        
        logger.info(f"DEMO API: Extracted {len(text)} characters.")
        # Return filename as originalFileUrl so frontend can save it
        return jsonify({
            'success': True, 
            'text': text,
            'originalFileUrl': filename,
            'fileType': file_type
        })
    except Exception as e:
        logger.error(f"DEMO API ERROR: Extraction failed: {e}")
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/reconstruct_lesson', methods=['POST'])
def reconstruct_lesson():
    """AI Fallback: Generate real content when OCR fails"""
    try:
        data = request.get_json()
        topic = data.get('topic', 'Education')
        subject = data.get('subject', 'General')
        level = data.get('level', 'beginner')
        
        logger.info(f"DEMO AI: Reconstructing lesson for {topic} ({subject}, {level})")
        
        content = chatbot_service.generate_lesson_content(
            topic=topic,
            subject=subject,
            level=level
        )
        
        return jsonify({
            'success': True,
            'text': content
        })
    except Exception as e:
        logger.error(f"DEMO AI ERROR: Reconstruction failed: {e}")
        return jsonify({'error': str(e)}), 500

@ai_bp.route('/simplify_text', methods=['POST'])
def simplify_text():
    data = request.get_json()
    logger.info(f"DEMO LOG: Text Simplification request received for level: {data.get('level')}")
    text = data.get('text')
    level = data.get('level', 'medium')
    
    logger.info(f"DEMO API: /simplify_text | Level: {level}")
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    simplified = simplification_service.simplify_text(text, level)
    return jsonify({'success': True, 'simplifiedText': simplified})

@ai_bp.route('/translate_text', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text')
    target_languages = data.get('targetLanguages', [])
    target_language = data.get('targetLanguage')
    
    logger.info(f"DEMO LOG: Translation request received. Multi: {target_languages}, Single: {target_language}")
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # If single target language provided
    if target_language:
        translated = translation_service.translate_text(text, target_language)
        return jsonify({'success': True, 'translatedText': translated})
    
    # If multiple target languages provided
    if target_languages:
        translations = {}
        for lang in target_languages:
            # We return an object with a 'text' property to match the frontend expectations for TranslationData
            translated_text = translation_service.translate_text(text, lang)
            translations[lang] = {'text': translated_text}
        return jsonify({'success': True, 'translations': translations})
        
    return jsonify({'error': 'No target language(s) provided'}), 400

@ai_bp.route('/generate_audio', methods=['POST'])
def generate_audio():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        text = data.get('text')
        language = data.get('language', 'en')
        
        logger.info(f"DEMO LOG: Audio generation request received for lang: {language}")
        
        logger.info(f"DEMO API: /generate_audio | Lang: {language} | Text snippet: {text[:30] if text else 'None'}")
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        audio_url = tts_service.generate_audio(text, language)
        if audio_url:
            # Issue 1: Return "audio_url" key as required
            logger.info(f"Audio generated successfully: {audio_url}")
            return jsonify({'success': True, 'audio_url': audio_url})
        else:
            logger.error("TTS service failed to generate audio")
            return jsonify({'error': 'Failed to generate audio'}), 500
    except Exception as e:
        logger.exception(f"DEMO API ERROR: Audio generation failed: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error during audio generation',
            'details': str(e)
        }), 500

@ai_bp.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.get_json()
    logger.info("DEMO LOG: Quiz generation request received")
    text = data.get('text')
    level = data.get('level', 'medium')
    
    logger.info(f"DEMO API: /generate_quiz | Level: {level}")
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    questions = quiz_service.generate_quiz(text, level)
    return jsonify({'success': True, 'questions': questions})
