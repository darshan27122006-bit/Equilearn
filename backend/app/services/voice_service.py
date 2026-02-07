
import os
try:
    from gtts import gTTS
    import speech_recognition as sr
except ImportError:
    pass

class VoiceService:
    def __init__(self):
        self.recognizer = sr.Recognizer() if 'sr' in globals() else None

    def text_to_speech(self, text, language, output_path):
        """
        Convert text to speech using gTTS
        language: en, hi, ta, etc.
        """
        if not text:
            return None
            
        try:
            # Mapping custom language codes to gTTS codes if needed
            lang_map = {
                'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te', 
                'kn': 'kn', 'ml': 'ml', 'bn': 'bn', 'mr': 'mr',
                'gu': 'gu', 'ur': 'ur', 'pa': 'pa'
            }
            gtts_lang = lang_map.get(language, 'en')
            
            # Save to file
            tts = gTTS(text=text, lang=gtts_lang, slow=False)
            tts.save(output_path)
            return True
        except Exception as e:
            print(f"TTS Error: {e}")
            return False

    def speech_to_text(self, audio_path, language='en'):
        """
        Convert speech to text using Google Speech Recognition (Free tier)
        """
        if not self.recognizer:
            return "[Error] Speech recognition library not loaded."
            
        try:
            with sr.AudioFile(audio_path) as source:
                audio_data = self.recognizer.record(source)
                # Helper to map language codes to Google Speech code
                # e.g., 'hi' -> 'hi-IN'
                lang_code = f"{language}-IN" if language != 'en' else 'en-US'
                
                text = self.recognizer.recognize_google(audio_data, language=lang_code)
                return text
        except sr.UnknownValueError:
            return "" # Could not understand audio
        except sr.RequestError as e:
            return f"Could not request results; {e}"
        except Exception as e:
            print(f"STT Error: {e}")
            return f"Error processing audio: {str(e)}"
