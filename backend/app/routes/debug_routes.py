from flask import Blueprint, jsonify, current_app

debug_bp = Blueprint('debug', __name__)

@debug_bp.route('/mongo_status', methods=['GET'])
def mongo_status():
    """Check MongoDB connection status"""
    if not hasattr(current_app, 'mongo') or current_app.mongo is None:
        return jsonify({
            "status": "error",
            "message": "MongoDB client not initialized"
        }), 500
    
    try:
        # Ping the database
        current_app.mongo.admin.command('ping')
        
        # Get list of databases (optional check)
        db_names = current_app.mongo.list_database_names()
        
        return jsonify({
            "status": "success",
            "message": "MongoDB is connected",
            "databases": db_names
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
