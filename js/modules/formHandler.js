// js/modules/formHandler.js
import { getTranslation } from './languageManager.js';

export function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            let originalButtonHTML = '';
            if (submitButton) {
                originalButtonHTML = submitButton.innerHTML; // Store the original HTML content
            }

            // Display loading state
            if (submitButton) {
                const sendingText = getTranslation('formSending') || 'Sending...';
                submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${sendingText}`;
                submitButton.disabled = true;
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert(getTranslation('formAlertSuccess', { name: formData.get('name') || 'there' }));
                    contactForm.reset();
                } else {
                    // Attempt to parse error from Formspree (it sends JSON errors)
                    const errorData = await response.json().catch(() => ({})); // Default to empty object if JSON parsing fails
                    let errorMessage = getTranslation('formAlertError'); // Default error
                    if (errorData && errorData.errors && errorData.errors.length > 0) {
                        // You could format these errors better if desired
                        errorMessage += "\n- " + errorData.errors.map(err => err.message || err.field || 'Unknown error').join("\n- ");
                    } else if (response.statusText) {
                         errorMessage += ` (${response.statusText})`;
                    }
                    alert(errorMessage);
                }
            } catch (error) {
                // Network or other errors
                console.error('Form submission error:', error);
                alert(getTranslation('formNetworkError'));
            } finally {
                // Restore button state
                if (submitButton) {
                    submitButton.innerHTML = originalButtonHTML; // Restore original HTML
                    submitButton.disabled = false;
                }
            }
        });
    }
}