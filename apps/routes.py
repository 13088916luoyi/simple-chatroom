from flask import Blueprint, render_template, jsonify, request
from flask_socketio import emit, join_room, leave_room
from apps.services import ChatService

main = Blueprint('main', __name__)


@main.route('/')
def index():
    return render_template('login.html')


@main.route('/chat')
def chat():
    return render_template('chat.html')


@main.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    nickname = data.get('nickname', '').strip()

    if not username:
        return jsonify({'success': False, 'message': '账号不能为空'}), 400

    if not password:
        return jsonify({'success': False, 'message': '密码不能为空'}), 400

    if not nickname:
        return jsonify({'success': False, 'message': '昵称不能为空'}), 400

    user = ChatService.register_user(username, password, nickname)
    if user:
        return jsonify({'success': True, 'message': '注册成功', 'user': user.to_dict()})
    return jsonify({'success': False, 'message': '账号已存在'}), 400


@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username:
        return jsonify({'success': False, 'message': '账号不能为空'}), 400

    if not password:
        return jsonify({'success': False, 'message': '密码不能为空'}), 400

    user = ChatService.login_user(username, password)
    if user:
        return jsonify({'success': True, 'message': '登录成功', 'user': user.to_dict()})
    return jsonify({'success': False, 'message': '账号或密码错误'}), 401


@main.route('/api/logout', methods=['POST'])
def logout():
    data = request.get_json()
    username = data.get('username')
    if username:
        ChatService.logout_user(username)
    return jsonify({'success': True, 'message': '已退出登录'})


@main.route('/api/messages')
def get_messages():
    room = request.args.get('room', 'general')
    username = request.args.get('username')
    limit = request.args.get('limit', 50, type=int)
    messages = ChatService.get_recent_messages(room=room, limit=limit, username=username)
    return jsonify(messages)


@main.route('/api/users')
def get_users():
    online_only = request.args.get('online_only', 'false').lower() == 'true'
    if online_only:
        users = ChatService.get_online_users()
    else:
        users = ChatService.get_all_users()
    return jsonify(users)


def register_socket_events(socketio):
    @socketio.on('connect')
    def handle_connect():
        username = request.args.get('username')
        if username:
            join_room(username)

    @socketio.on('disconnect')
    def handle_disconnect():
        username = request.args.get('username')
        if username:
            leave_room(username)
            user = ChatService.set_user_offline(username)
            if user:
                emit('user_left', {'username': username, 'nickname': user.nickname}, broadcast=True)

    @socketio.on('send_message')
    def handle_message(data):
        username = data.get('username')
        nickname = data.get('nickname')
        content = data.get('content')
        room = data.get('room', 'general')
        is_private = data.get('is_private', False)
        target_user = data.get('target_user')

        if username and content:
            # 如果没有提供昵称，从数据库获取
            if not nickname:
                nickname = ChatService.get_user_nickname(username)
            message = ChatService.create_message(username, nickname, content, room, is_private, target_user)
            if is_private and target_user:
                # 私聊：只发送给目标用户和发送者
                emit('new_message', message.to_dict(), room=target_user)
                emit('new_message', message.to_dict(), room=username)
            else:
                # 公共消息：广播给所有人
                emit('new_message', message.to_dict(), broadcast=True)

    @socketio.on('user_online')
    def handle_user_online(data):
        username = data.get('username')
        if username:
            join_room(username)
            user = ChatService.set_user_online(username)
            if user:
                emit('user_joined', {'username': username, 'nickname': user.nickname}, broadcast=True)
