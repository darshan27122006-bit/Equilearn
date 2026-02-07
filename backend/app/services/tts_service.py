import os
import hashlib
import logging
from gtts import gTTS
from flask import current_app

logger = logging.getLogger("TTSService")

class TTSService:
    def __init__(self):
        # Support for broader set of gTTS languages
        self.lang_map = {
            'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te', 
            'kn': 'kn', 'ml': 'ml', 'bn': 'bn', 'mr': 'mr',
            'gu': 'gu', 'pa': 'pa', 'ur': 'ur', 'ne': 'ne',
            'as': 'as', 'or': 'or', 'sa': 'sa', 'sd': 'sd',
            'kok': 'kok', 'mai': 'mai', 'brx': 'brx', 'mni': 'mni'
        }

    def generate_audio(self, text, lang='en'):
        """
        Generate audio with caching and logging
        """
        if not text:
            return None

        # Normalize lang with fallback
        target_lang = self.lang_map.get(lang)
        if not target_lang:
            logger.warning(f"DEMO LOG: Language {lang} not in mapping, falling back to English")
            target_lang = 'en'
        
        logger.info(f"DEMO LOG: Audio Generation -> Lang: {lang} (Target: {target_lang})")
        logger.info(f"DEMO LOG: Text to Audio Snippet: {text[:50]}...")

        try:
            text_hash = hashlib.md5(text.encode()).hexdigest()
            filename = f"tts_{target_lang}_{text_hash}.mp3"
            
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)

            if os.path.exists(file_path):
                logger.info(f"DEMO LOG: Audio Cache Hit: {filename}")
                return f"/media/audio/{filename}"

            logger.info(f"DEMO LOG: Creating New Audio File: {filename}")
            tts = gTTS(text=text, lang=target_lang, slow=False)
            tts.save(file_path)
            
            return f"/media/audio/{filename}"
            
        except Exception as e:
            logger.error(f"DEMO LOG ERROR: TTS failed for {lang}: {e}")
            return None
