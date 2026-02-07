
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
