import os
from flask import Flask
from config import SECRET_KEY, DATABASE_URL, DATABASE_PATH
from apps import db
from apps.models import Message, User


def init_database():
    if os.path.exists(DATABASE_PATH):
        os.remove(DATABASE_PATH)
        print(f"已删除旧数据库: {DATABASE_PATH}")

    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        print("正在创建数据库表...")
        db.create_all()
        print("数据库表创建成功!")

        print("\n数据库表结构:")
        print("=" * 50)
        print("1. messages 表 (历史对话)")
        print("   - id: 主键")
        print("   - username: 发送者账号")
        print("   - nickname: 发送者昵称")
        print("   - content: 消息内容")
        print("   - timestamp: 发送时间")
        print("   - room: 聊天室名称")
        print("   - is_private: 是否为私聊")
        print("   - target_user: 私聊目标用户")
        print("-" * 50)
        print("2. users 表 (用户账号)")
        print("   - id: 主键")
        print("   - username: 账号 (唯一)")
        print("   - password_hash: 密码哈希")
        print("   - nickname: 昵称")
        print("   - online: 是否在线")
        print("   - last_seen: 最后在线时间")
        print("=" * 50)

        test_user = User(username='admin', nickname='管理员')
        test_user.set_password('123456')
        db.session.add(test_user)
        db.session.commit()

        print("\n已创建测试用户:")
        print("  账号: admin")
        print("  密码: 123456")
        print("\n数据库初始化完成!")


if __name__ == '__main__':
    init_database()
