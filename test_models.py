
import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app import create_app, db
    from app.models.user import User
    from app.models.dm import DirectMessage
    
    app = create_app()
    with app.app_context():
        # This will trigger model initialization and relationship setup
        print("Initializing models...")
        # Accessing a relationship to trigger its setup
        print(f"DirectMessage relationships: {DirectMessage.sender}, {DirectMessage.receiver}")
        print("Success! Models loaded correctly.")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"\nCaught Exception: {e}")
