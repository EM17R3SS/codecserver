class UserManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.users = [];
        this.currentPage = 1;
        this.limit = 20;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;

        if (!window.authManager.initialized) {
            await window.authManager.initialize();
        }

        if (window.updateMenu) {
            window.updateMenu();
        }

        this.setupEventListeners();
        this.checkUserAccess();
    }

    setupEventListeners() {
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addUser();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const userId = e.target.dataset.userId;
                if (userId) {
                    this.deleteUser(userId);
                }
            }
        });

        window.authManager.addListener(() => {
            if (window.updateMenu) {
                window.updateMenu();
            }
            this.checkUserAccess();
        });
    }

    checkUserAccess() {
        const usersBody = document.getElementById('usersBody');
        if (!usersBody) return;

        const isAuthenticated = window.authManager.isAuthenticated;
        const user = window.authManager.user;

        const oldMsg = document.querySelector('.access-denied-msg');
        if (oldMsg) oldMsg.remove();

        const hasAccess = isAuthenticated && user && user.role === 'admin';

        const addForm = document.getElementById('addUserForm');
        if (addForm) {
            addForm.style.display = hasAccess ? 'block' : 'none';
        }

        if (!hasAccess) {
            const section = document.querySelector('.users-section');
            if (section) {
                const msg = document.createElement('p');
                msg.className = 'access-denied-msg';
                msg.style.cssText = 'color: #ff0000; text-align: center; padding: 2rem; font-size: 1.2rem;';

                if (!isAuthenticated) {
                    msg.innerHTML = 'Для управления пользователями <a href="/login" style="color: #ff0000; font-weight: bold;">войдите в систему</a>';
                } else if (user && user.role !== 'admin') {
                    msg.textContent = 'У вас нет прав для управления пользователями. Требуются права администратора.';
                } else {
                    msg.textContent = 'Проверка доступа...';
                }

                section.insertAdjacentElement('afterbegin', msg);
            }

            if (usersBody) {
                usersBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #666; padding: 2rem;">Доступ запрещен</td></tr>';
            }

            const countSpan = document.getElementById('userCount');
            if (countSpan) countSpan.textContent = '0';
        } else {
            this.getUsers();
        }
    }

    async getUsers(page = 1) {
        const usersBody = document.getElementById('usersBody');
        if (!usersBody) return;

        try {
            usersBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Загрузка...</td></tr>';

            const response = await fetch('/api/v1/users?page=' + page + '&limit=' + this.limit, {
                headers: this.getHeaders()
            });

            if (response.status === 401 || response.status === 403) {
                this.checkUserAccess();
                return;
            }

            const data = await response.json();

            if (data.success) {
                this.users = data.data;
                this.renderUsers(this.users);
                const countSpan = document.getElementById('userCount');
                if (countSpan) countSpan.textContent = data.total || data.count || 0;
                return data;
            }
            throw new Error(data.message);
        } catch (error) {
            console.error('Error fetching users:', error);
            usersBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ff0000;">Ошибка загрузки пользователей</td></tr>';
            throw error;
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers.Authorization = 'Bearer ' + token;
        }
        return headers;
    }

    renderUsers(users) {
        const tbody = document.getElementById('usersBody');
        if (!tbody) return;

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem;">Нет пользователей</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(function(user) {
            return `
                <tr>
                    <td><code>${this.escapeHtml(user._id)}</code></td>
                    <td>${this.escapeHtml(user.name)}</td>
                    <td>${this.escapeHtml(user.email)}</td>
                    <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>
                        <button class="btn-delete" data-user-id="${user._id}" style="background: #ff0000; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                            Удалить
                        </button>
                    </td>
                </tr>
            `;
        }.bind(this)).join('');
    }

    async deleteUser(id) {
        if (!confirm('Удалить этого пользователя?')) return;

        try {
            const response = await fetch('/api/v1/users/' + id, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            const data = await response.json();
            if (data.success) {
                alert('Пользователь удален');
                await this.getUsers(this.currentPage);
            } else {
                alert(data.message || 'Ошибка удаления');
            }
        } catch (error) {
            alert('Ошибка соединения');
            console.error(error);
        }
    }

    async addUser() {
        const name = document.getElementById('userName')?.value;
        const email = document.getElementById('userEmail')?.value;
        const password = document.getElementById('userPassword')?.value;

        if (!name || !email) {
            this.showMessage('Заполните все поля', 'error');
            return;
        }

        try {
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ name: name, email: email, password: password })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('Пользователь добавлен!', 'success');
                document.getElementById('userName').value = '';
                document.getElementById('userEmail').value = '';
                document.getElementById('userPassword').value = '';
                setTimeout(function() {
                    this.getUsers(this.currentPage);
                }.bind(this), 1000);
            } else {
                this.showMessage(data.message || 'Ошибка добавления', 'error');
            }
        } catch (error) {
            this.showMessage('Ошибка соединения', 'error');
            console.error(error);
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('addUserMessage');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = 'form-message ' + type;

        setTimeout(function() {
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';
        }, 3000);
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    async logout() {
        await window.authManager.logout();
        if (window.updateMenu) window.updateMenu();
        window.location.href = '/';
    }
}

var userManager = new UserManager();
window.userManager = userManager;

window.logout = function() {
    userManager.logout();
};

window.addUser = function() {
    userManager.addUser();
};

window.deleteUser = function(id) {
    userManager.deleteUser(id);
};

window.refreshUsers = function() {
    userManager.getUsers(userManager.currentPage);
};

window.getToken = function() {
    return localStorage.getItem('token');
};

window.escapeHtml = function(str) {
    return userManager.escapeHtml(str);
};

window.showMessage = function(message, type, elementId) {
    var targetId = elementId || 'addUserMessage';
    var messageDiv = document.getElementById(targetId);
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = 'form-message ' + type;

    setTimeout(function() {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
    }, 3000);
};

document.addEventListener('DOMContentLoaded', async function() {
    await userManager.init();
});
