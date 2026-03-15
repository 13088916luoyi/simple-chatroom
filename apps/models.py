from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from apps import db

BEIJING_TZ = timezone(timedelta(hours=8))

def get_beijing_time():
    return datetime.now(BEIJING_TZ).replace(tzinfo=None)


class Message(db.Model):
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    nickname = db.Column(db.String(80), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=get_beijing_time)
    room = db.Column(db.String(80), default='general')
    is_private = db.Column(db.Boolean, default=False)
    target_user = db.Column(db.String(80), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nickname': self.nickname,
            'content': self.content,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'room': self.room,
            'is_private': self.is_private,
            'target_user': self.target_user
        }


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    nickname = db.Column(db.String(80), nullable=False)
    online = db.Column(db.Boolean, default=False)
    last_seen = db.Column(db.DateTime, default=get_beijing_time)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'nickname': self.nickname or self.username,
            'online': self.online,
            'last_seen': self.last_seen.strftime('%Y-%m-%d %H:%M:%S')
        }
