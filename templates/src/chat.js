// 全局变量
let socket;
let currentUser = null;
let currentRoom = 'general';
let isPrivateChat = false;
let privateTarget = null;
let onlineUsers = [];

// Emoji 数据
const emojis = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂', '🛂', '🛃', '🛄', '🛅', '🛗', '🚹', '🚺', '🚼', '⚧', '🚻', '🚮', '🎦', '📶', '🈁', '✖️', '➕', '➖', '➗', '♾️', '💲', '💱', '™️', '©️', '®️', '👁️‍🗨️', '🔚', '🔙', '🔛', '🔝', '🔜', '〰️', '➰', '➿', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
};

// 检查用户认证
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = '/';
        return false;
    }
    currentUser = JSON.parse(userStr);
    return true;
}

// 初始化
function init() {
    if (!checkAuth()) return;
    connectSocket();
    loadMessages();
    loadUsers();
    initEmojiPicker();
}

// 连接 Socket.IO
function connectSocket() {
    try {
        socket = io({ query: { username: currentUser.username } });

        socket.on('connect', function() {
            console.log('已连接到服务器');
            socket.emit('user_online', { username: currentUser.username });
        });

        socket.on('connect_error', function(error) {
            console.error('连接错误:', error);
        });

        socket.on('new_message', function(data) {
            console.log('收到新消息:', data);
            handleNewMessage(data);
        });

        socket.on('user_joined', function(data) {
            console.log('用户加入:', data);
            var displayName = data.nickname || data.username;
            displaySystemMessage(displayName + ' 加入了聊天室');
            loadUsers();
        });

        socket.on('user_left', function(data) {
            console.log('用户离开:', data);
            var displayName = data.nickname || data.username;
            displaySystemMessage(displayName + ' 离开了聊天室');
            loadUsers();
        });
    } catch (e) {
        console.error('Socket 连接失败:', e);
    }
}

// 处理新消息
function handleNewMessage(data) {
    if (data.is_private) {
        if (isPrivateChat && 
            ((data.username === privateTarget && data.target_user === currentUser.username) ||
             (data.username === currentUser.username && data.target_user === privateTarget))) {
            displayMessage(data);
        } else if (data.target_user === currentUser.username) {
            var displayName = data.nickname || data.username;
            displaySystemMessage(displayName + ' 给你发送了一条私聊消息');
        }
    } else {
        if (!isPrivateChat) {
            displayMessage(data);
        }
    }
}

// 切换到公共聊天
function switchToPublic() {
    isPrivateChat = false;
    privateTarget = null;
    currentRoom = 'general';
    
    document.getElementById('currentChat').textContent = '公共聊天室';
    document.getElementById('publicRoom').classList.add('active');
    
    document.querySelectorAll('.user-item').forEach(function(item) {
        item.classList.remove('active');
    });
    
    loadMessages();
}

// 切换到私聊
function switchToPrivate(username, nickname) {
    isPrivateChat = true;
    privateTarget = username;
    currentRoom = username;
    
    var displayName = nickname || username;
    document.getElementById('currentChat').textContent = '与 ' + displayName + ' 的私聊';
    document.getElementById('publicRoom').classList.remove('active');
    
    document.querySelectorAll('.user-item').forEach(function(item) {
        item.classList.remove('active');
    });
    
    var targetItem = document.getElementById('user-' + username);
    if (targetItem) {
        targetItem.classList.add('active');
    }
    
    loadMessages();
}

// 加载消息
function loadMessages() {
    var url = '/api/messages?room=' + currentRoom;
    if (isPrivateChat && privateTarget) {
        url += '&username=' + encodeURIComponent(currentUser.username);
    }
    
    fetch(url)
        .then(function(response) { return response.json(); })
        .then(function(messages) {
            var container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            messages.forEach(function(msg) { displayMessage(msg); });
            scrollToBottom();
        });
}

