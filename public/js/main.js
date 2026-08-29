function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return !!getToken();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function showMessage(message, type, elementId = 'addUserMessage') {
    const messageDiv = document.getElementById(elementId);
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
    }, 3000);
}

async function addUser() {
    const name = document.getElementById('userName')?.value;
    const email = document.getElementById('userEmail')?.value;
    const password = document.getElementById('userPassword')?.value;

    if (!name || !email) {
        showMessage('Заполните все поля', 'error');
        return;
    }

    const token = getToken();
    if (!token) {
        try {
            const response = await fetch('/api/v1/auth/session', {
                credentials: 'include',
            });
            const data = await response.json();
            if (!data.authenticated) {
                showMessage('Войдите в систему', 'error');
                return;
            }
        } catch {
            showMessage('Войдите в систему', 'error');
            return;
        }
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/v1/users', {
            method: 'POST',
            headers,
            credentials: token ? undefined : 'include',
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Пользователь добавлен!', 'success');
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            setTimeout(() => location.reload(), 1000);
        } else {
            showMessage(`${data.message}`, 'error');
        }
    } catch (err) {
        showMessage('Ошибка соединения', 'error');
    }
}

async function deleteUser(id) {
    if (!isAuthenticated()) {
        alert('Войдите в систему');
        return;
    }

    if (!confirm('Удалить пользователя?')) return;

    const token = getToken();
    try {
        const headers = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers,
            credentials: token ? undefined : 'include',
        });

        const data = await response.json();

        if (data.success) {
            alert('Пользователь удален');
            location.reload();
        } else {
            alert(`${data.message}`);
        }
    } catch (error) {
        alert('Ошибка при удалении');
    }
}

async function refreshUsers() {
    const token = getToken();
    if (!token) {
        try {
            const sessionCheck = await fetch('/api/v1/auth/session', {
                credentials: 'include',
            });
            const sessionData = await sessionCheck.json();
            if (!sessionData.authenticated) {
                alert('Войдите в систему');
                return;
            }
        } catch {
            alert('Войдите в систему');
            return;
        }
    }

    try {
        const headers = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('/api/v1/users', {
            method: 'GET',
            headers,
            credentials: token ? undefined : 'include',
        });

        const data = await response.json();

        if (data.success) {
            renderUsers(data.data);
            const countSpan = document.getElementById('userCount');
            if (countSpan) countSpan.textContent = data.count;
        }
    } catch (err) {
        console.error('Ошибка обновления:', err);
        showMessage('Ошибка при обновлении', 'error');
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Нет пользователей</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${escapeHtml(user._id || user.id)}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleString('ru-RU') : '—'}</td>
            <td>
                <button class="btn-delete" onclick="deleteUser('${escapeHtml(user._id || user.id)}')">Удалить</button>
            </td>
        </tr>
    `).join('');
}

// function initContactForm() {
//     const form = document.getElementById('feedbackForm');
//     if (!form) return;

//     form.addEventListener('submit', async e => {
//         e.preventDefault();
//         const messageDiv = document.getElementById('formMessage');
//         messageDiv.textContent = 'Спасибо! Сообщение отправлено.';
//         messageDiv.style.color = '#00ff00';
//         form.reset();
//         setTimeout(() => {
//             messageDiv.textContent = '';
//         }, 3000);
//     });
// }

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();

    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            await addUser();
        });
    }

    if (document.getElementById('usersBody')) {
        refreshUsers();
    }

    const usersBody = document.getElementById('usersBody');
    if (usersBody) {
        fetch('/api/v1/auth/session', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (!data.authenticated) {
                    const addForm = document.getElementById('addUserForm');
                    if (addForm) addForm.style.display = 'none';
                    document.querySelector('.users-section')?.insertAdjacentHTML(
                        'afterbegin',
                        '<p style="color: #ff0000; text-align: center; padding: 1rem;">Для управления пользователями <a href="/login" style="color: #ff0000;">войдите в систему</a></p>'
                    );
                }
            })
            .catch(() => {
                const addForm = document.getElementById('addUserForm');
                if (addForm) addForm.style.display = 'none';
                document.querySelector('.users-section')?.insertAdjacentHTML(
                    'afterbegin',
                    '<p style="color: #ff0000; text-align: center; padding: 1rem;">Для управления пользователями <a href="/login" style="color: #ff0000;">войдите в систему</a></p>'
                );
            });
    }
});
