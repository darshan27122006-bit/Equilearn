
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.quiz import Quiz, Question, StudentQuizAttempt
import uuid
import json

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/', methods=['POST'])
@jwt_required()
def create_quiz():
    # Only Teacher
    data = request.get_json()
    user_id = get_jwt_identity()
    
    quiz = Quiz(
        id=str(uuid.uuid4()),
        classroom_id=data.get('classroomId'),
        topic=data['topic'],
        created_by=user_id
    )
    db.session.add(quiz)
    
    for q_data in data.get('questions', []):
        question = Question(
            quiz=quiz,
            question_text=q_data['text'],
            question_type=q_data['type'],
            options=json.dumps(q_data.get('options', [])),
            correct_answer=q_data['correctAnswer'],
            explanation=q_data.get('explanation')
        )
        db.session.add(question)
        
    db.session.commit()
    return jsonify({'success': True, 'quiz': quiz.to_dict()}), 201

@quiz_bp.route('/<quiz_id>/attempt', methods=['POST'])
@jwt_required()
def attempt_quiz(quiz_id):
    data = request.get_json()
    user_id = get_jwt_identity()
    answers = data.get('answers', {}) # {question_id: answer}
    
    quiz = Quiz.query.get_or_404(quiz_id)
    score = 0
    total = 0
    
    for question in quiz.questions:
        total += 1
        user_ans = answers.get(str(question.id))
        if user_ans and user_ans.lower() == question.correct_answer.lower():
            score += 1
            
    attempt = StudentQuizAttempt(
        quiz_id=quiz.id,
        student_id=user_id,
        score=score,
        total_questions=total
    )
    db.session.add(attempt)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'attempt': attempt.to_dict(),
        'score': score,
        'total': total
    })

@quiz_bp.route('/classroom/<classroom_id>', methods=['GET'])
@jwt_required()
def get_classroom_quizzes(classroom_id):
    quizzes = Quiz.query.filter_by(classroom_id=classroom_id).all()
    return jsonify({'success': True, 'quizzes': [q.to_dict() for q in quizzes]})
