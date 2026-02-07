# Backend Implementation Guide

Complete guide for implementing the Python backend for the Multilingual Learning Assistant.

## Technology Stack

### Core Technologies
- **Framework**: Flask or Django REST Framework
- **Database**: PostgreSQL (recommended) or SQLite (development)
- **Authentication**: JWT (PyJWT)
- **AI/ML**: HuggingFace Transformers, Google Translate API
- **Speech**: Google Cloud Speech-to-Text, Text-to-Speech

### Additional Libraries
```python
# Core
flask==3.0.0
flask-cors==4.0.0
flask-jwt-extended==4.6.0
flask-sqlalchemy==3.1.1
psycopg2-binary==2.9.9

# AI/ML
transformers==4.36.0
torch==2.1.2
googletrans==4.0.0
langdetect==1.0.9

# Google Cloud
google-cloud-translate==3.14.0
google-cloud-speech==2.24.0
google-cloud-texttospeech==2.15.0

# Utils
python-dotenv==1.0.0
bcrypt==4.1.2
requests==2.31.0
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── content.py
│   │   ├── progress.py
│   │   └── institution.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── content.py
│   │   ├── progress.py
│   │   ├── ai_services.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── translation_service.py
│   │   ├── simplification_service.py
│   │   ├── speech_service.py
│   │   └── question_answering.py
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── decorators.py
│   │   └── validators.py
│   └── middleware/
│       ├── __init__.py
│       └── auth_middleware.py
├── migrations/
├── tests/
├── requirements.txt
├── run.py
└── .env
```

## 1. Application Configuration

### app/config.py

```python
import os
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://user:password@localhost:5432/mlassistant'
    )
    
    # AI Services
    GOOGLE_TRANSLATE_API_KEY = os.getenv('GOOGLE_TRANSLATE_API_KEY')
    HUGGINGFACE_API_KEY = os.getenv('HUGGINGFACE_API_KEY')
    GOOGLE_CLOUD_PROJECT = os.getenv('GOOGLE_CLOUD_PROJECT')
    
    # File Upload
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'mp3', 'wav', 'mp4'}
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
```

## 2. Database Models

### app/models/user.py

```python
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # admin, teacher, student
    language = db.Column(db.String(10), nullable=False, default='en')
    institution_id = db.Column(db.String(50), db.ForeignKey('institutions.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    institution = db.relationship('Institution', backref='users')
    content_uploaded = db.relationship('Content', backref='uploader', lazy='dynamic')
    progress = db.relationship('Progress', backref='student', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'language': self.language,
            'institutionId': self.institution_id,
            'createdAt': self.created_at.isoformat()
        }
```

### app/models/content.py

```python
from app import db
from datetime import datetime

class Content(db.Model):
    __tablename__ = 'content'
    
    content_id = db.Column(db.String(50), primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    level = db.Column(db.String(20), nullable=False)  # beginner, intermediate, advanced
    language = db.Column(db.String(10), nullable=False)
    text = db.Column(db.Text, nullable=False)
    simplified_text = db.Column(db.Text)
    uploaded_by = db.Column(db.String(50), db.ForeignKey('users.id'))
    approved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    translations = db.relationship('Translation', backref='content', lazy='dynamic')
    
    def to_dict(self, include_translations=False):
        result = {
            'contentId': self.content_id,
            'subject': self.subject,
            'topic': self.topic,
            'level': self.level,
            'language': self.language,
            'text': self.text,
            'simplifiedText': self.simplified_text,
            'uploadedBy': self.uploaded_by,
            'approved': self.approved,
            'createdAt': self.created_at.isoformat()
        }
        
        if include_translations:
            result['translations'] = {
                t.language: t.translated_text 
                for t in self.translations
            }
        
        return result

class Translation(db.Model):
    __tablename__ = 'translations'
    
    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.String(50), db.ForeignKey('content.content_id'))
    language = db.Column(db.String(10), nullable=False)
    translated_text = db.Column(db.Text, nullable=False)
```

### app/models/progress.py

