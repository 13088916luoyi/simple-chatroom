// 切换登录/注册标签
function switchTab(tab) {
    var options = document.querySelectorAll('.auth-option');
    var forms = document.querySelectorAll('.auth-form');
    options.forEach(function(o) { o.classList.remove('active'); });
    forms.forEach(function(f) { f.classList.remove('active'); });
    document.getElementById('errorMessage').style.display = 'none';

    if (tab === 'login') {
        options[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        options[1].classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

// 显示错误信息
function showError(message) {
    var errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showError('请输入账号和密码');
        return;
    }

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = '/chat';
        } else {
            showError(data.message);
        }
    })
    .catch(function(error) {
        showError('登录失败，请稍后重试');
    });
}

// 处理注册
function handleRegister(event) {
    event.preventDefault();
    var username = document.getElementById('regUsername').value.trim();
    var password = document.getElementById('regPassword').value;
    var nickname = document.getElementById('regNickname').value.trim();

    if (!username) {
        showError('请输入账号');
        return;
    }

    if (!password) {
        showError('请输入密码');
        return;
    }

    if (!nickname) {
        showError('请输入昵称');
        return;
    }

    if (username === nickname) {
        showError('账号和昵称不能相同');
        return;
    }

    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password, nickname: nickname })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (data.success) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            window.location.href = '/chat';
        } else {
            showError(data.message);
        }
    })
    .catch(function(error) {
        showError('注册失败，请稍后重试');
    });
}
