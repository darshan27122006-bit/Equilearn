
import requests
import base64
import json
import time
import os

BASE_URL = "http://localhost:5000"

def get_mock_token(user_id):
    data = {"userId": user_id, "timestamp": int(time.time() * 1000)}
    json_str = json.dumps(data)
    return base64.b64encode(json_str.encode()).decode()

def test_ocr_fallback():
    teacher_id = "teacher-001"
    token = get_mock_token(teacher_id)
    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- Testing AI OCR Fallback ---")
    
    # Upload dummy image
    dummy_path = os.path.join("backend", "uploads", "dummy.jpg")
    if not os.path.exists(dummy_path):
        os.makedirs(os.path.dirname(dummy_path), exist_ok=True)
        with open(dummy_path, "w") as f:
            f.write("fake image data")

    files = {'file': ('dummy.jpg', open(dummy_path, 'rb'), 'image/jpeg')}
    data = {
        'topic': 'Photosynthesis',
        'subject': 'Biology',
        'level': 'beginner',
        'language': 'en'
    }
    
    print(f"Uploading {data['topic']} lesson with image...")
    res = requests.post(f"{BASE_URL}/api/content/", data=data, files=files, headers=headers)
    
    if res.status_code == 201:
        content = res.json().get('content', {})
        text = content.get('text', '')
        print("\n✅ Upload Successfully!")
        print(f"Topic: {content.get('topic')}")
        print("-" * 30)
        print("EXTRACTED TEXT (AI GENERATED FALLBACK):")
        print(text[:300] + "...")
        print("-" * 30)
        
        if "AI Assistant" in text or "generative" in text or "Photosynthesis" in text:
            if "__OCR_FAILED__" not in text:
                print("\n✅ SUCCESS: AI Fallback triggered correctly!")
            else:
                print("\n❌ FAILURE: Marker leaked into text.")
        else:
            print("\n❌ FAILURE: Unexpected text content.")
    else:
        print(f"❌ Failed! Status: {res.status_code}, Response: {res.text}")

if __name__ == "__main__":
    time.sleep(10) # Wait for backend
    test_ocr_fallback()
