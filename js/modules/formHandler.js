// js/modules/formHandler.js
export function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');

            const name = nameInput ? nameInput.value : '';
            const email = emailInput ? emailInput.value : '';
            const message = messageInput ? messageInput.value : '';

            if (name && email && message) {
                // In a real scenario, you'd send this data to a server
                console.log('Form Submitted:', { name, email, message });
                alert(`Thank you, ${name}! Your message has been "sent" (logged to console).`);
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }
}