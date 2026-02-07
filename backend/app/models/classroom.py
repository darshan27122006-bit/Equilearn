
from app import db
from datetime import datetime

# Association table for Student-Classroom Many-to-Many
classroom_students = db.Table('classroom_students',
    db.Column('classroom_id', db.String(50), db.ForeignKey('classrooms.id'), primary_key=True),
    db.Column('student_id', db.String(50), db.ForeignKey('users.id'), primary_key=True)
)

# New: Association table for Teacher-Classroom Many-to-Many
classroom_teachers = db.Table('classroom_teachers',
    db.Column('classroom_id', db.String(50), db.ForeignKey('classrooms.id'), primary_key=True),
    db.Column('teacher_id', db.String(50), db.ForeignKey('users.id'), primary_key=True)
)

class Classroom(db.Model):
    __tablename__ = 'classrooms'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255))
    
    # Original teacher_id kept for backward compatibility (Lead Teacher)
    teacher_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True)
    
    # New: Track creator admin
    created_by_admin_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=True)
    
    allowed_languages = db.Column(db.String(255)) # New: Default allowed languages for this classroom
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Explicit relationships
    # Original one-teacher relationship
    teacher = db.relationship('User', primaryjoin='Classroom.teacher_id == User.id', backref='lead_classrooms')
    
    # New: Multiple teachers relationship
    teachers = db.relationship('User', 
                               secondary=classroom_teachers,
                               primaryjoin="Classroom.id == classroom_teachers.c.classroom_id",
                               secondaryjoin="User.id == classroom_teachers.c.teacher_id",
                               backref=db.backref('assigned_classrooms', lazy='dynamic'))
    
    # Students relationship
    students = db.relationship('User', 
                               secondary=classroom_students,
                               primaryjoin="Classroom.id == classroom_students.c.classroom_id",
                               secondaryjoin="User.id == classroom_students.c.student_id",
                               backref=db.backref('enrolled_classrooms', lazy='dynamic'))
    
    contents = db.relationship('Content', backref='classroom', lazy='dynamic')
    assignments = db.relationship('Assignment', backref='classroom', lazy='dynamic')
    doubt_threads = db.relationship('DoubtThread', backref='classroom', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subject': self.subject,
            'description': self.description,
            'teacherId': self.teacher_id,
            'allowedLanguages': self.allowed_languages.split(',') if self.allowed_languages else [],
            'studentCount': len(self.students) if self.students else 0,
            'createdAt': self.created_at.isoformat()
        }
