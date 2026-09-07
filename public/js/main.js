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
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addUser();
            });
        }

        const refreshButton = document.getElementById('refreshUsers');
        if (refreshButton) {
            refreshButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("refresh");
                this.getUsers(this.currentPage);
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit-user')) {
                const userId = e.target.dataset.userId;
                const userName = e.target.dataset.userName;
                const userEmail = e.target.dataset.userEmail;
                const userRole = e.target.dataset.userRole;
                this.openEditUserModal(userId, userName, userEmail, userRole);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-change-password')) {
                const userId = e.target.dataset.userId;
                console.log('Password button clicked, userId:', userId);
                this.openPasswordModal(userId);
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-delete')) {
                const userId = e.target.dataset.userId;
                if (userId) {
                    this.deleteUser(userId);
                }
            }
        });

        const editUserForm = document.getElementById('editUserForm');
        if (editUserForm) {
            editUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.editUser();
            });
        }

        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Change password form submitted');
                this.changePassword();
            });
        } else {
            console.log('changePasswordForm not found');
        }

        window.authManager.addListener(() => {
            if (window.updateMenu) {
                window.updateMenu();
            }
            this.checkUserAccess();
        });
    }

    checkUserAccess() {
        if(window.updateMenu) window.updateMenu();
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
        this.currentPage = page;
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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem;">Нет пользователей</td></tr>';
            return;
        }

        tbody.innerHTML = users.map((user) => {
            return '<tr>' +
                '<td><code>' + this.escapeHtml(user._id) + '</code></td>' +
                '<td>' + this.escapeHtml(user.name) + '</td>' +
                '<td>' + this.escapeHtml(user.email) + '</td>' +
                '<td>' + (user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—') + '</td>' +
                '<td>' +
                    '<button class="btn-edit-user" data-user-id="' + user._id + '" data-user-name="' + this.escapeHtml(user.name) + '" data-user-email="' + this.escapeHtml(user.email) + '" data-user-role="' + user.role + '" style="background: #ff8c00; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">✎</button>' +
                    '<button class="btn-change-password" data-user-id="' + user._id + '" style="background: #444; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">Пароль</button>' +
                    '<button class="btn-delete" data-user-id="' + user._id + '" style="background: #ff0000; color: #fff; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">Удалить</button>' +
                '</td>' +
            '</tr>';
        }).join('');
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
            const body = { name: name, email: email };
            if (password && password.trim() !== '') {
                body.password = password;
            }
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('Пользователь добавлен!', 'success');
                document.getElementById('userName').value = '';
                document.getElementById('userEmail').value = '';
                document.getElementById('userPassword').value = '';
                setTimeout(() => {
                    this.getUsers(this.currentPage);
                }, 1000);
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

    openEditUserModal(userId, userName, userEmail, userRole) {
        document.getElementById('editUserId').value = userId;
        document.getElementById('editUserName').value = userName || '';
        document.getElementById('editUserEmail').value = userEmail || '';
        document.getElementById('editUserRole').value = userRole || 'user';
        document.getElementById('editUserMessage').textContent = '';
        document.getElementById('editUserMessage').className = 'form-message';
        document.getElementById('editUserModal').style.display = 'block';
    }

    closeEditUserModal() {
        document.getElementById('editUserModal').style.display = 'none';
    }

    async editUser() {
        const userId = document.getElementById('editUserId').value;
        const name = document.getElementById('editUserName').value;
        const email = document.getElementById('editUserEmail').value;
        const role = document.getElementById('editUserRole').value;
        const messageDiv = document.getElementById('editUserMessage');

        if (!name || !email) {
            this.showEditUserMessage('Заполните все поля', 'error');
            return;
        }

        try {
            const response = await fetch('/api/v1/users/' + userId, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    name: name,
                    email: email,
                    role: role
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showEditUserMessage('Пользователь обновлен!', 'success');
                setTimeout(() => {
                    this.closeEditUserModal();
                    this.getUsers(this.currentPage);
                }, 1500);
            } else {
                this.showEditUserMessage(data.message || 'Ошибка обновления', 'error');
            }
        } catch (error) {
            this.showEditUserMessage('Ошибка соединения', 'error');
            console.error('Edit user error:', error);
        }
    }

    showEditUserMessage(message, type) {
        const messageDiv = document.getElementById('editUserMessage');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = 'form-message ' + type;

        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';
        }, 3000);
    }

    openPasswordModal(userId) {
        console.log('openPasswordModal called, userId:', userId);
        document.getElementById('changeUserId').value = userId;
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('passwordMessage').textContent = '';
        document.getElementById('passwordMessage').className = 'form-message';
        document.getElementById('changePasswordModal').style.display = 'block';
    }

    closePasswordModal() {
        document.getElementById('changePasswordModal').style.display = 'none';
    }

    async changePassword() {
        console.log('changePassword called');
        const userId = document.getElementById('changeUserId').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageDiv = document.getElementById('passwordMessage');

        if (!newPassword || !confirmPassword) {
            this.showPasswordMessage('Заполните все поля', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showPasswordMessage('Пароль должен быть минимум 8 символов', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showPasswordMessage('Пароли не совпадают', 'error');
            return;
        }

        try {
            const response = await fetch('/api/v1/users/' + userId, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify({ password: newPassword })
            });

            const data = await response.json();
            console.log('Change password response:', data);

            if (data.success) {
                this.showPasswordMessage('Пароль успешно изменен!', 'success');
                setTimeout(() => {
                    this.closePasswordModal();
                    this.getUsers(this.currentPage);
                }, 1500);
            } else {
                this.showPasswordMessage(data.message || 'Ошибка смены пароля', 'error');
            }
        } catch (error) {
            this.showPasswordMessage('Ошибка соединения', 'error');
            console.error('Change password error:', error);
        }
    }

    showPasswordMessage(message, type) {
        const messageDiv = document.getElementById('passwordMessage');
        if (!messageDiv) return;

        messageDiv.textContent = message;
        messageDiv.className = 'form-message ' + type;

        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';
        }, 3000);
    }
}

const userManager = new UserManager();
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

window.refreshUsers = function () {
    console.log('refresh call');
    userManager.getUsers(userManager.currentPage);
};

window.getToken = function() {
    return localStorage.getItem('token');
};

window.escapeHtml = function(str) {
    return userManager.escapeHtml(str);
};

window.openEditUserModal = function (userId, userName, userEmail, userRole) {
    userManager.openEditUserModal(userId, userName, userEmail, userRole);
};

window.closeEditUserModal = function() {
    userManager.closeEditUserModal();
};

window.openPasswordModal = function(userId) {
    userManager.openPasswordModal(userId);
};

window.closePasswordModal = function() {
    userManager.closePasswordModal();
};

document.addEventListener('DOMContentLoaded', async function() {
    await userManager.init();
});
