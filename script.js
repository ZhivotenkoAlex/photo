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
        const surname = (formData.get('surname') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const contact = (formData.get('contact') || '').toString().trim();
        const city = (formData.get('city') || '').toString().trim();
        const street = (formData.get('street') || '').toString().trim();
        const house = (formData.get('house') || '').toString().trim();
        const comment = (formData.get('comment') || '').toString().trim();
        if (!name || !phone) {
            alert('Please provide your name and phone number.');
            return;
        }
        const url = 'https://script.google.com/macros/s/AKfycbybUEw5diLsBwObp-ON17grCKU6e-rJ762HesrnQjKB8VkwcVerNwyK32kdf3vBi4REqQ/exec'
        const qs = new URLSearchParams({ name, surname, phone, contact, city, street, house, comment });
        fetch(`${url}?${qs.toString()}`, { method: 'GET' })
            .then(async (r) => {
                const data = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(data.error || 'Request failed');
                alert('Thank you! We will contact you shortly.');
                leadForm.reset();
            })
            .catch((err) => {
                console.error(err);
                alert('Sorry, something went wrong. Please try again later.');
            });
    });
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());


