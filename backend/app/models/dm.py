from app import db
from datetime import datetime
import uuid

class DirectMessage(db.Model):
    __tablename__ = 'direct_messages'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=True) # Can be empty if just a file
    
    # media support
    media_url = db.Column(db.String(255), nullable=True)
    media_type = db.Column(db.String(50), nullable=True) # image, video, document
    
    read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    sender = db.relationship('User', 
                             primaryjoin="DirectMessage.sender_id == User.id",
                             foreign_keys="[DirectMessage.sender_id]",
                             backref='sent_messages')
    receiver = db.relationship('User', 
                               primaryjoin="DirectMessage.receiver_id == User.id",
                               foreign_keys="[DirectMessage.receiver_id]",
                               backref='received_messages')

    def to_dict(self):
        return {
            'id': self.id,
            'senderId': self.sender_id,
            'senderName': self.sender.name,
            'receiverId': self.receiver_id,
            'content': self.content,
            'mediaUrl': self.media_url,
            'mediaType': self.media_type,
            'read': self.read,
            'timestamp': self.timestamp.isoformat()
        }
