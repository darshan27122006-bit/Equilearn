
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
    institution_id = db.Column(db.String(50), nullable=True)
    
    learning_pace = db.Column(db.String(20), default='medium')
    preferred_style = db.Column(db.String(50), default='visual')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships from the other side will handle this
    # e.g. Classroom.teacher, Classroom.students, Content.uploader, etc.
    # We define one-way links in those models.

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
            'learningPace': self.learning_pace,
            'institutionId': self.institution_id,
            'createdAt': self.created_at.isoformat()
        }
