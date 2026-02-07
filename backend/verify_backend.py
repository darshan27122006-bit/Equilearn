import requests
import json
import time
import os

BASE_URL = "http://localhost:5000"

# Note: This test assumes the backend is running and a user is logged in.
# Since I can't easily handle login in a generic script without credentials,
# I'll mock the logic or assume a test token.
# For this verification, I'll focus on checking the service logic if possible, 
# or just provide the script for the user.

def test_flow():
    print("Starting EquiLearn Backend Verification...")
    
    # 1. OCR Check (Mock path)
    print("\n[1] Testing OCR Service...")
    from app.services.ocr_service import OCRService
    ocr = OCRService()
    # Assuming there's a sample file or we just test the logic with a non-existent file error handling
    res = ocr.extract_text("dummy.pdf", "pdf")
    print(f"OCR Result (Expected Error/Fallback): {res[:100]}...")

    # 2. Translation Check
    print("\n[2] Testing Translation Service (Marathi)...")
    from app.services.translation_service import TranslationService
    trans = TranslationService()
    # Note: Model loading might take time
    hindi_text = trans.translate_text("Hello, how are you?", "hi")
    marathi_text = trans.translate_text("Education is the key to success.", "mr")
    print(f"Hindi: {hindi_text}")
    print(f"Marathi: {marathi_text}")

    # 3. Simplification Check
    print("\n[3] Testing Simplification Service...")
    from app.services.simplification_service import SimplificationService
    simp = SimplificationService()
    simple = simp.simplify_text("Photosynthesis is the process by which plants make food using sunlight.", level="very easy")
    detailed = simp.simplify_text("Photosynthesis is the process by which plants make food using sunlight.", level="detailed")
    print(f"Very Easy: {simple}")
    print(f"Detailed: {detailed}")

    # 4. Chatbot RAG Check
    print("\n[4] Testing Chatbot RAG Service...")
    from app.services.chatbot_service import ChatbotService
    bot = ChatbotService()
    context = "The capital of France is Paris. It is known for the Eiffel Tower."
    response = bot.get_response("What is the capital of France?", context)
    print(f"Chatbot Response: {response}")

    # 5. TTS Check
    print("\n[5] Testing TTS Service (Actual Generation)...")
    from app.services.tts_service import TTSService
    from flask import Flask
    
    test_app = Flask(__name__)
    test_app.config['UPLOAD_FOLDER'] = 'uploads'
    
    with test_app.app_context():
        tts = TTSService()
        audio_url = tts.generate_audio("This is a verification test of text to speech.", "en")
        if audio_url:
            print(f"TTS Success! Audio URL: {audio_url}")
            # Check if file exists
            filename = audio_url.split('/')[-1]
            full_path = os.path.join('uploads', filename)
            if os.path.exists(full_path):
                print(f"Verified: File exists at {full_path}")
            else:
                print(f"Error: Service returned URL {audio_url} but file NOT found at {full_path}")
        else:
            print("TTS Failed: generate_audio returned None")

    print("\nVerification Complete!")

if __name__ == "__main__":
    test_flow()
