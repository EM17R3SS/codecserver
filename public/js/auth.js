document.addEventListener('DOMContentLoaded', async () => {
    if (!window.authManager.initialized) {
        await window.authManager.initialize();
    }

    updateMenu();

    window.authManager.addListener(() => {
        updateMenu();
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-logout')) {
            handleLogout();
        }
    });

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleRegister();
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleLogin();
        });
    }

    // if (window.authManager.isAuthenticated) {
    //     const currentPath = window.location.pathname;
    //     if (currentPath === '/login' || currentPath === '/register') {
    //         window.location.href = '/';
    //     }
    // }
});

function updateMenu() {
    const userMenu = document.querySelector('.user-menu');
    if (!userMenu) return;

    const isAuthenticated = window.authManager.isAuthenticated;
    const user = window.authManager.user;

    if (isAuthenticated && user) {
        let html = '<span style="color: #fff; margin-right: 10px;">' + (user.name || user.email) + '</span>';

        if (user.role === 'admin') {
            html += ' <a href="/users" style="color: #ff0000; font-weight: bold;">Пользователи</a>';
        }

        html += ' <button class="btn-logout" style="background: #ff0000; color: #fff; border: none; padding: 6px 16px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 14px;">Выйти</button>';
        userMenu.innerHTML = html;
    } else {
        userMenu.innerHTML = `
            <a href="/login">Вход</a>
            <a href="/register">Регистрация</a>
        `;
    }
}

window.updateMenu = updateMenu;

async function handleLogout() {
    await window.authManager.logout();
    updateMenu();
    window.location.href = '/';
}

async function handleRegister() {
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const messageDiv = document.getElementById('registerMessage');

    if (!name || !email || !password) {
        showMessage(messageDiv, 'Заполните все поля', 'error');
        return;
    }

    if (password.length < 8) {
        showMessage(messageDiv, 'Пароль должен быть минимум 8 символов', 'error');
        return;
    }

    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showMessage(messageDiv, 'Регистрация успешна!', 'success');
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showMessage(messageDiv, data.message || 'Ошибка регистрации', 'error');
        }
    } catch (error) {
        showMessage(messageDiv, 'Ошибка соединения', 'error');
        console.error('Register error:', error);
    }
}

async function handleLogin() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
    const messageDiv = document.getElementById('loginMessage');

    if (!email || !password) {
        showMessage(messageDiv, 'Заполните все поля', 'error');
        return;
    }

    const result = await window.authManager.login(email, password, csrfToken);

    if (messageDiv) {
        if (result.success) {
            showMessage(messageDiv, 'Вход выполнен!', 'success');
            updateMenu();
            setTimeout(() => {
                window.location.href = result.data?.redirect || '/';
            }, 500);
        } else {
            showMessage(messageDiv, result.message || 'Ошибка входа', 'error');
        }
    }
}

function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = 'form-message ' + type;
}

window.updateMenu = updateMenu;
window.handleLogout = handleLogout;
