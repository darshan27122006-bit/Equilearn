import whisper
import os

class STTService:
    def __init__(self):
        # We'll use the 'base' model for a balance of speed and accuracy
        # In a real app, this could be 'medium' or 'large' for better quality
        self.model = None

    def _load_model(self):
        if self.model is None:
            self.model = whisper.load_model("base")

    def extract_text_from_video(self, video_path, language='en'):
        """
        Extract audio from video/audio and convert to text using OpenAI Whisper
        """
        try:
            self._load_model()
            
            # Whisper can handle video files directly if ffmpeg is installed
            # It also handles language detection or specific language segments
            
            result = self.model.transcribe(video_path, task="transcribe")
            return result.get("text", "").strip()
            
        except Exception as e:
            print(f"Whisper STT Error: {e}")
            return f"Error extracting text from media: {str(e)}"
