
import base64
import json
import logging
from flask import request
from flask_jwt_extended import decode_token

logger = logging.getLogger("AuthUtils")

def get_user_id_from_header():
    """
    Extracts userId from the Authorization header.
    Supports:
    1. Real JWT tokens (Flask-JWT-Extended)
    2. Mock tokens (Base64 encoded JSON)
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        # Fallback to query params or form data for some demo cases
        return request.args.get('userId') or request.form.get('userId')
    
    parts = auth_header.split()
    if parts[0].lower() != 'bearer' or len(parts) != 2:
        return None
        
    token = parts[1]
    
    # 1. Try real JWT first
    try:
        decoded = decode_token(token)
        return decoded.get('sub') or decoded.get('identity')
    except Exception as e:
        # 2. Try mock token (Base64)
        try:
            # Add padding if necessary
            missing_padding = len(token) % 4
            if missing_padding:
                token += '=' * (4 - missing_padding)
            
            decoded_bytes = base64.b64decode(token)
            data = json.loads(decoded_bytes.decode('utf-8'))
            return data.get('userId')
        except Exception as mock_e:
            logger.debug(f"Failed to decode token as either JWT or Mock: {e}, {mock_e}")
            return None
