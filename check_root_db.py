
import sqlite3
import os

db_path = r'C:\Users\deepa\OneDrive\Desktop\multi\mlassistant.db'
if not os.path.exists(db_path):
    print(f"FAILED: {db_path} does not exist.")
    exit(1)

conn = sqlite3.connect(db_path)
print(f"Connected to {db_path}")

try:
    # 1. Check topics
    cursor = conn.execute("SELECT topic, text FROM content")
    rows = cursor.fetchall()
    print(f"Found {len(rows)} content records.")
    for topic, text in rows:
        print(f"Topic: [{topic}], Text snippet: [{text[:30]}]")
        
    # 2. Check users
    cursor = conn.execute("SELECT id, email FROM users")
    users = cursor.fetchall()
    print(f"\nFound {len(users)} users.")
    for id, email in users:
        print(f"User: {id} ({email})")

except Exception as e:
    print(f"SQL Error: {e}")
finally:
    conn.close()
