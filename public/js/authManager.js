class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.initialized = false;
        this.listeners = [];
        this._loadState();
    }

    _loadState() {
        try {
            const saved = localStorage.getItem('auth_state');
            if (saved) {
                const state = JSON.parse(saved);
                if (state.user && state.isAuthenticated) {
                    this.user = state.user;
                    this.isAuthenticated = state.isAuthenticated;
                    return true;
                }
            }
        } catch (e) {
            console.error('Error loading auth state:', e);
        }
        return false;
    }

    _saveState() {
        try {
            if (this.isAuthenticated && this.user) {
                localStorage.setItem('auth_state', JSON.stringify({
                    user: this.user,
                    isAuthenticated: this.isAuthenticated
                }));
            } else {
                localStorage.removeItem('auth_state');
            }
        } catch (e) {
            console.error('Error saving auth state:', e);
        }
    }

    async initialize() {
        if (this.initialized) return;

        try {
            const session = await fetch('/api/v1/auth/session', {
                credentials: 'include',
            });
            const sessionData = await session.json();

            if (sessionData.authenticated && sessionData.user) {
                this.user = sessionData.user;
                this.isAuthenticated = true;
                this.initialized = true;
                this._saveState();
                this.notifyListeners();
                return;
            }

            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const valRes = await fetch('/api/v1/auth/validate-token', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (valRes.ok) {
                        const data = await valRes.json();
                        this.user = data.user;
                        this.isAuthenticated = true;
                        this.initialized = true;
                        this._saveState();
                        this.notifyListeners();
                        return;
                    } else {
                        localStorage.removeItem('token');
                        localStorage.removeItem('auth_state');
                    }
                } catch (e) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('auth_state');
                }
            }

            if (this._loadState() && this.user) {
                this.isAuthenticated = true;
                this.initialized = true;
                this.notifyListeners();
                return;
            }

            this.user = null;
            this.isAuthenticated = false;
            this.initialized = true;
            localStorage.removeItem('auth_state');
            this.notifyListeners();
        } catch (error) {
            console.error('AuthManager initialization error', error);
            this.user = null;
            this.isAuthenticated = false;
            this.initialized = true;
            this.notifyListeners();
        }
    }

    isAuthenticated() {
        return this.isAuthenticated;
    }

    getUser() {
        return this.user;
    }

    async refresh() {
        this.initialized = false;
        await this.initialize();
    }

    addListener(callback) {
        this.listeners.push(callback);
        if (this.initialized) {
            callback(this.isAuthenticated, this.user);
        }
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.isAuthenticated, this.user);
            } catch (e) {
                console.error('Listener error', e);
            }
        });
    }

    async login(email, password, csrfToken) {
        try {
            const res = await fetch('/api/v1/auth/session-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.data && data.data.token) {
                    localStorage.setItem('token', data.data.token);
                }
                this.user = data.data.user;
                this.isAuthenticated = true;
                this._saveState();
                this.notifyListeners();
                return { success: true, data: data.data, redirect: data.redirect };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: 'connection error' };
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('token');
        localStorage.removeItem('auth_state');
        this.user = null;
        this.isAuthenticated = false;
        this.notifyListeners();
        return { success: true };
    }
}

window.authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', async () => {
    await window.authManager.initialize();
    if (window.updateMenu) {
        window.updateMenu();
    }
});
