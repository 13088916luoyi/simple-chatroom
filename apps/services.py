from apps import db
from apps.models import Message, User, get_beijing_time


class ChatService:
    @staticmethod
    def create_message(username, nickname, content, room='general', is_private=False, target_user=None):
        message = Message(
            username=username,
            nickname=nickname,
            content=content,
            room=room,
            timestamp=get_beijing_time(),
            is_private=is_private,
            target_user=target_user
        )
        db.session.add(message)
        db.session.commit()
        return message

    @staticmethod
    def get_user_nickname(username):
        user = User.query.filter_by(username=username).first()
        return user.nickname if user else username

    @staticmethod
    def get_recent_messages(room='general', limit=50, username=None):
        if room == 'general':
            # 公共聊天室：只显示公共消息
            messages = Message.query.filter_by(room='general', is_private=False)\
                .order_by(Message.timestamp.desc())\
                .limit(limit)\
                .all()
        else:
            # 私聊：显示与该用户相关的私聊消息
            messages = Message.query.filter(
                ((Message.username == username) & (Message.target_user == room)) |
                ((Message.username == room) & (Message.target_user == username))
            ).order_by(Message.timestamp.desc()).limit(limit).all()
        return [msg.to_dict() for msg in reversed(messages)]

    @staticmethod
    def register_user(username, password, nickname):
        if User.query.filter_by(username=username).first():
            return None
        user = User(username=username, nickname=nickname)
        user.set_password(password)
        user.online = True
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def login_user(username, password):
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            user.online = True
            user.last_seen = get_beijing_time()
            db.session.commit()
            return user
        return None

    @staticmethod
    def set_user_online(username):
        user = User.query.filter_by(username=username).first()
        if user:
            user.online = True
            user.last_seen = get_beijing_time()
            db.session.commit()
        return user

    @staticmethod
    def logout_user(username):
        user = User.query.filter_by(username=username).first()
        if user:
            user.online = False
            user.last_seen = get_beijing_time()
            db.session.commit()
        return user

    @staticmethod
    def set_user_offline(username):
        user = User.query.filter_by(username=username).first()
        if user:
            user.online = False
            user.last_seen = get_beijing_time()
            db.session.commit()
        return user

    @staticmethod
    def get_online_users():
        users = User.query.filter_by(online=True).all()
        return [user.to_dict() for user in users]

    @staticmethod
    def get_all_users():
        users = User.query.all()
        return [user.to_dict() for user in users]
