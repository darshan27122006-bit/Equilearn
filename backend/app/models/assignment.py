
from app import db
from datetime import datetime

class Assignment(db.Model):
    __tablename__ = 'assignments'
    
    id = db.Column(db.String(50), primary_key=True)
    classroom_id = db.Column(db.String(50), db.ForeignKey('classrooms.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_url = db.Column(db.String(255))
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    submissions = db.relationship('Submission', backref='assignment', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'classroomId': self.classroom_id,
            'title': self.title,
            'description': self.description,
            'fileUrl': self.file_url,
            'dueDate': self.due_date.isoformat() if self.due_date else None,
            'createdAt': self.created_at.isoformat()
        }

class Submission(db.Model):
    __tablename__ = 'submissions'
    
    id = db.Column(db.String(50), primary_key=True)
    assignment_id = db.Column(db.String(50), db.ForeignKey('assignments.id'), nullable=False)
    student_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    
    file_url = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='submitted')
    grade = db.Column(db.String(10))
    feedback = db.Column(db.Text)
    
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'assignmentId': self.assignment_id,
            'studentId': self.student_id,
            'fileUrl': self.file_url,
            'status': self.status,
            'grade': self.grade,
            'feedback': self.feedback,
            'submittedAt': self.submitted_at.isoformat()
        }
