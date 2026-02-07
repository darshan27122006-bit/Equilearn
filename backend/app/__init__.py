
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from pymongo import MongoClient

db = SQLAlchemy()
jwt = JWTManager()
mongo = None # Global mongo client placeholder

def create_app(config_name='development'):
    global mongo
    app = Flask(__name__)
    
    # Load configuration
    if config_name == 'development':
        from app.config import DevelopmentConfig
        app.config.from_object(DevelopmentConfig)
    elif config_name == 'production':
        from app.config import ProductionConfig
        app.config.from_object(ProductionConfig)
    else:
        from app.config import Config
        app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # MongoDB Initialization
    try:
        mongo_client = MongoClient(app.config['MONGO_URI'])
        # Test connection
        mongo_client.admin.command('ping')
        app.mongo = mongo_client
        mongo = mongo_client
        app.logger.info("MongoDB connection established successfully.")
    except Exception as e:
        app.logger.error(f"Failed to connect to MongoDB: {e}")
        app.mongo = None
    # Enable CORS for all routes (simplify for dev)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register Blueprints 
    from app.routes.auth_routes import auth_bp
    from app.routes.classroom_routes import classroom_bp
    from app.routes.content_routes import content_bp
    from app.routes.assignment_routes import assignment_bp
    from app.routes.doubt_routes import doubt_bp
    from app.routes.quiz_routes import quiz_bp
    from app.routes.dm_routes import dm_bp
    
    from app.routes.ai_routes import ai_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.teacher_routes import teacher_bp
    from app.routes.student_routes import student_bp
    from app.routes.debug_routes import debug_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(classroom_bp, url_prefix='/api/classrooms')
    app.register_blueprint(content_bp, url_prefix='/api/content')
    app.register_blueprint(assignment_bp, url_prefix='/api/assignments')
    app.register_blueprint(doubt_bp, url_prefix='/api/doubts')
    app.register_blueprint(quiz_bp, url_prefix='/api/quizzes')
    app.register_blueprint(dm_bp, url_prefix='/api/dm')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(teacher_bp, url_prefix='/api/teacher')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(debug_bp, url_prefix='/api/debug')
    
    # Import models for DB creation
    from app.models import user, classroom, content, assignment, doubt, quiz, dm, progress 

    # Static route to serve uploads and audio
    from flask import send_from_directory
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/media/audio/<path:filename>')
    def serve_audio(filename):
        # Aligned with the Issue 1 requirement
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app