// 加载用户列表
function loadUsers() {
    fetch('/api/users?online_only=true')
        .then(function(response) { return response.json(); })
        .then(function(users) {
            onlineUsers = users;
            var userList = document.getElementById('userList');
            var onlineCount = document.getElementById('onlineCount');
            userList.innerHTML = '';
            onlineCount.textContent = '在线: ' + users.length + ' 人';

            users.forEach(function(user) {
                var userItem = document.createElement('div');
                var isSelf = user.username === currentUser.username;
                
                userItem.className = 'user-item';
                if (isSelf) {
                    userItem.classList.add('self');
                }
                userItem.id = 'user-' + user.username;
                
                if (isPrivateChat && privateTarget === user.username) {
                    userItem.classList.add('active');
                }
                
                var displayName = user.nickname || user.username;
                var selfLabel = isSelf ? '<span class="self-badge">自己</span>' : '';
                var onlineIndicator = isSelf ? '' : '<div class="online-dot"></div>';
                
                userItem.innerHTML = '<div class="user-avatar">' + displayName.charAt(0).toUpperCase() + '</div>' +
                    '<span class="user-name">' + displayName + '</span>' +
                    selfLabel +
                    onlineIndicator;
                
                // 自己不能点击私聊
                if (!isSelf) {
                    userItem.onclick = function() {
                        switchToPrivate(user.username, user.nickname);
                    };
                }
                
                userList.appendChild(userItem);
            });
        });
}

// 显示消息
function displayMessage(data) {
    var container = document.getElementById('messagesContainer');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'message' + (data.username === currentUser.username ? ' own' : '');

    var privateIndicator = '';
    if (data.is_private) {
        privateIndicator = '<span class="private-message-indicator">私聊</span>';
    }

    // 显示昵称，如果没有则显示账号
    var displayName = data.nickname || data.username;

    // 处理消息内容（支持图片和emoji）
    var content = processMessageContent(data.content);

    messageDiv.innerHTML = '<div class="message-header">' +
        '<span class="message-username">' + displayName + '</span>' +
        privateIndicator +
        '<span class="message-time">' + data.timestamp + '</span>' +
        '</div>' +
        '<div class="message-content">' + content + '</div>';

    container.appendChild(messageDiv);
    scrollToBottom();
}

// 处理消息内容
function processMessageContent(content) {
    // 处理图片链接
    if (content.startsWith('[img]') && content.endsWith('[/img]')) {
        var imgUrl = content.slice(5, -6);
        return '<img src="' + escapeHtml(imgUrl) + '" onclick="showImagePreview(this.src)" alt="图片">';
    }
    // 普通文本，转义HTML并保留emoji
    return escapeHtml(content);
}

// 显示系统消息
function displaySystemMessage(text) {
    var container = document.getElementById('messagesContainer');
    var systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    systemDiv.textContent = text;
    container.appendChild(systemDiv);
    scrollToBottom();
}

// 发送消息
function sendMessage(event) {
    event.preventDefault();
    var input = document.getElementById('messageInput');
    var content = input.value.trim();

    console.log('尝试发送消息:', content);
    console.log('socket 状态:', socket ? '已连接' : '未连接');

    if (content && socket) {
        var messageData = {
            username: currentUser.username,
            nickname: currentUser.nickname,
            content: content,
            room: currentRoom,
            is_private: isPrivateChat,
            target_user: privateTarget
        };
        
        console.log('发送消息:', messageData);
        socket.emit('send_message', messageData);
        input.value = '';
    } else {
        console.warn('无法发送消息: 内容为空或 socket 未连接');
    }
}

// 退出登录
function logout() {
    if (socket) {
        socket.disconnect();
    }

    fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })
    }).catch(function(error) {
        console.error('退出登录失败');
    });

    localStorage.removeItem('currentUser');
    window.location.href = '/';
}

