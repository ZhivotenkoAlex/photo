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

// Simple i18n (EN, CS)
const translations = {
    en: {
        'nav.services': 'Services',
        'nav.portfolio': 'Portfolio',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'hero.title': 'Professional Photography Help',
        'hero.subtitle': 'Portraits, family stories, product shoots, events, and more. Capture the moments, elevate your brand.',
        'hero.cta': 'Book a Consultation',
        'svc.portrait': 'Portrait Session',
        'svc.family': 'Family Photography',
        'svc.event': 'Event Coverage',
        'svc.product': 'Product Photos',
        'svc.love': 'Love Stories',
        'svc.custom': 'Custom Request',
        'dark.title': 'Photography Services in Your City',
        'dark.desc': 'Experienced team, clear pricing, fast delivery. Submit your request and we’ll call you back within 15 minutes.',
        'form.name': 'Your name',
        'form.surname': 'Surname',
        'form.phone': 'Phone number',
        'form.contact': 'Additional connection (Telegram/Viber)',
        'form.city': 'City',
        'form.street': 'Street',
        'form.house': 'House number',
        'form.comment': 'Comment',
        'form.submit': 'Get a Quote',
        'form.note': 'By sending the form, you agree to our privacy policy.',
        'ph.name': 'Jane Doe',
        'ph.surname': 'Surname',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram or Viber number',
        'ph.city': 'City',
        'ph.street': 'Street name',
        'ph.house': 'e.g., 24A',
        'ph.comment': 'Describe your request (date, location, style)...',
    },
    cs: {
        'nav.services': 'Služby',
        'nav.portfolio': 'Portfolio',
        'nav.about': 'O nás',
        'nav.contact': 'Kontakt',
        'hero.title': 'Profesionální fotografické služby',
        'hero.subtitle': 'Portréty, rodinné příběhy, produktové focení, události a další. Zachyťte okamžiky, posuňte svou značku.',
        'hero.cta': 'Objednat konzultaci',
        'svc.portrait': 'Portrétní focení',
        'svc.family': 'Rodinná fotografie',
        'svc.event': 'Reportáž z událostí',
        'svc.product': 'Produktové fotky',
        'svc.love': 'Láskyplné příběhy',
        'svc.custom': 'Individuální požadavek',
        'dark.title': 'Fotografické služby ve vašem městě',
        'dark.desc': 'Zkušený tým, férové ceny, rychlé dodání. Zanechte žádost a do 15 minut se vám ozveme.',
        'form.name': 'Jméno',
        'form.surname': 'Příjmení',
        'form.phone': 'Telefon',
        'form.contact': 'Další kontakt (Telegram/Viber)',
        'form.city': 'Město',
        'form.street': 'Ulice',
        'form.house': 'Číslo domu',
        'form.comment': 'Komentář',
        'form.submit': 'Získat nabídku',
        'form.note': 'Odesláním formuláře souhlasíte se zásadami ochrany osobních údajů.',
        'ph.name': 'Jan Novák',
        'ph.surname': 'Příjmení',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram nebo číslo Viberu',
        'ph.city': 'Město',
        'ph.street': 'Název ulice',
        'ph.house': 'např. 24A',
        'ph.comment': 'Popište svou poptávku (termín, místo, styl)...',
    }
};

function applyI18n(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    localStorage.setItem('lang', lang);
    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

document.querySelectorAll('.lang-switch button').forEach((btn) => {
    btn.addEventListener('click', () => applyI18n(btn.getAttribute('data-lang')));
});

applyI18n(localStorage.getItem('lang') || 'en');
