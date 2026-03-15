from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()
socketio = SocketIO(
    cors_allowed_origins="*",
    max_http_buffer_size=10 * 1024 * 1024,  # 10MB 最大消息大小
    ping_timeout=60,  # 60秒 ping 超时
    ping_interval=25  # 25秒 ping 间隔
)
