# 在线聊天室

一个基于 Flask + Socket.IO 的实时在线聊天室应用，支持公共聊天、私聊、图片发送、Emoji 表情等功能。

## 功能特性

- **用户认证**：支持用户注册、登录、退出登录
- **公共聊天室**：所有用户可见的公共消息频道
- **私聊功能**：用户之间可以进行一对一私聊
- **Emoji 表情**：支持发送丰富的 Emoji 表情
- **图片发送**：支持发送图片，自动压缩优化

## 项目结构

```
chatroom/
├── app.py                 # 应用入口，Flask 应用创建与启动
├── config.py              # 配置文件（密钥、数据库、端口等）
├── init_db.py             # 数据库初始化脚本
├── chatroom.db            # SQLite 数据库文件
├── README.md              # 项目说明文档
├── apps/
│   ├── __init__.py        # Flask 扩展初始化（DB、SocketIO）
│   ├── models.py          # 数据模型定义（User、Message）
│   ├── routes.py          # HTTP 路由与 Socket.IO 事件处理
│   └── services.py        # 业务逻辑服务层
└── templates/
    ├── login.html         # 登录/注册页面
    ├── chat.html          # 聊天室主页面
    └── src/
        ├── socket.io.min.js  # Socket.IO 客户端库
        └── image1.png        # 背景图片
```

## 数据模型

### User（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| username | String(80) | 账号（唯一） |
| password_hash | String(256) | 密码哈希值 |
| nickname | String(80) | 昵称 |
| online | Boolean | 是否在线 |
| last_seen | DateTime | 最后在线时间 |

### Message（消息表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| username | String(80) | 发送者账号 |
| nickname | String(80) | 发送者昵称 |
| content | Text | 消息内容 |
| timestamp | DateTime | 发送时间（北京时间） |
| room | String(80) | 聊天室名称 |
| is_private | Boolean | 是否为私聊 |
| target_user | String(80) | 私聊目标用户 |

## API 接口

### HTTP 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 登录页面 |
| GET | `/chat` | 聊天室页面 |
| POST | `/api/register` | 用户注册 |
| POST | `/api/login` | 用户登录 |
| POST | `/api/logout` | 用户退出登录 |
| GET | `/api/messages` | 获取历史消息 |
| GET | `/api/users` | 获取用户列表 |

### Socket.IO 事件

#### 客户端发送

| 事件 | 数据 | 说明 |
|------|------|------|
| `user_online` | `{username}` | 用户上线通知 |
| `send_message` | `{username, nickname, content, room, is_private, target_user}` | 发送消息 |

#### 服务端推送

| 事件 | 数据 | 说明 |
|------|------|------|
| `new_message` | 消息对象 | 新消息通知 |
| `user_joined` | `{username, nickname}` | 用户加入通知 |
| `user_left` | `{username, nickname}` | 用户离开通知 |
