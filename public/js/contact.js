document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    if (!feedbackForm) return;

    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value || '';
        const email = document.getElementById('email')?.value || '';
        const message = document.getElementById('message')?.value || '';
        const messageDiv = document.getElementById('formMessage');

        if (!name || !email || !message) {
            if (messageDiv) {
                messageDiv.innerHTML = '<p style="color: #ff0000;">Заполните все поля</p>';
            }
            return;
        }

        try {
            const response = await fetch('/api/v1/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (messageDiv) {
                if (data.success) {
                    messageDiv.innerHTML = '<p style="color: #00ff00;">Спасибо! Ваше сообщение отправлено.</p>';
                    feedbackForm.reset();
                } else {
                    messageDiv.innerHTML = `<p style="color: #ff0000;">${data.message || 'Ошибка отправки'}</p>`;
                }
            }
        } catch (error) {
            if (messageDiv) {
                messageDiv.innerHTML = '<p style="color: #ff0000;">error!</p>';
            }
            console.error('Contact error:', error);
        }

        setTimeout(() => {
            if (messageDiv) {
                messageDiv.innerHTML = '';
            }
        }, 3000);
    });
});
