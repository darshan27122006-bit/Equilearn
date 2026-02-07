
import sqlite3
import os

def search_dbs():
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.db'):
                path = os.path.join(root, file)
                try:
                    conn = sqlite3.connect(path)
                    cursor = conn.cursor()
                    # Check if table exists
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='content'")
                    if cursor.fetchone():
                        cursor.execute("SELECT topic, text FROM content WHERE topic LIKE '%Wave%' OR text LIKE '%OCR_FAILED%'")
                        results = cursor.fetchall()
                        if results:
                            print(f"\nFOUND AT: {os.path.abspath(path)}")
                            for topic, text in results:
                                print(f"  Topic: [{topic}]")
                                print(f"  Text: [{text[:50]}...]")
                    conn.close()
                except Exception as e:
                    pass

if __name__ == "__main__":
    search_dbs()
