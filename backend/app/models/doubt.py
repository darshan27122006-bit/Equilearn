from app import db
from datetime import datetime

class DoubtMessage(db.Model):
    __tablename__ = 'doubt_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    thread_id = db.Column(db.String(50), db.ForeignKey('doubt_threads.id'))
    sender_id = db.Column(db.String(50), db.ForeignKey('users.id'))
    message = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), default='en') # For tracking language of doubt
    is_bot = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DoubtThread(db.Model):
    __tablename__ = 'doubt_threads'
    
    id = db.Column(db.String(50), primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'))
    content_id = db.Column(db.String(50), db.ForeignKey('content.content_id'))
    classroom_id = db.Column(db.String(50), db.ForeignKey('classrooms.id'), nullable=True)
    subject = db.Column(db.String(100))
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('DoubtMessage', backref='thread', lazy='dynamic')
