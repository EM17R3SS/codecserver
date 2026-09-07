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
                messageDiv.innerHTML = '<p style="color: #ff0000;">Fill in all fields</p>';
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
                    messageDiv.innerHTML = '<p style="color: #00ff00;">Your message has been sent.</p>';
                    feedbackForm.reset();
                } else {
                    messageDiv.innerHTML = `<p style="color: #ff0000;">${data.message || 'Error sending message'}</p>`;
                }
            }
        } catch (error) {
            if (messageDiv) {
                messageDiv.innerHTML = '<p style="color: #ff0000;">Connection error</p>';
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
