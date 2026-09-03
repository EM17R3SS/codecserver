document.addEventListener('DOMContentLoaded', () => {
    async function checkAuth() {
        try {
            const response = await fetch('/api/v1/auth/session', {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.authenticated) {
                return data.user;
            }
            const token = localStorage.getItem('token');
            if (token) {
                return { authenticated: true, from: 'jwt' };
            }
            return null;
        } catch {
            return null;
        }
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const messageDiv = document.getElementById('registerMessage');

            if (!name || !email || !password) {
                if (messageDiv) {
                    messageDiv.innerHTML = '<p style="color: #ff0000;">Заполните все поля</p>';
                }
                return;
            }

            if (password.length < 8) {
                if (messageDiv) {
                    messageDiv.textContent = 'Пароль должен быть минимум 8 символов';
                    messageDiv.style.color = '#ff0000';
                }
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await response.json();

                if (messageDiv) {
                    if (data.success) {
                        messageDiv.innerHTML = `
                            <p style="color: #00ff00;">Регистрация успешна!</p>
                            <p style="margin-top: 0.5rem;"><a href="/login" style="color: #ff0000;">Перейти к входу</a></p>
                        `;
                        registerForm.reset();
                    } else {
                        messageDiv.innerHTML = `<p style="color: #ff0000;">${data.message || 'Ошибка регистрации'}</p>`;
                        if (data.errors && Array.isArray(data.errors)) {
                            messageDiv.innerHTML += `<ul style="color: #ff0000;">${data.errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
                        }
                    }
                }
            } catch (error) {
                if (messageDiv) {
                    messageDiv.innerHTML = '<p style="color: #ff0000;">Ошибка соединения</p>';
                }
                console.error('Register error:', error);
            }
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';
            const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
            const messageDiv = document.getElementById('loginMessage');

            if (!email || !password) {
                if (messageDiv) {
                    messageDiv.textContent = 'Заполните все поля';
                    messageDiv.style.color = '#ff0000';
                }
                return;
            }

            try {
                //const csrfToken = getCookie('csrf_token');
                //const csrfToken = document.querySelector('input[name="_csrf"]')?.value || '';
                const response = await fetch('/api/v1/auth/session-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password, _csrf: csrfToken }),
                });

                const data = await response.json();

                if (messageDiv) {
                    if (data.success) {
                        window.history.replaceState({}, document.title, '/login');
                        window.location.href = data.redirect || '/';
                    } else {
                        messageDiv.textContent = data.message || 'Ошибка входа';
                        messageDiv.style.color = '#ff0000';
                        window.history.replaceState({}, document.title, '/login');
                    }
                }
            } catch (error) {
                if (messageDiv) {
                    messageDiv.textContent = 'Ошибка соединения';
                    messageDiv.style.color = '#ff0000';
                    window.history.replaceState({}, document.title, '/login');
                }
                console.error('Login error:', error);
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                } else {
                    console.error('Logout failed:', response.status);
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } catch (error) {
                localStorage.removeItem('token');
                window.location.href = '/login';
                console.error('Logout error:', error);
            }
        });
    }


    // function getCookie(name) {
    //     const value = `; ${document.cookie}`;
    //     const parts = value.split(`; ${name}=`);
    //     if (parts.length === 2) return parts.pop().split(';').shift();
    //     return '';
    // }

    window.isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    window.getAuthStatus = checkAuth;
});
