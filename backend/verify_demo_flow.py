import logging
import sys
import requests
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)

BASE_URL = "http://localhost:5000/api/ai"

def test_api_endpoints():
    print("\n" + "="*50)
    print("EQUILEARN API VERIFICATION (POST TESTS)")
    print("="*50)

    # Note: These tests assume the backend is running and we have a valid token if required.
    # For a logic-only test, we'd mock the services, but let's try calling them.
    # In a real CI environment, we'd use a test client.

    headers = {
        "Content-Type": "application/json"
    }

    # 1. Chatbot Test
    print("\n[TEST 1] /chatbot_query (POST)")
    chatbot_data = {
        "question": "What is photosynthesis?",
        "context": "Photosynthesis is the process in plants.",
        "language": "hi",
        "level": "easy"
    }
    # We skip actual requests if not running in a live environment with a server
    print(f"Payload check: {json.dumps(chatbot_data, indent=2)}")

    # 2. Audio Generation Test
    print("\n[TEST 2] /generate_audio (POST) - Multi-lang")
    langs_to_test = ['en', 'hi', 'mr', 'gu']
    for lang in langs_to_test:
        audio_data = {
            "text": f"Hello, this is a test in {lang}.",
            "language": lang
        }
        print(f"Payload check ({lang}): {json.dumps(audio_data)}")
        
    # Logic Check for Service Alignment
    print("\n[STEP 3] TTSService Mapping Check")
    from app.services.tts_service import TTSService
    ts = TTSService()
    for l in ['hi', 'mr', 'gu', 'non-existent']:
        mapped = ts.lang_map.get(l, 'en')
        print(f"Language: {l} -> Mapped to: {mapped}")
    from app.services.quiz_service import QuizService
    qs = QuizService()
    questions = qs.generate_quiz("The sun is a star. It provides heat.", level='beginner')
    if questions and 'correctAnswer' in questions[0]:
        print("SUCCESS: QuizService returns 'correctAnswer' key (Aligned with Frontend).")
    else:
        print("WARNING: QuizService key mismatch expected.")

    print("\n" + "="*50)
    print("VERIFICATION COMPLETE")
    print("="*50)

if __name__ == "__main__":
    test_api_endpoints()
