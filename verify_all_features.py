
import requests
import base64
import json
import time

BASE_URL = "http://localhost:5000"

def get_mock_token(user_id):
    data = {"userId": user_id, "timestamp": int(time.time() * 1000)}
    json_str = json.dumps(data)
    return base64.b64encode(json_str.encode()).decode()

def test_features():
    teacher_id = "teacher-001"
    student_id = "student-001"
    token = get_mock_token(teacher_id)
    headers = {"Authorization": f"Bearer {token}"}

    print(f"--- Testing with User: {teacher_id} ---")

    # 1. Test Classroom Creation
    print("\n1. Testing Classroom Creation...")
    payload = {
        "name": "Verification Class " + str(int(time.time())),
        "subject": "Science",
        "description": "Verification of fixes",
        "allowedLanguages": ["en", "hi"]
    }
    # Using trailing slash to match @bp.route('/')
    res = requests.post(f"{BASE_URL}/api/classrooms/", json=payload, headers=headers)
    if res.status_code == 201:
        classroom = res.json().get('classroom', {})
        class_id = classroom.get('id')
        print(f"✅ Success! Created Classroom ID: {class_id}")
    else:
        print(f"❌ Failed! Status: {res.status_code}, Response: {res.text}")
        return

    # 2. Test Messaging & Auto-Reply
    print("\n2. Testing Messaging & Auto-Reply...")
    # Send message from teacher to student
    payload = {
        "sender_id": teacher_id,
        "receiver_id": student_id,
        "content": "Hello for verification"
    }
    # Using multipart/form-data
    files = {'file': (None, '')}
    res = requests.post(f"{BASE_URL}/api/dm/send", data=payload, files=files, headers=headers)
    
    if res.status_code == 201:
        print("✅ Message sent successfully!")
        
        # Wait a moment for auto-reply
        time.sleep(1)
        
        # Check messages for the student
        res = requests.get(f"{BASE_URL}/api/dm/messages/{student_id}?sender_id={teacher_id}", headers=headers)
        if res.status_code == 200:
            messages = res.json()
            # Look for auto-reply (sent from student to teacher in response)
            found_auto = any("automated response" in m['content'].lower() for m in messages)
            if found_auto:
                print("✅ Auto-reply detected in conversation!")
            else:
                print("❌ Auto-reply NOT found.")
        else:
             print(f"❌ Failed to fetch messages: {res.status_code}")
    else:
        print(f"❌ Failed to send message: {res.status_code}, Response: {res.text}")

    # 3. Test TTS
    print("\n3. Testing TTS Generation...")
    payload = {"text": "Verification Success", "language": "en"}
    res = requests.post(f"{BASE_URL}/api/ai/generate_audio", json=payload, headers=headers)
    if res.status_code == 200:
        audio_url = res.json().get('audio_url')
        print(f"✅ TTS Success! Audio URL: {audio_url}")
    else:
        print(f"❌ TTS Failed! Status: {res.status_code}, Response: {res.text}")

if __name__ == "__main__":
    try:
        test_features()
    except Exception as e:
        print(f"Verification Script Error: {e}")
