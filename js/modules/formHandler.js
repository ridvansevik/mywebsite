// js/modules/formHandler.js
import { getTranslation } from './languageManager.js'; // Import getTranslation

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
                console.log('Form Submitted:', { name, email, message });
                alert(getTranslation('formAlertSuccess', { name: name })); // Use translated alert
                contactForm.reset();
            } else {
                alert(getTranslation('formAlertFillAll')); // Use translated alert
            }
        });
    }
}