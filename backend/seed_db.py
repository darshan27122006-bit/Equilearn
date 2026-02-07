
from app import create_app, db
from app.models.user import User
from app.models.classroom import Classroom
from app.models.content import Content
from app.models.doubt import DoubtThread, DoubtMessage
from datetime import datetime
import uuid

app = create_app('development')

with app.app_context():
    db.create_all()
    
    # Clear existing data to ensure demo users are fresh
    db.drop_all()
    db.create_all()
    
    print("Seeding fresh data...")

    # Users
    admin = User(id='admin-001', name='Admin User', email='admin@mlassistant.com', role='admin', language='en')
    admin.set_password('admin123')
    
    teacher = User(id='teacher-001', name='Teacher Demo', email='teacher@mlassistant.com', role='teacher', language='en')
    teacher.set_password('teacher123')
    
    student = User(id='student-001', name='Student Demo', email='student@mlassistant.com', role='student', language='en')
    student.set_password('student123')
    
    db.session.add_all([admin, teacher, student])
    db.session.commit()
    
    # Classroom
    cls = Classroom(
        id=str(uuid.uuid4()),
        name='Class 10 - Science (Physics)',
        subject='Physics',
        description='Board Exam Preparation Batch 2026',
        teacher_id=teacher.id
    )
    # New: Populate classroom_teachers association
    cls.teachers.append(teacher)
    db.session.add(cls)
    
    # Add student to class
    cls.students.append(student)
    db.session.commit()
    
    # Content
    content = Content(
        content_id=str(uuid.uuid4()),
        subject='Physics',
        topic='Newton\'s Laws',
        level='intermediate',
        language='en',
        text="Newton's First Law states that an object will remain at rest or in uniform motion unless acted upon by an external force.",
        simplified_text="Objects keep doing what they are doing until you push or pull them.",
        classroom_id=cls.id,
        uploaded_by=teacher.id
    )
    db.session.add(content)
    
    # Doubt
    thread = DoubtThread(
        id=str(uuid.uuid4()),
        classroom_id=cls.id,
        student_id=student.id,
        topic='Force calculation'
    )
    db.session.add(thread)
    db.session.commit()
    
    msg1 = DoubtMessage(thread_id=thread.id, sender_id=student.id, content='How do I calculate Force if mass is varying?', message_type='text')
    msg2 = DoubtMessage(thread_id=thread.id, sender_id=teacher.id, content='For varying mass, use F = d(mv)/dt', message_type='text')
    db.session.add_all([msg1, msg2])
    db.session.commit()
    
    print("Seeding complete!")
    print("Teacher: teacher@equilearn.com / teacher123")
    print("Student: student@equilearn.com / student123")
