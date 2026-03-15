import os
import socket
from flask import Flask
from config import SECRET_KEY, DATABASE_URL, HOST, PORT, DEBUG
from apps import db, socketio
from apps.routes import main, register_socket_events


def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def create_app():
    app = Flask(__name__, static_folder='templates/src', static_url_path='/src')
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    socketio.init_app(app)

    app.register_blueprint(main)
    register_socket_events(socketio)

    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        local_ip = get_local_ip()
        print(f"\n{'='*50}")
        print(f"  在线聊天室已启动!")
        print(f"  本机访问: http://localhost:{PORT}")
        print(f"  局域网访问: http://{local_ip}:{PORT}")
        print(f"{'='*50}\n")
    socketio.run(app, host=HOST, port=PORT, debug=DEBUG, allow_unsafe_werkzeug=True)
