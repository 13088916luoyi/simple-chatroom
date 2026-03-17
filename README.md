# 在线聊天室

一个基于 Flask + Socket.IO 的实时在线聊天室应用，支持公共聊天、私聊、图片发送、Emoji 表情等功能。

## 功能特性

- **用户认证**：支持用户注册、登录、退出登录
- **公共聊天室**：所有用户可见的公共消息频道
- **私聊功能**：用户之间可以进行一对一私聊
- **Emoji 表情**：支持发送丰富的 Emoji 表情
- **图片发送**：支持发送图片，自动压缩优化
- **图片预览**：点击图片可放大预览
- **实时通信**：基于 WebSocket 的实时消息推送
- **在线状态**：实时显示在线用户列表和在线人数
- **历史消息**：自动保存并加载历史聊天记录
- **响应式设计**：支持桌面端和移动端访问
- **局域网访问**：支持同一局域网内多设备访问

## 技术栈

| 类别 | 技术 |
|------|------|
| 后端框架 | Flask 2.x |
| 实时通信 | Flask-SocketIO |
| 数据库 | SQLite + Flask-SQLAlchemy |
| 前端 | 原生 HTML/CSS/JavaScript |
| WebSocket | Socket.IO (客户端 + 服务端) |
| 密码加密 | Werkzeug Security |

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

## 快速开始

### 环境要求

- Python 3.8+
- pip

### 安装依赖

```bash
pip install flask flask-socketio flask-sqlalchemy eventlet
```

### 初始化数据库

```bash
python init_db.py
```

此命令会：
1. 删除旧数据库（如果存在）
2. 创建新的数据库表
3. 创建测试用户（账号：`admin`，密码：`123456`）

### 启动服务

```bash
python app.py
```

启动成功后会显示：

```
==================================================
  在线聊天室已启动!
  本机访问: http://localhost:5000
  局域网访问: http://<你的IP>:5000
==================================================
```

### 访问应用

- 本机访问：`http://localhost:5000`
- 局域网访问：`http://<服务器IP>:5000`

## 配置说明

配置文件 `config.py` 支持以下配置项：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `SECRET_KEY` | `chatroom-secret-key-2024` | Flask 密钥（建议生产环境通过环境变量设置） |
| `HOST` | `0.0.0.0` | 监听地址 |
| `PORT` | `5000` | 监听端口 |
| `DEBUG` | `True` | 调试模式 |
| `DATABASE_URL` | `sqlite:///chatroom.db` | 数据库连接地址 |

可通过环境变量覆盖默认配置：

```bash
export SECRET_KEY=your-secret-key
export DATABASE_URL=sqlite:///path/to/database.db
python app.py
```

## 使用说明

### 注册账号

1. 访问应用首页
2. 点击「注册」选项卡
3. 输入账号、密码、昵称
4. 点击「注册」按钮

### 登录

1. 访问应用首页
2. 输入账号和密码
3. 点击「登录」按钮

### 公共聊天

登录后自动进入公共聊天室，所有在线用户都能看到公共消息。

### 私聊

1. 在左侧「在线用户」列表中点击目标用户
2. 进入与该用户的私聊界面
3. 发送的消息仅双方可见
4. 点击「公共聊天室」可返回公共聊天

### 发送 Emoji 表情

1. 点击输入框上方的 😊 表情按钮
2. 在弹出的表情面板中选择表情
3. 表情自动插入到输入框中
4. 点击发送按钮发送消息

### 发送图片

1. 点击输入框上方的 🖼️ 图片按钮
2. 选择要发送的图片文件
3. 图片自动压缩并发送
4. 支持的格式：JPG、PNG、GIF 等

**图片压缩策略：**
- 大于 2MB：压缩至 1280×1280，质量 60%
- 500KB - 2MB：压缩至 1600×1600，质量 70%
- 小于 500KB：压缩至 1920×1920，质量 80%

### 图片预览

1. 点击聊天中的图片
2. 图片放大显示在预览窗口中
3. 点击任意位置或右上角的 × 关闭预览

### 退出登录

点击右上角「退出登录」按钮即可退出。

## 前端特性

- **毛玻璃效果**：使用 `backdrop-filter` 实现现代 UI 效果
- **响应式布局**：自适应桌面端和移动端
- **消息动画**：新消息带有淡入动画效果
- **实时更新**：用户上线/下线实时通知
- **图片压缩**：前端 Canvas 压缩，减少传输时间
- **图片预览**：支持图片放大查看

## 注意事项

1. 默认使用 SQLite 数据库，适合小型应用；生产环境建议使用 MySQL/PostgreSQL
2. 默认密钥仅用于开发测试，生产环境请通过环境变量设置安全密钥
3. Socket.IO 默认配置支持 10MB 消息大小和 60 秒超时
4. 局域网访问需确保防火墙允许对应端口
5. 图片发送采用 base64 编码，大图片会自动压缩
