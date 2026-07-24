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

    if (!name || !email) {
        showMessage('Заполните все поля', 'error');
        return;
    }

    if (!isAuthenticated()) {
        showMessage('Войдите в систему', 'error');
        return;
    }

    try {
        const response = await fetch('/api/v1/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ name, email }),
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

    try {
        const response = await fetch(`/api/v1/users/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
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
    if (!isAuthenticated()) {
        alert('Войдите в систему');
        return;
    }

    try {
        const response = await fetch('/api/v1/users', {
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
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
        tbody.innerHTML =
            '<tr><td colspan="5" style="text-align:center;">Нет пользователей</td></tr>';
        return;
    }

    tbody.innerHTML = users
        .map(
            user => `
        <tr>
            <td>${user._id || user.id}</td>
            <td>${escapeHtml(user.name)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleString('ru-RU') : '—'}</td>
            <td>
                <button class="btn-delete" onclick="deleteUser('${user._id || user.id}')">Удалить</button>
            </td>
        </tr>
    `
        )
        .join('');
}

function initContactForm() {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    form.addEventListener('submit', async e => {
        e.preventDefault();
        const messageDiv = document.getElementById('formMessage');
        messageDiv.innerHTML =
            '<p style="color: #00ff00;">Спасибо! Сообщение отправлено.</p>';
        form.reset();
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();

    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async e => {
            e.preventDefault();
            await addUser();
        });
    }

    const usersBody = document.getElementById('usersBody');
    if (usersBody && !isAuthenticated()) {
        const addForm = document.getElementById('addUserForm');
        if (addForm) addForm.style.display = 'none';
        document
            .querySelector('.users-section')
            ?.insertAdjacentHTML(
                'afterbegin',
                '<p style="color: #ff0000; text-align: center; padding: 1rem;">Для управления пользователями <a href="/login" style="color: #ff0000;">войдите в систему</a></p>'
            );
    }
});
