import os
import logging
from app import create_app, db

# Configure basic logging for the runner
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("BackendRunner")

app = create_app(os.getenv('FLASK_ENV', 'development'))

# Ensure upload directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    logger.info(f"Creating upload folder: {app.config['UPLOAD_FOLDER']}")
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database tables on startup
with app.app_context():
    try:
        logger.info("Initializing database tables...")
        db.create_all()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Critical error during database initialization: {e}")

if __name__ == '__main__':
    host = '0.0.0.0'
    port = int(os.getenv('PORT', 5000))
    logger.info(f"Starting EquiLearn Backend on {host}:{port}")
    app.run(
        host=host,
        port=port,
        debug=os.getenv('FLASK_DEBUG', 'True') == 'True'
    )
