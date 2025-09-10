const navToggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav');

if (navToggleButton) {
    navToggleButton.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        navToggleButton.setAttribute('aria-expanded', String(isOpen));
    });
}

// Simple form handling
const leadForm = document.querySelector('.lead-form');
if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(leadForm);
        const name = (formData.get('name') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        if (!name || !phone) {
            alert('Please provide your name and phone number.');
            return;
        }
        // Placeholder: integrate with backend or no-code form endpoint
        console.log('Lead submitted', { name, phone });
        alert('Thank you! We will contact you shortly.');
        leadForm.reset();
    });
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());