```python
from app import db
from datetime import datetime

class Progress(db.Model):
    __tablename__ = 'progress'
    
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'))
    content_id = db.Column(db.String(50), db.ForeignKey('content.content_id'))
    topic = db.Column(db.String(200))
    completion = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'studentId': self.student_id,
            'contentId': self.content_id,
            'topic': self.topic,
            'completion': self.completion,
            'score': self.score,
            'lastAccessed': self.last_accessed.isoformat()
        }
```

### app/models/institution.py

```python
from app import db
from datetime import datetime

class Institution(db.Model):
    __tablename__ = 'institutions'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    admin_id = db.Column(db.String(50), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'adminId': self.admin_id,
            'createdAt': self.created_at.isoformat()
        }
```

## 3. Authentication Routes

### app/routes/auth.py

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    required_fields = ['name', 'email', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    # Check if email exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        id=f"{data['role']}-{uuid.uuid4().hex[:8]}",
        name=data['name'],
        email=data['email'],
        role=data['role'],
        language=data.get('language', 'en'),
        institution_id=data.get('institutionId')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict(),
            'token': access_token,
            'refreshToken': refresh_token
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data.get('email') or not data.get('password'):
        return jsonify({'success': False, 'error': 'Email and password required'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'success': True,
        'data': {
            'user': user.to_dict(),
            'token': access_token,
            'refreshToken': refresh_token
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    
    return jsonify({
        'success': True,
        'data': {
            'token': access_token
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # In production, add token to blacklist
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    }), 200
```

## 4. AI Services

### app/services/translation_service.py

```python
from googletrans import Translator
from google.cloud import translate_v2 as translate
import os

class TranslationService:
    def __init__(self):
        self.use_google_cloud = bool(os.getenv('GOOGLE_CLOUD_PROJECT'))
        
        if self.use_google_cloud:
            self.translator = translate.Client()
        else:
            self.translator = Translator()
    
    def translate_text(self, text, target_language, source_language='auto'):
        """Translate text to target language"""
        try:
            if self.use_google_cloud:
                result = self.translator.translate(
                    text,
                    target_language=target_language,
                    source_language=source_language
                )
                return result['translatedText']
            else:
                result = self.translator.translate(
                    text,
                    dest=target_language,
                    src=source_language
                )
                return result.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def detect_language(self, text):
        """Detect language of text"""
        try:
            if self.use_google_cloud:
                result = self.translator.detect_language(text)
                return result['language']
            else:
                result = self.translator.detect(text)
                return result.lang
        except Exception as e:
            print(f"Detection error: {e}")
            return 'en'
    
    def translate_to_multiple(self, text, target_languages):
        """Translate text to multiple languages"""
        translations = {}
        for lang in target_languages:
            translations[lang] = self.translate_text(text, lang)
        return translations
```

### app/services/simplification_service.py

```python
from transformers import pipeline
import re

class SimplificationService:
    def __init__(self):
        # In production, use a proper text simplification model
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    
    def simplify_text(self, text, level='beginner'):
        """Simplify text based on difficulty level"""
        try:
            if level == 'advanced':
                return text
            
            # Split into sentences
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            
            if level == 'beginner':
                # Take first 2-3 sentences and simplify
                text_subset = '. '.join(sentences[:3])
                
                if len(text_subset) > 100:
                    # Use summarization for simplification
                    result = self.summarizer(
                        text_subset,
                        max_length=100,
                        min_length=30,
                        do_sample=False
                    )
                    return result[0]['summary_text']
                return text_subset
            
            elif level == 'intermediate':
                # Use more content but still simplified
                text_subset = '. '.join(sentences[:5])
                
                if len(text_subset) > 200:
                    result = self.summarizer(
                        text_subset,
                        max_length=200,
                        min_length=50,
                        do_sample=False
                    )
                    return result[0]['summary_text']
                return text_subset
            
            return text
        
        except Exception as e:
            print(f"Simplification error: {e}")
            return text
```

### app/services/question_answering.py

```python
from transformers import pipeline

class QuestionAnsweringService:
    def __init__(self):
        self.qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2"
        )
    
    def answer_question(self, question, context):
        """Generate answer to question based on context"""
        try:
            result = self.qa_pipeline(
                question=question,
                context=context
            )
            return result['answer']
        except Exception as e:
            print(f"QA error: {e}")
            return "I'm sorry, I couldn't find an answer to that question in the content."
```

## 5. Content Routes

### app/routes/content.py

```python
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.content import Content, Translation
from app.models.user import User
from app.services.translation_service import TranslationService
from app.services.simplification_service import SimplificationService
import uuid

content_bp = Blueprint('content', __name__)
translation_service = TranslationService()
simplification_service = SimplificationService()

@content_bp.route('/content', methods=['GET'])
@jwt_required()
def get_content():
    # Get query parameters
    subject = request.args.get('subject')
    level = request.args.get('level')
    approved = request.args.get('approved')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    
    # Build query
    query = Content.query
    
    if subject:
        query = query.filter_by(subject=subject)
    if level:
        query = query.filter_by(level=level)
    if approved is not None:
        query = query.filter_by(approved=approved == 'true')
    
    # Paginate
    pagination = query.paginate(page=page, per_page=limit)
    
    return jsonify({
        'success': True,
        'data': {
            'content': [c.to_dict() for c in pagination.items],
            'pagination': {
                'page': page,
                'limit': limit,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }
    }), 200

@content_bp.route('/content/<content_id>', methods=['GET'])
@jwt_required()
def get_content_by_id(content_id):
    content = Content.query.get(content_id)
    
    if not content:
        return jsonify({'success': False, 'error': 'Content not found'}), 404
    
    return jsonify({
        'success': True,
        'data': content.to_dict(include_translations=True)
    }), 200

@content_bp.route('/content', methods=['POST'])
@jwt_required()
def create_content():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role not in ['teacher', 'admin']:
        return jsonify({'success': False, 'error': 'Forbidden'}), 403
    
    data = request.get_json()
    
    # Create content
    content = Content(
        content_id=f"content-{uuid.uuid4().hex[:8]}",
        subject=data['subject'],
        topic=data['topic'],
        level=data['level'],
        language=data.get('language', 'en'),
        text=data['text'],
        uploaded_by=user_id,
        approved=False
    )
    
    # Simplify text
    content.simplified_text = simplification_service.simplify_text(
        data['text'],
        data['level']
    )
    
    db.session.add(content)
    db.session.flush()
    
    # Translate to target languages
    target_languages = data.get('targetLanguages', ['en'])
    translations = translation_service.translate_to_multiple(
        data['text'],
        target_languages
    )
    
    for lang, translated_text in translations.items():
        translation = Translation(
            content_id=content.content_id,
            language=lang,
            translated_text=translated_text
        )
        db.session.add(translation)
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': content.to_dict()
    }), 201

@content_bp.route('/content/<content_id>/approve', methods=['POST'])
@jwt_required()
def approve_content(content_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'success': False, 'error': 'Forbidden'}), 403
    
    content = Content.query.get(content_id)
    if not content:
        return jsonify({'success': False, 'error': 'Content not found'}), 404
    
    content.approved = True
    db.session.commit()
    
    return jsonify({
        'success': True,
        'data': content.to_dict()
    }), 200
```

## 6. Main Application

### app/__init__.py

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'development':
        from app.config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    elif config_name == 'production':
        from app.config import ProductionConfig
        app.config.from_object(ProductionConfig)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.content import content_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(content_bp, url_prefix='/api')
    
    return app
```

### run.py

```python
from app import create_app, db
import os

app = create_app(os.getenv('FLASK_ENV', 'development'))

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=True
    )
```

## 7. Installation & Running

### requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
flask-jwt-extended==4.6.0
flask-sqlalchemy==3.1.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
bcrypt==4.1.2
transformers==4.36.0
torch==2.1.2
googletrans==4.0.0
langdetect==1.0.9
google-cloud-translate==3.14.0
```

### .env

```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/mlassistant
GOOGLE_TRANSLATE_API_KEY=your-google-api-key
GOOGLE_CLOUD_PROJECT=your-project-id
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Installation Steps

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
>>> exit()

# Run the application
python run.py
```

## 8. Docker Deployment

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "run:app"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mlassistant
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mlassistant
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

**Backend Version**: 1.0  
**Python Version**: 3.11+  
**Last Updated**: February 2, 2026
