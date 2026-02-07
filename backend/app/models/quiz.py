
from app import db
from datetime import datetime
import json

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    
    id = db.Column(db.String(50), primary_key=True)
    classroom_id = db.Column(db.String(50), db.ForeignKey('classrooms.id'), nullable=True) 
    content_id = db.Column(db.String(50), db.ForeignKey('content.content_id'), nullable=True) # Link to source content
    topic = db.Column(db.String(200), nullable=False)
    created_by = db.Column(db.String(50), db.ForeignKey('users.id')) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    questions = db.relationship('Question', backref='quiz', lazy='dynamic', cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'classroomId': self.classroom_id,
            'contentId': self.content_id,
            'topic': self.topic,
            'createdBy': self.created_at.isoformat() if hasattr(self, 'created_at') else None,
            'teacherId': self.created_by,
            'questionCount': self.questions.count(),
            'createdAt': self.created_at.isoformat()
        }

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default='mcq') # mcq, short_answer, riddle
    options = db.Column(db.Text) # JSON string of options ["A", "B", "C", "D"]
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text)
    
    def get_options(self):
        return json.loads(self.options) if self.options else []

    def to_dict(self):
        return {
            'id': self.id,
            'text': self.question_text,
            'type': self.question_type,
            'options': self.get_options(),
            'explanation': self.explanation
        }

class StudentQuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.String(50), db.ForeignKey('quizzes.id'), nullable=False)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'quizId': self.quiz_id,
            'studentId': self.student_id,
            'score': self.score,
            'total': self.total_questions,
            'completedAt': self.completed_at.isoformat()
        }