// 滚动到底部
function scrollToBottom() {
    var container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

// 转义 HTML
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Emoji 选择器功能
function initEmojiPicker() {
    renderEmojis('smileys');
}

function renderEmojis(category) {
    var grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    emojis[category].forEach(function(emoji) {
        var item = document.createElement('div');
        item.className = 'emoji-item';
        item.textContent = emoji;
        item.onclick = function() {
            insertEmoji(emoji);
        };
        grid.appendChild(item);
    });
}

function switchEmojiTab(category) {
    document.querySelectorAll('.emoji-tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    renderEmojis(category);
}

function toggleEmojiPicker() {
    var picker = document.getElementById('emojiPicker');
    picker.classList.toggle('show');
}

function insertEmoji(emoji) {
    var input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();
}

// 图片压缩函数
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var url = URL.createObjectURL(file);

        img.onload = function() {
            URL.revokeObjectURL(url);

            var width = img.width;
            var height = img.height;

            // 计算缩放比例
            if (width > maxWidth || height > maxHeight) {
                var ratio = Math.min(maxWidth / width, maxHeight / height);
                width = width * ratio;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为 base64
            var compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedBase64);
        };

        img.onerror = function() {
            URL.revokeObjectURL(url);
            reject(new Error('图片加载失败'));
        };

        img.src = url;
    });
}

// 图片上传功能
function handleImageSelect(event) {
    var file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }

    // 显示上传提示
    var uploadTip = document.createElement('div');
    uploadTip.className = 'system-message';
    uploadTip.textContent = '正在处理图片...';
    uploadTip.id = 'uploadTip';
    document.getElementById('messagesContainer').appendChild(uploadTip);
    scrollToBottom();

    // 根据原图大小决定压缩策略
    var maxWidth, maxHeight, quality;
    if (file.size > 2 * 1024 * 1024) {
        // 大于2MB的图片，压缩更激进
        maxWidth = 1280;
        maxHeight = 1280;
        quality = 0.6;
    } else if (file.size > 500 * 1024) {
        // 500KB - 2MB
        maxWidth = 1600;
        maxHeight = 1600;
        quality = 0.7;
    } else {
        // 小于500KB，轻度压缩
        maxWidth = 1920;
        maxHeight = 1920;
        quality = 0.8;
    }

    // 压缩并发送图片
    compressImage(file, maxWidth, maxHeight, quality)
        .then(function(compressedBase64) {
            // 移除上传提示
            var tip = document.getElementById('uploadTip');
            if (tip) tip.remove();

            // 检查压缩后大小
            var sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024);
            if (sizeInMB > 1) {
                // 如果还是太大，进一步压缩
                return compressImage(file, 1024, 1024, 0.5);
            }
            return compressedBase64;
        })
        .then(function(finalBase64) {
            // 发送图片消息
            if (socket) {
                var messageData = {
                    username: currentUser.username,
                    nickname: currentUser.nickname,
                    content: '[img]' + finalBase64 + '[/img]',
                    room: currentRoom,
                    is_private: isPrivateChat,
                    target_user: privateTarget
                };
                socket.emit('send_message', messageData);
            }
        })
        .catch(function(error) {
            // 移除上传提示
            var tip = document.getElementById('uploadTip');
            if (tip) tip.remove();

            console.error('图片处理失败:', error);
            alert('图片处理失败，请重试');
        });

    // 清空文件输入
    event.target.value = '';
}

// 显示图片预览
function showImagePreview(src) {
    var preview = document.getElementById('imagePreview');
    var img = document.getElementById('previewImg');
    img.src = src;
    preview.classList.add('show');
}

// 关闭图片预览
function closeImagePreview() {
    var preview = document.getElementById('imagePreview');
    preview.classList.remove('show');
}

// 点击其他地方关闭 emoji 选择器
document.addEventListener('click', function(e) {
    var picker = document.getElementById('emojiPicker');
    var emojiBtn = e.target.closest('.toolbar-btn');
    if (!picker.contains(e.target) && (!emojiBtn || emojiBtn.textContent !== '😊')) {
        picker.classList.remove('show');
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
