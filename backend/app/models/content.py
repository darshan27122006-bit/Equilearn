from app import db
from datetime import datetime

class Content(db.Model):
    __tablename__ = 'content'
    
    content_id = db.Column(db.String(50), primary_key=True)
    subject = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    level = db.Column(db.String(20), nullable=False)
    language = db.Column(db.String(10), nullable=False)
    
    text = db.Column(db.Text, nullable=False) 
    simplified_text = db.Column(db.Text)
    explanation_text = db.Column(db.Text) # New
    allowed_languages = db.Column(db.String(255)) # New: comma-separated list of allowed languages
    
    original_file_url = db.Column(db.String(255))
    file_type = db.Column(db.String(10)) 
    
    classroom_id = db.Column(db.String(50), db.ForeignKey('classrooms.id'), nullable=True)
    uploaded_by = db.Column(db.String(50), db.ForeignKey('users.id'))
    approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # One-way relationships
    translations = db.relationship('Translation', backref='content', lazy='dynamic')
    quizzes = db.relationship('Quiz', backref='content', lazy='dynamic')
    
    def to_dict(self, include_translations=False):
        result = {
            'contentId': self.content_id,
            'subject': self.subject,
            'topic': self.topic,
            'level': self.level,
            'language': self.language,
            'text': self.text,
            'simplifiedText': self.simplified_text,
            'explanationText': self.explanation_text,
            'allowedLanguages': self.allowed_languages.split(',') if self.allowed_languages else [],
            'originalFileUrl': self.original_file_url,
            'fileType': self.file_type,
            'mediaUrl': self.original_file_url,
            'mediaType': self.file_type,
            'classroomId': self.classroom_id,
            'uploadedBy': self.uploaded_by,
            'teacherId': self.uploaded_by,
            'createdAt': self.created_at.isoformat()
        }
        
        if include_translations:
            # Hierarchy: Content languages > Classroom languages > All
            allowed = self.allowed_languages.split(',') if self.allowed_languages else []
            if not allowed and self.classroom and self.classroom.allowed_languages:
                allowed = self.classroom.allowed_languages.split(',')
                
            result['translations'] = {
                t.language: {
                    'text': t.translated_text,
                    'simplified': t.simplified_text,
                    'explanation': t.explanation_text,
                    'audioUrl': t.audio_url
                }
                for t in self.translations
                if not allowed or t.language in allowed or t.language == self.language
            }
        
        return result

class Translation(db.Model):
    __tablename__ = 'translations'
    
    id = db.Column(db.Integer, primary_key=True)
    content_id = db.Column(db.String(50), db.ForeignKey('content.content_id'))
    language = db.Column(db.String(10), nullable=False)
    translated_text = db.Column(db.Text, nullable=False)
    simplified_text = db.Column(db.Text)
    explanation_text = db.Column(db.Text) # New
    audio_url = db.Column(db.String(255)) # New
