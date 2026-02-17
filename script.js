const navToggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav');
// const emailUrl = 'https://script.google.com/macros/s/AKfycbyTs5M0E_DNRt5xVgUUpzH422yaroOlw4AarYOqwXBuyj0IJzWMwP62nYs0sF521Egf2g/exec'
const emailUrl = 'https://script.google.com/macros/s/AKfycbwLOu4lVKPeiH6gHnBkMiN22cwAwdQL1JNxa3TlcLghneewoB8jR5EsswmGlTEkuo_u-w/exec'

// API Configuration
const API_BASE_URL = 'https://pracovnik.memoripraha.cz/api';

// API Helper Functions
async function fetchAPI(endpoint, params = {}) {
    const lang = getCurrentLang(); // Use consistent function
    const queryParams = new URLSearchParams({ lang, ...params });
    const url = `${API_BASE_URL}${endpoint}?${queryParams}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error?.message || 'API request failed');
        }
        
        return data.data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Get current language for translations
function getCurrentLang() {
    const lang = localStorage.getItem('lang');
    // Validate language code - only allow en, cs, uk
    if (lang && ['en', 'cs', 'uk'].includes(lang)) {
        return lang;
    }
    // Default to 'cs' to match initialization
    return 'cs';
}

// Get translated text from translation object
function getTranslatedText(textObj, lang = null) {
    if (!textObj || typeof textObj !== 'object') {
        return '';
    }
    const currentLang = lang || getCurrentLang();
    
    // Try current language first, then fallback chain: en -> cs -> uk -> first available
    let result = textObj[currentLang];
    if (result !== undefined && result !== null && result !== '') {
        return String(result);
    }
    
    // Fallback chain
    result = textObj.en || textObj.cs || textObj.uk;
    if (result !== undefined && result !== null) {
        return String(result);
    }
    
    // If still nothing, try to get first available value
    const keys = Object.keys(textObj);
    if (keys.length > 0) {
        const firstValue = textObj[keys[0]];
        return firstValue !== undefined && firstValue !== null ? String(firstValue) : '';
    }
    
    return '';
}

// Format price display
function formatPrice(price, priceRange, priceUnit = 'Kč') {
    if (priceRange) {
        return `${priceRange} ${priceUnit}`;
    }
    if (price) {
        return `${parseInt(price).toLocaleString('cs-CZ')} ${priceUnit}`;
    }
    return '';
}

if (navToggleButton) {
    navToggleButton.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        navToggleButton.setAttribute('aria-expanded', String(isOpen));
    });
}

// Add shadow when scrolled
const headerEl = document.querySelector('.site-header');
if (headerEl) {
    const onScroll = () => {
        if (window.scrollY > 10) headerEl.classList.add('is-scrolled');
        else headerEl.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

// Phone validation helper: allow spaces, dashes, parentheses; 9–15 digits; optional leading +
function isValidPhoneNumber(input) {
    const raw = String(input || '').trim();
    // keep only digits and leading plus
    const cleaned = raw
        .replace(/[^\d+]/g, '')       // remove everything except digits and plus
        .replace(/(?!^)\+/g, '');     // ensure only one leading +
    if (!cleaned) return false;
    // E.164: + and 9–15 digits, or national: 9–15 digits
    const e164 = /^\+[1-9]\d{8,14}$/;
    const national = /^\d{9,15}$/;
    return e164.test(cleaned) || national.test(cleaned);
}

// Toast helper (centered notification)
function showToast(message, variant = 'success', timeoutMs = 5000) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const lang = getCurrentLang();
    const dict = translations[lang] || translations.cs || translations.en;
    const ariaClose = dict['toast.close'] || 'Close';
    const toast = document.createElement('div');
    toast.className = 'toast' + (variant === 'error' ? ' toast--error' : '');
    toast.innerHTML = '<span>' + message + '</span><button class="toast__close" aria-label="' + ariaClose + '">×</button>';
    root.appendChild(toast);
    root.classList.add('is-active');
    const close = () => toast.remove();
    toast.querySelector('.toast__close').addEventListener('click', close);
    setTimeout(close, timeoutMs);
    const observer = new MutationObserver(() => {
        if (!root.querySelector('.toast')) {
            root.classList.remove('is-active');
        }
    });
    observer.observe(root, { childList: true });
}

// Close mobile menu when a nav item is clicked
document.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('is-open')) {
            navMenu.classList.remove('is-open');
            if (navToggleButton) navToggleButton.setAttribute('aria-expanded', 'false');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('is-open')) {
        const navbar = document.querySelector('.navbar');
        const isClickInsideNav = navMenu.contains(e.target) ||
            (navToggleButton && navToggleButton.contains(e.target)) ||
            (navbar && navbar.contains(e.target));

        if (!isClickInsideNav) {
            navMenu.classList.remove('is-open');
            if (navToggleButton) navToggleButton.setAttribute('aria-expanded', 'false');
        }
    }
});

// Portfolio: clicking any image navigates to contact
const portfolioGrid = document.querySelector('.gallery-grid');
if (portfolioGrid) {
    portfolioGrid.querySelectorAll('img').forEach((img) => {
        img.addEventListener('click', () => {
            window.location.href = './leadForm.html';
        });
    });
}

// Scroll helper to account for sticky header offset
function getHeaderOffset() {
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue('--header-offset');
        const n = parseInt(String(v).replace(/[^\d.-]/g, ''), 10);
        return isFinite(n) ? n : 0;
    } catch (_) {
        return 0;
    }
}
function scrollToWithOffset(target) {
    if (!target) return;
    try {
        const offset = Math.max(0, getHeaderOffset() + 100); // a bit larger than menu anchor
        const rect = target.getBoundingClientRect();
        const top = rect.top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        if (typeof target.focus === 'function') target.focus({ preventScroll: true });
    } catch (_) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof target.focus === 'function') target.focus();
    }
}

// Simple form handling (lead form on index)
const leadForm = document.querySelector('.lead-form:not(.coop-form)');
if (leadForm) {
    // Add multiselect limit handlers
    const packageSelect = leadForm.querySelector('select[name="package"]');
    const serviceSelect = leadForm.querySelector('select[name="service"]');
    
    if (packageSelect) {
        packageSelect.addEventListener('change', (e) => {
            const selected = Array.from(e.target.selectedOptions).filter(opt => opt.value);
            if (selected.length > 3) {
                // Deselect the last selected option
                selected[selected.length - 1].selected = false;
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                showToast(dict['err.max_packages'] || 'Maximum 3 packages can be selected', 'error');
            }
        });
    }
    
    if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => {
            const selected = Array.from(e.target.selectedOptions).filter(opt => opt.value);
            if (selected.length > 4) {
                // Deselect the last selected option
                selected[selected.length - 1].selected = false;
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                showToast(dict['err.max_services'] || 'Maximum 4 services can be selected', 'error');
            }
        });
    }
    
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Sync custom multiselect checkboxes with hidden select elements before form submission
        const packageMultiselect = leadForm.querySelector('.custom-multiselect[data-name="package"]');
        const serviceMultiselect = leadForm.querySelector('.custom-multiselect[data-name="service"]');
        
        if (packageMultiselect) {
            const packageSelect = leadForm.querySelector('select[name="package"]');
            if (packageSelect) {
                const checkedBoxes = packageMultiselect.querySelectorAll('.custom-multiselect__checkbox:checked');
                const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);
                // Clear all selections first
                Array.from(packageSelect.options).forEach(opt => {
                    opt.selected = false;
                });
                // Set selected values
                selectedValues.forEach(value => {
                    const option = packageSelect.querySelector(`option[value="${value}"]`);
                    if (option && !option.disabled) option.selected = true;
                });
            }
        }
        
        if (serviceMultiselect) {
            const serviceSelect = leadForm.querySelector('select[name="service"]');
            if (serviceSelect) {
                const checkedBoxes = serviceMultiselect.querySelectorAll('.custom-multiselect__checkbox:checked');
                const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);
                // Clear all selections first
                Array.from(serviceSelect.options).forEach(opt => {
                    opt.selected = false;
                });
                // Set selected values
                selectedValues.forEach(value => {
                    const option = serviceSelect.querySelector(`option[value="${value}"]`);
                    if (option && !option.disabled) option.selected = true;
                });
            }
        }
        
        const formData = new FormData(leadForm);
        const name = (formData.get('name') || '').toString().trim();
        const surname = (formData.get('surname') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const contact = (formData.get('contact') || '').toString().trim();
        
        // Get selected values directly from select elements (more reliable than FormData.getAll)
        const packageSelect = leadForm.querySelector('select[name="package"]');
        const serviceSelect = leadForm.querySelector('select[name="service"]');
        const packages = packageSelect ? Array.from(packageSelect.selectedOptions)
            .filter(opt => !opt.disabled && opt.value)
            .map(opt => opt.value)
            .filter(p => p && p.trim()) : [];
        const services = serviceSelect ? Array.from(serviceSelect.selectedOptions)
            .filter(opt => !opt.disabled && opt.value)
            .map(opt => opt.value)
            .filter(s => s && s.trim()) : [];
        
        const city = (formData.get('city') || '').toString().trim();
        const street = (formData.get('street') || '').toString().trim();
        const house = (formData.get('house') || '').toString().trim();
        const comment = (formData.get('comment') || '').toString().trim();
        // Basic validation
        // clear previous errors
        leadForm.querySelectorAll('.field-error').forEach(el => el.remove());
        leadForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        leadForm.querySelectorAll('.custom-multiselect__trigger.error').forEach(el => el.classList.remove('error'));
        const errors = [];
        const lang = getCurrentLang();
        const dict = translations[lang] || translations.cs || translations.en;
        const markError = (selectorKey, messageKey) => {
            const field = leadForm.querySelector(`[name="${selectorKey}"]`);
            if (field) {
                field.classList.add('error');
                // Also mark custom multiselect trigger if it exists
                const customMultiselect = leadForm.querySelector(`.custom-multiselect[data-name="${selectorKey}"]`);
                if (customMultiselect) {
                    const trigger = customMultiselect.querySelector('.custom-multiselect__trigger');
                    if (trigger) trigger.classList.add('error');
                }
                const msg = document.createElement('div');
                msg.className = 'field-error';
                msg.textContent = dict[messageKey] || dict['err.required'];
                const parent = customMultiselect || field.parentElement;
                parent.appendChild(msg);
            }
        };
        if (!name) { errors.push('name'); markError('name', 'err.required'); }
        if (!surname) { errors.push('surname'); markError('surname', 'err.required'); }
        if (!city) { errors.push('city'); markError('city', 'err.required'); }
        if (!street) { errors.push('street'); markError('street', 'err.required'); }
        if (!house) { errors.push('house'); markError('house', 'err.required'); }
        const phoneValid = isValidPhoneNumber(phone);
        if (!phone) {
            errors.push('phone');
            markError('phone', 'err.required');
        } else if (!phoneValid) {
            errors.push('phone');
            markError('phone', 'err.phone');
        }
        // Validate multiselect limits
        if (packages.length > 3) {
            errors.push('package');
            markError('package', 'err.max_packages');
        }
        if (services.length > 4) {
            errors.push('service');
            markError('service', 'err.max_services');
        }
        
        // At least one of package or service must be selected
        if (packages.length === 0 && services.length === 0) {
            errors.push('package');
            errors.push('service');
            markError('package', 'err.package_or_service');
            markError('service', 'err.package_or_service');
        }
        if (errors.length) {
            const firstErrorEl = leadForm.querySelector('.error');
            if (firstErrorEl) scrollToWithOffset(firstErrorEl);
            return;
        }
        const url = 'https://pracovnik.memoripraha.cz/api/submit-order';
        const payload = {
            name,
            surname,
            phone,
            city,
            street,
            house,
            package: packages, // Always send as array (empty if none selected)
            service: services   // Always send as array (empty if none selected)
        };
        // Only include optional fields that have values
        if (contact && contact.trim()) payload.contact = contact;
        if (comment && comment.trim()) payload.comment = comment;

        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(async (r) => {
                if (!r.ok) {
                    const errorData = await r.json().catch(() => ({}));
                    // Handle 422 validation errors
                    if (r.status === 422 && errorData.errors) {
                        // Clear previous errors
                        leadForm.querySelectorAll('.field-error').forEach(el => el.remove());
                        leadForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

                        // Show field-specific errors
                        Object.keys(errorData.errors).forEach(field => {
                            const fieldName = field === 'package' ? 'package' : field;
                            markError(fieldName, 'err.required');
                            const fieldEl = leadForm.querySelector(`[name="${fieldName}"]`);
                            if (fieldEl) {
                                const errorMsg = Array.isArray(errorData.errors[field])
                                    ? errorData.errors[field][0]
                                    : errorData.errors[field];
                                const msg = document.createElement('div');
                                msg.className = 'field-error';
                                msg.textContent = errorMsg;
                                fieldEl.parentElement.appendChild(msg);
                            }
                        });
                        const firstErrorEl = leadForm.querySelector('.error');
                        if (firstErrorEl) scrollToWithOffset(firstErrorEl);
                        return;
                    }
                    throw new Error(errorData.message || `HTTP ${r.status}: ${r.statusText}`);
                }
                const data = await r.json().catch(() => ({}));
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.success'] || 'Thank you! We will contact you shortly.');
                }
                leadForm.reset();
                // Reset custom multiselect dropdowns
                leadForm.querySelectorAll('.custom-multiselect').forEach(ms => {
                    ms.querySelectorAll('.custom-multiselect__checkbox').forEach(cb => cb.checked = false);
                    const name = ms.getAttribute('data-name');
                    const placeholderKey = name === 'package' ? 'form.package_placeholder' : 'form.service_placeholder';
                    const lang = getCurrentLang();
                    const dict = translations[lang] || translations.cs || translations.en;
                    const display = ms.querySelector('.custom-multiselect__display');
                    if (display) display.textContent = dict[placeholderKey] || 'Choose...';
                });
            })
            .catch((err) => {
                console.error('Order submission error:', err);
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                let errorMsg = dict['toast.error'] || 'Sorry, something went wrong. Please try again later.';
                if (err.message && err.message.includes('CORS')) {
                    errorMsg = 'CORS error: Please contact the administrator.';
                }
                if (typeof showToast === 'function') {
                    showToast(errorMsg, 'error');
                }
            });
    });
}

// Cooperation form handling (on cooperation.html)
const coopForm = document.querySelector('.coop-form');
if (coopForm) {
    coopForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(coopForm);
        const name = (formData.get('name') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const city = (formData.get('city') || '').toString().trim();
        const role = (formData.get('role') || '').toString().trim();
        const portfolio = (formData.get('portfolio') || '').toString().trim();
        const experience = (formData.get('experience') || '').toString().trim();
        const equipment = (formData.get('equipment') || '').toString().trim();
        const comment = (formData.get('comment') || '').toString().trim();
        const drivingB = formData.get('driving_b') ? 'yes' : 'no';

        // clear previous errors
        coopForm.querySelectorAll('.field-error').forEach(el => el.remove());
        coopForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        const errors = [];
        const lang = getCurrentLang();
        const dict = translations[lang] || translations.cs || translations.en;
        const markError = (selectorKey, messageKey) => {
            const field = coopForm.querySelector(`[name="${selectorKey}"]`);
            if (field) {
                field.classList.add('error');
                const msg = document.createElement('div');
                msg.className = 'field-error';
                msg.textContent = dict[messageKey] || dict['err.required'];
                field.parentElement.appendChild(msg);
            }
        };

        if (!name) { errors.push('name'); markError('name', 'err.required'); }
        if (!city) { errors.push('city'); markError('city', 'err.required'); }
        if (!role) { errors.push('role'); markError('role', 'err.required'); }
        if (!portfolio) { errors.push('portfolio'); markError('portfolio', 'err.required'); }
        const phoneValid = isValidPhoneNumber(phone);
        if (!phone) { errors.push('phone'); markError('phone', 'err.required'); }
        else if (!phoneValid) { errors.push('phone'); markError('phone', 'err.phone'); }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.push('email'); markError('email', 'err.email'); }
        if (errors.length) {
            const firstErrorEl = coopForm.querySelector('.error');
            if (firstErrorEl) scrollToWithOffset(firstErrorEl);
            return;
        }

        const url = 'https://pracovnik.memoripraha.cz/api/submit-collaboration';
        const payload = {
            name,
            phone,
            city,
            role,
            portfolio,
            driving_b: drivingB === 'yes'
        };
        // Only include fields that have values
        if (email) payload.email = email;
        if (experience) payload.experience = experience;
        if (equipment) payload.equipment = equipment;
        if (comment) payload.comment = comment;

        fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(async (r) => {
                if (!r.ok) {
                    const errorData = await r.json().catch(() => ({}));
                    // Handle 422 validation errors
                    if (r.status === 422 && errorData.errors) {
                        // Clear previous errors
                        coopForm.querySelectorAll('.field-error').forEach(el => el.remove());
                        coopForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

                        // Show field-specific errors
                        Object.keys(errorData.errors).forEach(field => {
                            markError(field, 'err.required');
                            const fieldEl = coopForm.querySelector(`[name="${field}"]`);
                            if (fieldEl) {
                                const errorMsg = Array.isArray(errorData.errors[field])
                                    ? errorData.errors[field][0]
                                    : errorData.errors[field];
                                const msg = document.createElement('div');
                                msg.className = 'field-error';
                                msg.textContent = errorMsg;
                                fieldEl.parentElement.appendChild(msg);
                            }
                        });
                        const firstErrorEl = coopForm.querySelector('.error');
                        if (firstErrorEl) scrollToWithOffset(firstErrorEl);
                        return;
                    }
                    throw new Error(errorData.message || `HTTP ${r.status}: ${r.statusText}`);
                }
                const data = await r.json().catch(() => ({}));
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.success'] || 'Thank you! We will contact you shortly.');
                }
                coopForm.reset();
            })
            .catch((err) => {
                console.error('Collaboration submission error:', err);
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                let errorMsg = dict['toast.error'] || 'Sorry, something went wrong. Please try again later.';
                if (err.message && err.message.includes('CORS')) {
                    errorMsg = 'CORS error: Please contact the administrator.';
                }
                if (typeof showToast === 'function') {
                    showToast(errorMsg, 'error');
                }
            });
    });
}

// Year in footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Simple i18n (EN, CS)
const translations = {
    en: {
        'footer.privacy': 'Privacy',
        'footer.terms': 'Terms',
        'footer.phone': 'Phone',
        'footer.email': 'Email',
        'nav.coop': 'Cooperation',
        'nav.services': 'Services',
        'nav.portfolio': 'Portfolio',
        // Portfolio
        'portfolio.title': 'Selected Works',
        'portfolio.subtitle': 'A glimpse into our photography and video projects.',
        'team.title': 'Our Team',
        'team.owner_desc': '3D rendering. Taking and processing photos and videos.',
        'team.videographer_desc': 'Wedding and corporate video production.',
        'team.agent_desc': 'Friendly first contact who confirms details and timing.',
        // Team labels
        'team.label_name': 'Name',
        'team.label_experience': 'Experience',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ years',
        'team.name_photographer': '—',
        'team.name_videographer': 'Obiwan',
        'team.exp_videographer': '5+ years',
        'team.name_agent': '3CPO',
        'team.exp_agent': '2+ years',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'nav.price': 'Price',
        'nav.lessons': 'Učitel',
        'lessons.title': 'Učitel',
        'lessons.subtitle': 'Learn new skills with our experienced teachers in Prague. Individual approach, flexible schedule, practical focus.',
        'lessons.photo_title': '📷 Photography Lessons',
        'lessons.photo_basics': 'Photography Basics',
        'lessons.photo_basics_desc': 'Camera settings, composition, lighting basics. For beginners.',
        'lessons.photo_portrait': 'Portrait Photography',
        'lessons.photo_portrait_desc': 'Working with people, posing, natural and studio lighting.',
        'lessons.photo_editing': 'Photo Editing',
        'lessons.photo_editing_desc': 'Lightroom, Photoshop basics, color grading, retouching.',
        'lessons.photo_package': 'Package: 5 lessons',
        'lessons.photo_package_desc': 'Complete course from basics to advanced. Save 500 Kč!',
        'lessons.guitar_title': '🎸 Guitar Lessons',
        'lessons.guitar_basics': 'Guitar for Beginners',
        'lessons.guitar_basics_desc': 'Chords, strumming, first songs. Acoustic or electric.',
        'lessons.guitar_intermediate': 'Intermediate Level',
        'lessons.guitar_intermediate_desc': 'Fingerstyle, barre chords, music theory, improvisation.',
        'lessons.guitar_songs': 'Learn Your Favorite Songs',
        'lessons.guitar_songs_desc': "We'll learn the songs you want to play. Any genre!",
        'lessons.guitar_package': 'Package: 8 lessons',
        'lessons.guitar_package_desc': 'From zero to confident playing. Save 700 Kč!',
        'lessons.czech_title': '🇨🇿 Czech Language Lessons',
        'lessons.czech_basics': 'Czech for Beginners (A1-A2)',
        'lessons.czech_basics_desc': 'Basics, everyday phrases, grammar foundations.',
        'lessons.czech_conversation': 'Conversational Czech',
        'lessons.czech_conversation_desc': 'Practice speaking, real-life situations, fluency building.',
        'lessons.czech_business': 'Czech for Work',
        'lessons.czech_business_desc': 'Business vocabulary, formal communication, documents.',
        'lessons.czech_package': 'Package: 10 lessons',
        'lessons.czech_package_desc': 'Intensive course for fast progress. Save 1 000 Kč!',
        'lessons.note': 'All lessons are individual. First lesson — introductory price!',
        'hero.title': 'Professional photography service',
        'hero.subtitle': 'Memori — your moment that stays in memory. The celebration passes quickly, but memories live forever. Preserve your special day so every moment stays with you.',
        'hero.cta': 'Book a Consultation',
        'svc.portrait': 'Portrait Session',
        'svc.family': 'Family Photography',
        'svc.event': 'Event Coverage',
        'svc.product': 'Product Photos',
        'svc.love': 'Love Stories',
        'svc.custom': 'Custom Request',
        'svc.photo_birthday': 'Birthday photography',
        'svc.photo_wedding': 'Wedding photography',
        'svc.photo_corporate': 'Corporate photography',
        'svc.photo_other_session': 'Other photo session',
        'svc.video_birthday': 'Birthday video',
        'svc.video_wedding': 'Wedding video',
        'svc.video_corporate': 'Corporate video',
        'svc.video_advertising': 'Advertising video',
        'svc.photo_studio': 'Studio photo session',
        'svc.video_misc': 'Other video',
        'group.photo': 'Photo',
        'group.video': 'Video',
        'group.adv_video': 'Advertising Video',
        'group.lessons': 'Lessons',
        'dark.title': 'Photography Services in Your City',
        'dark.desc': 'Experienced team, clear pricing, fast delivery. Submit your request and we’ll call you back within 1 hour.',
        'form.name': 'Your name',
        'form.surname': 'Surname',
        'form.phone': 'Phone number',
        'form.contact': 'Additional connection (Telegram/Viber)',
        'form.city': 'City',
        'form.street': 'Street',
        'form.house': 'House number',
        'form.comment': 'Comment',
        'form.package': 'Package',
        'form.package_placeholder': 'Choose a package',
        'form.service': 'Service',
        'form.service_placeholder': 'Choose a service',
        'form.required_hint': 'Fields marked with * are required.',
        'err.required': 'This field is required',
        'err.phone': 'Enter a valid phone number',
        'err.package_or_service': 'Please select either a package or a service',
        'err.max_packages': 'Maximum 3 packages can be selected',
        'err.max_services': 'Maximum 4 services can be selected',
        'form.selected': 'selected',
        'form.submit': 'Send',
        'form.note': 'By sending the form, you agree to our privacy policy.',
        // Cooperation page
        'coop.title': 'Work with Memori',
        'coop.desc': 'Photographers and videographers — send your application to collaborate with our team.',
        'coop.note': 'A Memory manager will contact you within 24 hours.',
        'form.email': 'Email',
        'form.role': 'Role',
        'form.role_placeholder': 'Choose a role',
        'role.founder': 'Founder',
        'role.empty': 'Empty',
        'role.photographer': 'Photographer',
        'role.videographer': 'Videographer',
        'role.photo_editor': 'Photo editor',
        'role.video_editor': 'Video editor',
        'role.call_agent': 'Call agent',
        'role.admin': 'Administrator',
        'team.founder_name': 'Eugene',
        'team.worker_name_2': 'Obiwan',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Chubaka',
        'team.photo_editor_desc': 'Photo editing.',
        'team.video_editor_desc': 'Video editing.',
        'team.hanna_name': 'Hanna',
        'team.hanna_role': 'Administrator',
        'team.hanna_exp': '1,5+ years',
        'team.hanna_desc': 'Scheduling photo sessions and client coordination.',
        'team.hanna_description': '<p>Alina is our dedicated administrator who ensures everything runs smoothly behind the scenes. With her excellent organizational skills and friendly approach, she handles client inquiries, schedules photo and video sessions, and coordinates our creative team.</p><p>Her attention to detail and proactive communication style make sure every client feels valued and informed — from the moment of booking to receiving your finished photos and videos.</p>',
        'team.mykhailo_name': 'Mykhailo',
        'team.mykhailo_role': 'Delivery',
        'team.mykhailo_desc': 'Fast and reliable delivery of your orders.',
        'team.mykhailo_description': '<p>Mykhailo is our dedicated delivery specialist who ensures your orders reach you safely and on time. With his attention to detail and commitment to customer satisfaction, he handles the logistics of getting your photos, videos, and photo products delivered to your doorstep.</p><p>His reliable service and friendly approach make sure that every delivery is handled with care, ensuring that your precious memories arrive in perfect condition. Mykhailo coordinates with our team to schedule deliveries at convenient times and locations, making the entire process smooth and hassle-free for our clients.</p>',
        'team.zhenya_name': 'Evgenia',
        'team.zhenya_role': 'Photographer',
        'team.zhenya_exp': '4+ years',
        'team.zhenya_desc': 'Capturing live frames about feelings and moments with natural light and emotions.',
        'team.zhenya_description': '<p>Evgenia is a talented photographer specializing in capturing authentic moments and emotions through natural light photography. With over 4 years of experience, she creates beautiful, genuine images that tell stories about feelings and special moments.</p><p>She specializes in individual photoshoots, love stories, family sessions, and weddings. Her work is characterized by natural light, genuine emotions, and a focus on capturing the true essence of each moment. Evgenia brings her artistic vision and professional expertise to every session.</p><p>Her approach to photography emphasizes authenticity and emotion, ensuring that every frame reflects the real feelings and connections between people. Whether it\'s an intimate couple session, a joyful family gathering, or a romantic love story, Evgenia knows how to capture the magic of the moment.</p>',
        'team.founder_description': '<p>After completing my career as a professional stuntman, I finally dedicated myself to what had always called to me — the art of capturing moments. Years of intense physical performance taught me to see beauty in motion, to anticipate the perfect moment, and to understand the power of visual storytelling.</p><p>My background in stunts gave me a unique perspective on composition, timing, and the ability to stay calm under pressure. I know firsthand what it takes to capture the perfect shot — whether it is a split-second expression or a dynamic action sequence. This experience drives everything we do at Memori.</p><p>As the founder, I oversee every project to ensure the highest quality. I coordinate our talented team, manage client relationships, and personally supervise complex shoots. My mission is simple: to help people preserve their most precious moments with exceptional quality and attention to detail.</p><p>Memori is not just a business — it is the realization of a lifelong passion. Every frame we capture, every video we produce, carries the dedication and expertise that comes from truly loving what you do.</p>',
        'form.portfolio': 'Portfolio link',
        'form.experience': 'Experience (years)',
        'form.equipment': 'Equipment',
        'form.driving_b': "Having a category B driver's license",
        'form.agreed': 'If agreed, there is a pre-payment of 40% of the amount.',
        'toggle.yes': 'Yes',
        'toggle.no': 'No',
        'ph.email': 'name@example.com',
        'ph.portfolio': 'https://portfolio.example.com',
        'ph.name': 'Jane',
        'ph.surname': 'Doe',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram or Viber number',
        'ph.city': 'City',
        'ph.street': 'Street name',
        'ph.house': 'e.g., 24A',
        'ph.comment': 'Describe your request (date, location, style)...',
        'pricing.title': 'Packages and pricing (CZK)',
        'pricing.discount': 'Grand Opening Special: 30% discount on all packages until 21.05.2026!',
        'pricing.note': "Prices are indicative and may vary depending on location, timing and specific requirements.",
        'pricing.order': 'Order',
        'pricing.note_confirm': 'We will confirm the final quote after a quick chat.',
        'pricing.photo': 'Photography',
        'pricing.standard': 'Standard — 90 min + 40 photos',
        'pricing.basic': 'Basic — 60 min + 25 photos',
        'pricing.premium': 'Premium — 120 min + 60 photos',
        'pricing.studio_session': 'Studio photo session',
        'pricing.studio_session_desc': '1 hour, 1–2 people (max 4). Portraits, family, maternity. 10 edited photos.',
        'pkg.wedding_platinum': 'Platinum — 12 hours of photography, USB flash drive, 400 processed photos',
        'pkg.wedding_gold': 'Gold — 8 hours of photography, 300 processed photos, USB flash drive',
        'pkg.wedding_silver': 'Silver — 4 hours of photography, 150 processed photos',
        'pricing.video': 'Videography',
        'pricing.video_hour': '1 hour',
        'pricing.adv_title': 'Advertising video services',
        'pricing.love_story': 'Love Story',
        'pricing.love_story_desc': '1–2 min video, 1–1.5h shoot, editing, music, color grading',
        'pricing.mini_business': 'Mini Video for Business',
        'pricing.mini_business_desc': '15–45 sec, vertical, for cafes, salons, shops. Editing + titles + logo',
        'pricing.interview': 'Interview / Report',
        'pricing.interview_desc': 'Professional interview, lapel mic, stabilizer, editing, basic graphics',
        'pricing.product_review': 'Product / Ad Review',
        'pricing.product_review_desc': 'For small business: cosmetics, tech, food',
        'pricing.editing_only': 'Video Editing (no shooting)',
        'pricing.editing_only_desc': '300–600 Kč/min of final video or 200 Kč/hour',
        'pricing.event_video': 'Event Video',
        'pricing.event_video_desc': 'Parties, fairs, events. Editing: 1 000–3 000 Kč',
        'pricing.promo_video': 'Promo / Announcement',
        'pricing.promo_video_desc': '1 presenter on camera, professional promo',
        'pricing.reels_tiktok': 'Reels / TikTok Series',
        'pricing.reels_tiktok_desc': 'Vertical videos, package of 10–20 clips',
        'pricing.photo_video_set': 'Photo + Video Set for Instagram',
        'pricing.photo_video_set_desc': '30 photos + 1 short video',
        'pricing.video_card': 'Video Business Card',
        'pricing.video_card_desc': '60–90 sec about specialist: hairdresser, tattoo, master',
        'pricing.real_estate': 'Real Estate Video',
        'pricing.real_estate_desc': 'Apartments, rooms — realtors always need this',
        'pricing.mini_clip': 'Artist Mini Clip',
        'pricing.mini_clip_desc': 'Music video for artists and musicians',
        'pricing.extras': 'Extras',
        'pricing.print_all': 'Printing all package photos',
        'pricing.video_disc': 'Video on disc',
        'pricing.prepaid': 'If agreed, there is a pre-payment of 40% of the amount.',
        'pricing.page_title': 'Packages and Pricing',
        'pricing.page_note': 'Prices are indicative and may vary depending on location, timing and specific requirements. We\'ll confirm the final quote after a quick chat.',
        'pricing.products': 'Photo Products',
        'pricing.photo_tshirt': 'Photo on t-shirt',
        'pricing.photo_hoodie': 'Photo on hoodie',
        'pricing.photo_mug': 'Photo on mug',
        'pricing.photo_case': 'Photo on phone case',
        'pricing.photo_pillow': 'Photo on pillow',
        'pricing.photo_bear': 'Photo on teddy bear',
        'pricing.photo_metal_15x20': 'Photo on metal 15×20 cm',
        'pricing.photo_metal_30x40': 'Photo on metal 30×40 cm',
        'pricing.photo_calendar': 'Calendar',
        'pricing.photo_car_pendant': 'Car pendant with photo',
        'pricing.photo_backpack_badge': 'Badge for backpack',
        'pricing.gift_certificates': 'Gift Certificates',
        'voucher.basic': 'Gift Certificate "Basic Package"',
        'voucher.basic_short': '60 min session + 25 edited photos',
        'voucher.basic_desc': '<p><strong>Perfect gift for any occasion!</strong></p><p>The Basic package includes:</p><ul><li>60 minutes of professional photo session</li><li>25 professionally edited photos</li><li>Prague and surrounding areas</li><li>Valid for 6 months from purchase</li></ul>',
        'voucher.standard': 'Gift Certificate "Standard Package"',
        'voucher.standard_short': '90 min session + 40 edited photos',
        'voucher.standard_desc': '<p><strong>The ideal gift for capturing special moments!</strong></p><p>The Standard package includes:</p><ul><li>90 minutes of professional photo session</li><li>40 professionally edited photos</li><li>Prague and surrounding areas</li><li>Valid for 6 months from purchase</li></ul>',
        'form.location': 'We are currently working in Prague and the surrounding areas.',
        'pkg.basic': 'Basic — 60 min + 25 photos',
        'pkg.standard': 'Standard — 90 min + 40 photos',
        'pkg.premium': 'Premium — 120 min + 60 photos',
        'pkg.video_hour': 'Video',
        'about.title': 'The story of Memori',
        'about.p1': 'Memori is a team that preserves what matters most in life — your moments. We shoot professional photo and video, create custom clips and slide shows, print photos, and make sure no important event gets lost in time.',
        'about.p2': 'Our videographers and photographers do everything to make your moment unforgettable. We put not only technology but also soul into every project so images convey genuine emotions.',
        'about.p3': 'Our goal is simple — to give people the chance to return to their memories whenever they wish. A wedding, a birthday, a baby’s first smile, a concert, a performance, or just an ordinary day that became special — all this can be relived by opening an album or pressing play.',
        'about.p4': 'We do this because we believe moments are true wealth. Things can be replaced, but feelings, emotions, and memories are priceless. That’s why Memori was created — to stop time in a frame and give people a memory that does not fade.',
        'about.p5': 'Our philosophy is simple: life is made of moments — and we make them timeless.',
        'toast.success': 'Thank you! We received your request. Our team will reach out shortly to clarify details and confirm the time.',
        'toast.error': 'Sorry, something went wrong. Please try again later or contact us directly.',
        'toast.close': 'Close',
    },
    cs: {
        'footer.privacy': 'Soukromí',
        'footer.terms': 'Podmínky',
        'footer.phone': 'Telefon',
        'footer.email': 'E-mail',
        'nav.coop': 'Spolupráce',
        'nav.services': 'Služby',
        'nav.portfolio': 'Portfolio',
        // Portfolio
        'portfolio.title': 'Ukázky prací',
        'portfolio.subtitle': 'Nahlédněte do našich foto a video projektů.',
        'team.title': 'Náš tým',
        'team.owner_desc': '3D rendering. Pořizování a zpracování fotografií a videí.',
        'team.videographer_desc': 'Svatby a firemní video produkce.',
        'team.agent_desc': 'Přátelský první kontakt, který potvrdí detaily a čas.',
        // Team labels
        'team.label_name': 'Jméno',
        'team.label_experience': 'Zkušenosti',
        'team.founder_name': 'Evgen',
        'team.worker_name_2': 'Obiwan',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Chubaka',
        'team.photo_editor_desc': 'Úprava fotografií.',
        'team.video_editor_desc': 'Střih videa.',
        'team.hanna_name': 'Hanna',
        'team.hanna_role': 'Administrátor',
        'team.hanna_exp': '1,5+ roky',
        'team.hanna_desc': 'Plánování focení a koordinace s klienty.',
        'team.hanna_description': '<p>Alina je naše oddaná administrátorka, která zajišťuje hladký chod všeho v zákulisí. S vynikajícími organizačními schopnostmi a přátelským přístupem vyřizuje dotazy klientů, plánuje foto a video sezení a koordinuje náš kreativní tým.</p><p>Její pozornost k detailům a proaktivní komunikační styl zajišťují, že se každý klient cítí ceněný a informovaný — od okamžiku rezervace až po obdržení hotových fotografií a videí.</p>',
        'team.mykhailo_name': 'Michal',
        'team.mykhailo_role': 'Doručovatel',
        'team.mykhailo_desc': 'Rychlé a spolehlivé doručení vašich objednávek.',
        'team.mykhailo_description': '<p>Michal je náš specialista na doručování, který zajišťuje, aby vaše objednávky dorazily bezpečně a včas. S pozorností k detailům a závazkem k spokojenosti zákazníků řeší logistiku doručování vašich fotografií, videí a fotoproduktů až k vám domů.</p><p>Jeho spolehlivá služba a přátelský přístup zajišťují, že každé doručení je provedeno s péčí, aby vaše cenné vzpomínky dorazily v perfektním stavu. Michal koordinuje s naším týmem plánování doručení v pohodlných časech a na vhodných místech, což činí celý proces plynulým a bezproblémovým pro naše klienty.</p>',
        'team.zhenya_name': 'Evgenia',
        'team.zhenya_role': 'Fotograf',
        'team.zhenya_exp': '4+ let',
        'team.zhenya_desc': 'Zachycování živých snímků o pocitech a okamžicích s přirozeným světlem a emocemi.',
        'team.zhenya_description': '<p>Evgenia je talentovaná fotografka specializující se na zachycování autentických okamžiků a emocí prostřednictvím fotografie s přirozeným světlem. S více než 4 lety zkušeností vytváří krásné, upřímné snímky, které vyprávějí příběhy o pocitech a zvláštních okamžicích.</p><p>Specializuje se na individuální focení, love story, rodinné sezení a svatby. Její práce je charakterizována přirozeným světlem, upřímnými emocemi a zaměřením na zachycení skutečné podstaty každého okamžiku. Evgenia přináší svou uměleckou vizi a profesionální odbornost do každého sezení.</p><p>Její přístup k fotografii zdůrazňuje autentičnost a emoce, zajišťující, že každý snímek odráží skutečné pocity a spojení mezi lidmi. Ať už jde o intimní párové sezení, radostné rodinné setkání nebo romantickou love story, Evgenia ví, jak zachytit magii okamžiku.</p>',
        'team.founder_description': '<p>Po ukončení kariéry profesionálního kaskadéra jsem se konečně věnoval tomu, co mě vždy přitahovalo — umění zachycovat okamžiky. Roky intenzivního fyzického výkonu mě naučily vidět krásu v pohybu, předvídat dokonalý moment a chápat sílu vizuálního vyprávění.</p><p>Moje zkušenosti s kaskadérstvím mi daly jedinečný pohled na kompozici, načasování a schopnost zůstat v klidu pod tlakem. Vím z první ruky, co je potřeba k zachycení dokonalého záběru — ať už jde o zlomek sekundy výrazu nebo dynamickou akční sekvenci. Tyto zkušenosti pohání vše, co v Memori děláme.</p><p>Jako zakladatel dohlížím na každý projekt, abych zajistil nejvyšší kvalitu. Koordinuji náš talentovaný tým, starám se o vztahy s klienty a osobně dohlížím na složité natáčení. Mým posláním je jednoduché: pomoci lidem uchovat jejich nejcennější okamžiky s výjimečnou kvalitou a pozorností k detailům.</p><p>Memori není jen podnikání — je to realizace celoživotní vášně. Každý záběr, který zachytíme, každé video, které vytvoříme, nese oddanost a odbornost, která pochází z opravdové lásky k tomu, co děláte.</p>',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ let',
        'team.name_photographer': '—',
        'team.name_videographer': 'Obiwan',
        'team.exp_videographer': '5+ let',
        'team.name_agent': '3CPO',
        'team.exp_agent': '2+ roky',

        'nav.about': 'O nás',
        'nav.contact': 'Kontakt',
        'nav.price': 'Ceny',
        'nav.lessons': 'Učitel',
        'lessons.title': 'Učitel',
        'lessons.subtitle': 'Naučte se nové dovednosti s našimi zkušenými lektory v Praze. Individuální přístup, flexibilní rozvrh, praktické zaměření.',
        'lessons.photo_title': '📷 Lekce fotografování',
        'lessons.photo_basics': 'Základy fotografování',
        'lessons.photo_basics_desc': 'Nastavení fotoaparátu, kompozice, základy osvětlení. Pro začátečníky.',
        'lessons.photo_portrait': 'Portrétní fotografie',
        'lessons.photo_portrait_desc': 'Práce s lidmi, pózování, přirozené a studiové osvětlení.',
        'lessons.photo_editing': 'Úprava fotografií',
        'lessons.photo_editing_desc': 'Lightroom, základy Photoshopu, color grading, retuš.',
        'lessons.photo_package': 'Balíček: 5 lekcí',
        'lessons.photo_package_desc': 'Kompletní kurz od základů po pokročilé. Ušetříte 500 Kč!',
        'lessons.guitar_title': '🎸 Lekce kytary',
        'lessons.guitar_basics': 'Kytara pro začátečníky',
        'lessons.guitar_basics_desc': 'Akordy, rytmus, první písničky. Akustická nebo elektrická.',
        'lessons.guitar_intermediate': 'Pokročilá úroveň',
        'lessons.guitar_intermediate_desc': 'Fingerstyle, barré akordy, hudební teorie, improvizace.',
        'lessons.guitar_songs': 'Naučte se své oblíbené písně',
        'lessons.guitar_songs_desc': 'Naučíme vás písně, které chcete hrát. Jakýkoli žánr!',
        'lessons.guitar_package': 'Balíček: 8 lekcí',
        'lessons.guitar_package_desc': 'Od nuly k sebevědomé hře. Ušetříte 700 Kč!',
        'lessons.czech_title': '🇨🇿 Lekce češtiny',
        'lessons.czech_basics': 'Čeština pro začátečníky (A1-A2)',
        'lessons.czech_basics_desc': 'Základy, každodenní fráze, gramatické základy.',
        'lessons.czech_conversation': 'Konverzační čeština',
        'lessons.czech_conversation_desc': 'Procvičování mluvení, reálné situace, plynulost.',
        'lessons.czech_business': 'Čeština pro práci',
        'lessons.czech_business_desc': 'Obchodní slovní zásoba, formální komunikace, dokumenty.',
        'lessons.czech_package': 'Balíček: 10 lekcí',
        'lessons.czech_package_desc': 'Intenzivní kurz pro rychlý pokrok. Ušetříte 1 000 Kč!',
        'lessons.note': 'Všechny lekce jsou individuální. První lekce — úvodní cena!',
        'hero.title': 'Profesionální fotografické služby',
        'hero.subtitle': 'Memori — tvůj okamžik, který zůstane v paměti. Oslava uteče rychle, ale vzpomínky zůstávají navždy. Zachovej svůj den tak, aby každá chvíle zůstala s tebou.',
        'hero.cta': 'Objednat konzultaci',
        'svc.portrait': 'Portrétní focení',
        'svc.family': 'Rodinná fotografie',
        'svc.event': 'Reportáž z událostí',
        'svc.product': 'Produktové fotky',
        'svc.love': 'Láskyplné příběhy',
        'svc.custom': 'Individuální požadavek',
        'svc.photo_birthday': 'Fotografie na narozeniny',
        'svc.photo_wedding': 'Fotografie na svatbu',
        'svc.photo_other_session': 'Ostatní fotografie',
        'svc.photo_corporate': 'Fotografie na korporátní akce',
        'svc.video_birthday': 'Video na narozeniny',
        'svc.video_wedding': 'Video na svatbu',
        'svc.video_corporate': 'Video na korporátní akce',
        'svc.video_advertising': 'Reklamní video',
        'svc.photo_studio': 'Ateliérové focení',
        'svc.video_misc': 'Ostatní video',
        'group.photo': 'Foto',
        'group.video': 'Video',
        'group.adv_video': 'Reklamní video',
        'group.lessons': 'Lekce',
        'dark.title': 'Fotografické služby ve vašem městě',
        'dark.desc': 'Zkušený tým, férové ceny, rychlé dodání. Zanechte žádost a do 1 hodiny se vám ozveme.',
        'form.name': 'Jméno',
        'form.surname': 'Příjmení',
        'form.phone': 'Telefon',
        'form.contact': 'Další kontakt (Telegram/Viber)',
        'form.city': 'Město',
        'form.street': 'Ulice',
        'form.house': 'Číslo domu',
        'form.comment': 'Komentář',
        'form.package': 'Balíček',
        'form.package_placeholder': 'Vyberte balíček',
        'form.service': 'Služba',
        'form.service_placeholder': 'Vyberte službu',
        'form.required_hint': 'Povinná pole jsou označena *.',
        'err.required': 'Toto pole je povinné',
        'err.phone': 'Zadejte platné telefonní číslo',
        'err.package_or_service': 'Prosím vyberte buď balíček nebo službu',
        'err.max_packages': 'Můžete vybrat maximálně 3 balíčky',
        'err.max_services': 'Můžete vybrat maximálně 4 služby',
        'form.selected': 'vybráno',
        'form.submit': 'Odeslat',
        'form.note': 'Odesláním formuláře souhlasíte se zásadami ochrany osobních údajů.',
        'form.agreed': 'Při souhlasu je předplacení 40% z částky.',
        // Cooperation page
        'coop.title': 'Spolupráce s Memori',
        'coop.desc': 'Fotografové a kameramani — pošlete žádost o spolupráci s naším týmem.',
        'coop.note': 'Správce paměti vás bude kontaktovat do 24 hodin.',
        'form.email': 'E-mail',
        'form.role': 'Role',
        'form.role_placeholder': 'Vyberte roli',
        'role.empty': 'Prázdný',
        'role.photographer': 'Fotograf',
        'role.videographer': 'Kameraman',
        'role.call_agent': 'Call agent',
        'role.founder': 'Zakladatel',
        'role.admin': 'Administrátor',
        'role.photo_editor': 'Editor fotografií',
        'role.video_editor': 'Editor videí',
        'form.portfolio': 'Odkaz na portfolio',
        'form.experience': 'Zkušenosti (roky)',
        'form.equipment': 'Vybavení',
        'form.driving_b': 'Vlastnit řidičský průkaz kategorie B',
        'toggle.yes': 'Ano',
        'toggle.no': 'Ne',
        'ph.email': 'name@example.com',
        'ph.portfolio': 'https://portfolio.example.com',
        'ph.name': 'Jan',
        'ph.surname': 'Novák',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram nebo číslo Viberu',
        'ph.city': 'Město',
        'ph.street': 'Název ulice',
        'ph.house': 'např. 24A',
        'ph.comment': 'Popište svou poptávku (termín, místo, styl)...',
        'pricing.title': 'Balíčky a ceny (Kč)',
        'pricing.discount': 'Speciální akce k otevření: 30% sleva na všechny balíčky do 21.05.2026!',
        'pricing.note': 'Ceny jsou orientační a mohou se lišit podle místa, termínu a konkrétních požadavků.',
        'pricing.order': 'Objednat',
        'pricing.note_confirm': 'Konečnou nabídku potvrdíme po krátké konzultaci.',
        'pricing.photo': 'Fotografie',
        'pricing.standard': 'Standard — 90 min + 40 fotografií',
        'pricing.basic': 'Basic — 60 min + 25 fotografií',
        'pricing.premium': 'Premium — 120 min + 60 fotografií',
        'pricing.studio_session': 'Ateliérové focení',
        'pricing.studio_session_desc': '1 hodina, 1–2 osoby (max 4). Portréty, rodinné, těhotenské. 10 upravených fotografií.',
        'pkg.wedding_platinum': 'Platina — 12 hodin focení, USB flash disk, 400 upravených fotografií',
        'pkg.wedding_gold': 'Zlato — 8 hodin focení, 300 upravených fotografií, USB flash disk',
        'pkg.wedding_silver': 'Stříbro — 4 hodiny focení, 150 upravených fotografií',
        'pricing.video': 'Video',
        'pricing.video_hour': '1 hodina',
        'pricing.adv_title': 'Reklamní video služby',
        'pricing.love_story': 'Love Story',
        'pricing.love_story_desc': '1–2 min video, 1–1.5h natáčení, střih, hudba, color grading',
        'pricing.mini_business': 'Mini video pro byznys',
        'pricing.mini_business_desc': '15–45 s, vertikální, pro kavárny, salony, obchody. Střih + titulky + logo',
        'pricing.interview': 'Rozhovor / Reportáž',
        'pricing.interview_desc': 'Profesionální rozhovor, klopový mikrofon, stabilizátor, střih, základní grafika',
        'pricing.product_review': 'Recenze produktu / Reklama',
        'pricing.product_review_desc': 'Pro malé firmy: kosmetika, technika, jídlo',
        'pricing.editing_only': 'Střih videa (bez natáčení)',
        'pricing.editing_only_desc': '300–600 Kč/min finálního videa nebo 200 Kč/hodina',
        'pricing.event_video': 'Video z akce',
        'pricing.event_video_desc': 'Párty, veletrhy, akce. Střih: 1 000–3 000 Kč',
        'pricing.promo_video': 'Promo / Oznámení',
        'pricing.promo_video_desc': '1 moderátor na kameru, profesionální promo',
        'pricing.reels_tiktok': 'Reels / TikTok série',
        'pricing.reels_tiktok_desc': 'Vertikální videa, balíček 10–20 klipů',
        'pricing.photo_video_set': 'Foto + Video set pro Instagram',
        'pricing.photo_video_set_desc': '30 fotografií + 1 krátké video',
        'pricing.video_card': 'Video vizitka',
        'pricing.video_card_desc': '60–90 s o specialistovi: kadeřník, tattoo, mistr',
        'pricing.real_estate': 'Video nemovitostí',
        'pricing.real_estate_desc': 'Byty, pokoje — realitní makléři to vždy potřebují',
        'pricing.mini_clip': 'Mini klip umělce',
        'pricing.mini_clip_desc': 'Hudební video pro umělce a hudebníky',
        'pricing.extras': 'Doplňky',
        'pricing.print_all': 'Tisk všech fotografií z balíčku',
        'pricing.video_disc': 'Video na disku',
        'pricing.prepaid': 'Při souhlasu je předplacení 40% z částky.',
        'pricing.page_title': 'Balíčky a ceny',
        'pricing.page_note': 'Ceny jsou orientační a mohou se lišit podle místa, termínu a konkrétních požadavků. Konečnou nabídku potvrdíme po krátké konzultaci.',
        'pricing.products': 'Fotoprodukty',
        'pricing.photo_tshirt': 'Fotografie na tričku',
        'pricing.photo_hoodie': 'Fotografie na mikině',
        'pricing.photo_mug': 'Fotografie na hrníčku',
        'pricing.photo_case': 'Fotografie na obalu telefonu',
        'pricing.photo_pillow': 'Fotografie na polštáři',
        'pricing.photo_bear': 'Fotografie na medvídkovi',
        'pricing.photo_metal_15x20': 'Fotografie na kovu 15×20 cm',
        'pricing.photo_metal_30x40': 'Fotografie na kovu 30×40 cm',
        'pricing.photo_calendar': 'Kalendář',
        'pricing.photo_car_pendant': 'Přívěsek do auta s fotografií',
        'pricing.photo_backpack_badge': 'Odznak na batoh',
        'pricing.gift_certificates': 'Dárkové poukazy',
        'voucher.basic': 'Dárkový poukaz "Základní balíček"',
        'voucher.basic_short': '60 min focení + 25 upravených fotografií',
        'voucher.basic_desc': '<p><strong>Ideální dárek pro každou příležitost!</strong></p><p>Základní balíček obsahuje:</p><ul><li>60 minut profesionálního focení</li><li>25 profesionálně upravených fotografií</li><li>Praha a okolí</li><li>Platnost 6 měsíců od nákupu</li></ul>',
        'voucher.standard': ' Dárkový poukaz "Standardní balíček"',
        'voucher.standard_short': '90 min focení + 40 upravených fotografií',
        'voucher.standard_desc': '<p><strong>Ideální dárek pro zachycení výjimečných okamžiků!</strong></p><p>Standardní balíček obsahuje:</p><ul><li>90 minut profesionálního focení</li><li>40 profesionálně upravených fotografií</li><li>Praha a okolí</li><li>Platnost 6 měsíců od nákupu</li></ul>',
        'form.location': 'Momentálně pracujeme v Praze a jejím okolí.',
        'pkg.basic': 'Basic — 60 min + 25 fotografií',
        'pkg.standard': 'Standard — 90 min + 40 fotografií',
        'pkg.premium': 'Premium — 120 min + 60 fotografií',
        'pkg.video_hour': 'Video',
        'about.title': 'Příběh Memori',
        'about.p1': 'Memori je tým, který uchovává to nejcennější v životě — vaše momenty. Děláme profesionální foto a video, vytváříme individuální klipy a slideshow, tiskneme fotografie a dbáme na to, aby se žádná důležitá událost neztratila v čase.',
        'about.p2': 'Naši kameramani a fotografové udělají vše pro to, aby se váš moment zapsal do paměti. Do každé práce dáváme nejen techniku, ale i srdce, aby záběry přenesly skutečné emoce.',
        'about.p3': 'Naším cílem je jednoduché — dát lidem možnost vracet se ke svým vzpomínkám, kdykoli budou chtít. Svatba, narozeniny, první dětský úsměv, koncert, vystoupení nebo obyčejný den, který se stal výjimečným — to vše lze prožít znovu otevřením alba nebo stisknutím tlačítka přehrát.',
        'about.p4': 'Děláme to proto, že věříme: momenty jsou skutečným bohatstvím. Věci lze nahradit, ale pocity, emoce a vzpomínky jsou nevyčíslitelné. Proto vzniklo Memori — abychom zastavili čas v záběru a darovali lidem paměť, která nevyhasíná.',
        'about.p5': 'Naše filozofie je jednoduchá: život se skládá z momentů — a my je děláme věčnými.',
        'toast.success': 'Děkujeme! Vaši poptávku jsme přijali. Brzy se vám ozveme, upřesníme detaily a potvrdíme termín.',
        'toast.error': 'Omlouváme se, něco se nepovedlo. Zkuste to prosím později nebo nás kontaktujte přímo.',
        'toast.close': 'Zavřít',
    },
    uk: {
        'footer.privacy': 'Приватність',
        'footer.terms': 'Умови',
        'footer.phone': 'Телефон',
        'footer.email': 'Email',
        'nav.coop': 'Співпраця',
        'nav.services': 'Послуги',
        'nav.portfolio': 'Портфоліо',
        // Portfolio
        'portfolio.title': 'Обрані роботи',
        'portfolio.subtitle': 'Трохи наших фото- та відеопроєктів.',
        'team.title': 'Наша команда',
        'team.owner_desc': '3D обробка. Зйомка і обробка фото і відео.',
        'team.videographer_desc': 'Весільне та корпоративне відео.',
        'team.agent_desc': 'Перший контакт, який підтверджує деталі та час.',
        // Team labels
        'team.label_name': "Ім'я",
        'team.label_experience': 'Досвід',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ років',
        'team.name_photographer': '—',
        'team.worker_name_2': 'Обіван',
        'team.exp_videographer': '5+ років',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Чубaka',
        'team.founder_name': 'Євген',
        'team.hanna_name': 'Ганна',
        'team.hanna_role': 'Адміністратор',
        'team.hanna_exp': '1,5+ роки',
        'team.hanna_desc': 'Планування фотосесій та координація з клієнтами.',
        'team.hanna_description': '<p>Аліна — наш відданий адміністратор, яка забезпечує безперебійну роботу за лаштунками. З чудовими організаційними навичками та дружелюбним підходом вона обробляє запити клієнтів, планує фото- та відеозйомки і координує нашу креативну команду.</p><p>Її увага до деталей та проактивний стиль комунікації гарантують, що кожен клієнт почувається цінним та поінформованим — від моменту бронювання до отримання готових фотографій та відео.</p>',
        'team.mykhailo_name': 'Михайло',
        'team.mykhailo_role': 'Доставщик',
        'team.mykhailo_desc': 'Швидка та надійна доставка ваших замовлень.',
        'team.mykhailo_description': '<p>Михайло — наш відданий спеціаліст з доставки, який забезпечує, щоб ваші замовлення доходили до вас безпечно та вчасно. З увагою до деталей та зобов\'язанням перед задоволенням клієнтів він обробляє логістику доставки ваших фотографій, відео та фотопродуктів прямо до вашого дому.</p><p>Його надійний сервіс та дружелюбний підхід гарантують, що кожна доставка виконується з дбайливістю, щоб ваші дорогі спогади доходили в ідеальному стані. Михайло координує з нашою командою планування доставок у зручний час та у відповідних місцях, роблячи весь процес плавним та безпроблемним для наших клієнтів.</p>',
        'team.zhenya_name': 'Євгенія',
        'team.zhenya_role': 'Фотограф',
        'team.zhenya_exp': '4+ роки',
        'team.zhenya_desc': 'Знімаю живі кадри про почуття та моменти з природним світлом та емоціями.',
        'team.zhenya_description': '<p>Євгенія — талановита фотографка, яка спеціалізується на зніманні автентичних моментів та емоцій через фотографію з природним світлом. Маючи понад 4 роки досвіду, вона створює красиві, щирі зображення, які розповідають історії про почуття та особливі моменти.</p><p>Вона спеціалізується на індивідуальних фотосесіях, love story, сімейних зйомках та весіллях. Її робота характеризується природним світлом, щирими емоціями та фокусом на фіксації справжньої сутності кожного моменту. Євгенія привносить свою художню візію та професійну експертизу до кожної сесії.</p><p>Її підхід до фотографії підкреслює автентичність та емоції, забезпечуючи, щоб кожен кадр відображав справжні почуття та зв\'язки між людьми. Чи то інтимна парна сесія, радісна сімейна зустріч або романтична love story, Євгенія знає, як зловити магію моменту.</p>',
        'team.founder_description': '<p>Після завершення кар\'єри професійного каскадера я нарешті присвятив себе тому, до чого завжди тягнуло — мистецтву фіксувати моменти. Роки інтенсивної фізичної роботи навчили мене бачити красу в русі, передбачати ідеальний момент та розуміти силу візуального сторітелінгу.</p><p>Мій досвід каскадера дав мені унікальний погляд на композицію, тайминг та вміння зберігати спокій у стресових ситуаціях. Я знаю з перших рук, що потрібно для ідеального кадру — чи то мить емоції, чи динамічна сцена. Цей досвід визначає все, що ми робимо в Memori.</p><p>Як засновник, я особисто контролюю кожен проєкт, щоб забезпечити найвищу якість. Координую нашу талановиту команду, працюю з клієнтами та особисто керую складними зйомками. Моя місія проста: допомогти людям зберегти їхні найцінніші моменти з винятковою якістю та увагою до деталей.</p><p>Memori — це не просто бізнес, це реалізація життєвої мрії. Кожен кадр, який ми знімаємо, кожне відео, яке створюємо, несе в собі відданість та майстерність, що походить від справжньої любові до своєї справи.</p>',
        'team.exp_agent': '2+ роки',
        'team.photo_editor_desc': 'Редагування фотографій.',
        'team.video_editor_desc': 'Редагування відео.',
        'nav.about': 'Про нас',
        'nav.contact': 'Контакти',
        'nav.price': 'Ціни',
        'nav.lessons': 'Učitel',
        'lessons.title': 'Učitel',
        'lessons.subtitle': 'Опануйте нові навички з нашими досвідченими викладачами в Празі. Індивідуальний підхід, гнучкий графік, практична спрямованість.',
        'lessons.photo_title': '📷 Уроки фотографії',
        'lessons.photo_basics': 'Основи фотографії',
        'lessons.photo_basics_desc': 'Налаштування камери, композиція, основи освітлення. Для початківців.',
        'lessons.photo_portrait': 'Портретна фотографія',
        'lessons.photo_portrait_desc': 'Робота з людьми, позування, природне та студійне освітлення.',
        'lessons.photo_editing': 'Обробка фото',
        'lessons.photo_editing_desc': 'Lightroom, основи Photoshop, колоркорекція, ретуш.',
        'lessons.photo_package': 'Пакет: 5 уроків',
        'lessons.photo_package_desc': 'Повний курс від основ до просунутого рівня. Економія 500 Kč!',
        'lessons.guitar_title': '🎸 Уроки гітари',
        'lessons.guitar_basics': 'Гітара для початківців',
        'lessons.guitar_basics_desc': 'Акорди, бій, перші пісні. Акустична або електро.',
        'lessons.guitar_intermediate': 'Середній рівень',
        'lessons.guitar_intermediate_desc': 'Фінгерстайл, барре акорди, теорія музики, імпровізація.',
        'lessons.guitar_songs': 'Вивчіть улюблені пісні',
        'lessons.guitar_songs_desc': 'Навчимо грати пісні, які ви хочете. Будь-який жанр!',
        'lessons.guitar_package': 'Пакет: 8 уроків',
        'lessons.guitar_package_desc': 'Від нуля до впевненої гри. Економія 700 Kč!',
        'lessons.czech_title': '🇨🇿 Уроки чеської мови',
        'lessons.czech_basics': 'Чеська для початківців (A1-A2)',
        'lessons.czech_basics_desc': 'Основи, повсякденні фрази, граматичні основи.',
        'lessons.czech_conversation': 'Розмовна чеська',
        'lessons.czech_conversation_desc': 'Практика мовлення, реальні ситуації, розвиток плавності.',
        'lessons.czech_business': 'Чеська для роботи',
        'lessons.czech_business_desc': 'Ділова лексика, формальне спілкування, документи.',
        'lessons.czech_package': 'Пакет: 10 уроків',
        'lessons.czech_package_desc': 'Інтенсивний курс для швидкого прогресу. Економія 1 000 Kč!',
        'lessons.note': 'Усі уроки індивідуальні. Перший урок — ознайомлювальна ціна!',
        'hero.title': 'Професійні фото- та відеопослуги',
        'hero.subtitle': 'Memori — твій момент, що залишиться в пам’яті. Свято минає швидко, але спогади живуть завжди. Збережи свій день так, щоб кожна мить лишалася поруч.',
        'hero.cta': 'Записатися на консультацію',
        'svc.portrait': 'Портретна зйомка',
        'svc.family': 'Сімейна фотографія',
        'svc.event': 'Зйомка подій',
        'svc.product': 'Предметна зйомка',
        'svc.love': 'Love story',
        'svc.custom': 'Індивідуальний запит',
        'svc.photo_birthday': 'Фото на день народження',
        'svc.photo_wedding': 'Фото на весілля',
        'svc.photo_corporate': 'Фото для корпоративів',
        'svc.photo_studio': 'Студійна фотосесія',
        'svc.photo_other_session': 'Інші фотосесії',
        'svc.video_birthday': 'Відео на день народження',
        'svc.video_wedding': 'Відео на весілля',
        'svc.video_advertising': 'Рекламне відео',
        'svc.video_corporate': 'Відео для корпоративів',
        'svc.video_misc': 'Інше відео',
        'group.photo': 'Фото',
        'group.video': 'Відео',
        'group.adv_video': 'Рекламне відео',
        'group.lessons': 'Уроки',
        'dark.title': 'Фото- та відеопослуги у вашому місті',
        'dark.desc': 'Досвідчена команда, чесні ціни, швидкі терміни. Залишайте заявку — ми передзвонимо протягом 1 години.',
        'form.name': "Ваше ім'я",
        'form.surname': 'Прізвище',
        'form.phone': 'Номер телефону',
        'form.contact': 'Додатковий контакт (Telegram/Viber)',
        'form.city': 'Місто',
        'form.street': 'Вулиця',
        'form.house': 'Номер будинку',
        'form.comment': 'Коментар',
        'form.package': 'Пакет',
        'form.package_placeholder': 'Оберіть пакет',
        'form.service': 'Послуга',
        'form.service_placeholder': 'Оберіть послугу',
        'form.required_hint': 'Поля, позначені *, є обов’язковими.',
        'err.required': 'Це поле є обов\'язковим',
        'err.phone': 'Введіть коректний номер телефону.',
        'err.package_or_service': 'Будь ласка, оберіть або пакет, або послугу',
        'err.max_packages': 'Можна вибрати максимум 3 пакети',
        'err.max_services': 'Можна вибрати максимум 4 послуги',
        'form.selected': 'вибрано',
        'form.submit': 'Надіслати',
        'form.note': 'Надсилаючи форму, ви погоджуєтесь з політикою конфіденційності.',
        'form.agreed': 'При договориності є передплатня 40% від суми.',
        // Cooperation page
        'coop.title': 'Працюйте з Memori',
        'coop.desc': 'Фотографи та відеооператори — надішліть заявку на співпрацю з нашою командою.',
        'coop.note': 'Керівник Memori зв’яжеться з вами протягом 24 годин.',
        'form.email': 'Email',
        'form.role': 'Роль',
        'form.role_placeholder': 'Оберіть роль',
        'role.empty': 'Пусто',
        'role.founder': 'Засновник',
        'role.photographer': 'Фотограф',
        'role.videographer': 'Відеооператор',
        'role.photo_editor': 'Редактор фотографій',
        'role.video_editor': 'Редактор відео',
        'role.call_agent': 'Кол-агент',
        'role.admin': 'Адміністратор',
        'form.portfolio': 'Посилання на портфоліо',
        'form.experience': 'Досвід (роки)',
        'form.equipment': 'Обладнання',
        'form.driving_b': 'Володіння водійським посвідченням категорії B',
        'toggle.yes': 'Так',
        'toggle.no': 'Ні',
        'ph.email': 'name@example.com',
        'ph.portfolio': 'https://portfolio.example.com',
        'ph.name': 'Іван',
        'ph.surname': 'Іваненко',
        'ph.phone': '+ 420 777 123 456',
        'ph.contact': '@telegram або номер Viber',
        'ph.city': 'Місто',
        'ph.street': 'Назва вулиці',
        'ph.house': 'напр., 24А',
        'ph.comment': 'Опишіть запит (дата, локація, стиль)...',
        'pricing.title': 'Пакети та ціни (CZK)',
        'pricing.discount': 'Акція на відкриття: знижка 30% на всі пакети до 21.05.2026!',
        'pricing.note': 'Ціни орієнтовні та можуть змінюватись залежно від локації, часу та вимог.',
        'pricing.order': 'Замовити',
        'pricing.note_confirm': 'Остаточну вартість підтвердимо після короткої консультації.',
        'pricing.prepaid': 'При договориності є передплатня 40% від суми.',
        'pricing.photo': 'Фотографія',
        'pricing.standard': 'Стандарт — 90 хв + 40 фото',
        'pricing.basic': 'Базовий — 60 хв + 25 фото',
        'pricing.premium': 'Преміум — 120 хв + 60 фото',
        'pricing.studio_session': 'Студійна фотосесія',
        'pricing.studio_session_desc': '1 година, 1–2 особи (макс. 4). Портрети, сімейна, вагітність. 10 оброблених фото.',
        'pkg.wedding_platinum': 'Платина — 12 годин фотозйомки, флешка, 400 оброблених фотографій',
        'pkg.wedding_gold': 'Золото — 8 годин фотозйомки, 300 оброблених фотографій, флешка',
        'pkg.wedding_silver': 'Срібло — 4 години фотозйомки, 150 оброблених фотографій',
        'pricing.video': 'Відео',
        'pricing.video_hour': '1 година',
        'pricing.adv_title': 'Рекламні відеопослуги',
        'pricing.love_story': 'Love Story',
        'pricing.love_story_desc': '1–2 хв відео, 1–1.5 год зйомки, монтаж, музика, колоркорекція',
        'pricing.mini_business': 'Мінівідео для бізнесу',
        'pricing.mini_business_desc': '15–45 сек, вертикальне, для кафе, салонів, магазинів. Монтаж + титри + лого',
        'pricing.interview': 'Інтервʼю / Репортаж',
        'pricing.interview_desc': 'Професійне інтервʼю, петличка, стабілізатор, монтаж, базова графіка',
        'pricing.product_review': 'Відеоогляд продукту / Реклама',
        'pricing.product_review_desc': 'Для дрібного бізнесу: косметика, техніка, їжа',
        'pricing.editing_only': 'Монтаж відео (без зйомки)',
        'pricing.editing_only_desc': '300–600 Kč/хв готового відео або 200 Kč/година',
        'pricing.event_video': 'Відео заходів',
        'pricing.event_video_desc': 'Свята, ярмарки, події. Монтаж: 1 000–3 000 Kč',
        'pricing.promo_video': 'Промо / Оголошення',
        'pricing.promo_video_desc': '1 ведучий в кадрі, професійне промо',
        'pricing.reels_tiktok': 'Reels / TikTok серії',
        'pricing.reels_tiktok_desc': 'Вертикальні відео, пакет 10–20 роликів',
        'pricing.photo_video_set': 'Фото + Відео сет для Instagram',
        'pricing.photo_video_set_desc': '30 фото + 1 коротке відео',
        'pricing.video_card': 'Відеовізитка',
        'pricing.video_card_desc': '60–90 сек про спеціаліста: перукар, тату, майстер',
        'pricing.real_estate': 'Відео нерухомості',
        'pricing.real_estate_desc': 'Апартаменти, кімнати — рієлтори завжди шукають',
        'pricing.mini_clip': 'Міні-кліп артиста',
        'pricing.mini_clip_desc': 'Музичний кліп для артистів та музикантів',
        'pricing.extras': 'Додатково',
        'pricing.print_all': 'Друк усіх фото з пакету',
        'pricing.video_disc': 'Відео на диску',
        'pricing.prepaid': 'За домовленістю передплата становить 40% від суми.',
        'pricing.page_title': 'Пакети та ціни',
        'pricing.page_note': 'Ціни орієнтовні та можуть змінюватись залежно від локації, часу та вимог. Остаточну вартість підтвердимо після короткої консультації.',
        'pricing.products': 'Фотопродукти',
        'pricing.photo_tshirt': 'Фото на футболці',
        'pricing.photo_hoodie': 'Фото на худі',
        'pricing.photo_mug': 'Фото на чашці',
        'pricing.photo_case': 'Фото на чехлі',
        'pricing.photo_pillow': 'Фото на подушці',
        'pricing.photo_bear': 'Фото на ведмедику',
        'pricing.photo_metal_15x20': 'Фото на металі 15×20 см',
        'pricing.photo_metal_30x40': 'Фото на металі 30×40 см',
        'pricing.photo_calendar': 'Календар',
        'pricing.photo_car_pendant': 'Кулон для машини',
        'pricing.photo_backpack_badge': 'Значок на рюкзак',
        'pricing.gift_certificates': 'Подарункові сертифікати',
        'voucher.basic': 'Подарунковий сертифікат "Набір Базовий"',
        'voucher.basic_short': '60 хв зйомки + 25 оброблених фото',
        'voucher.basic_desc': '<p><strong>Ідеальний подарунок на будь-яку нагоду!</strong></p><p>Базовий набір включає:</p><ul><li>60 хвилин професійної фотосесії</li><li>25 професійно оброблених фотографій</li><li>Прага та околиці</li><li>Дійсний 6 місяців з моменту придбання</li></ul>',
        'voucher.standard': 'Подарунковий сертифікат "Набір Стандартний"',
        'voucher.standard_short': '90 хв зйомки + 40 оброблених фото',
        'voucher.standard_desc': '<p><strong>Ідеальний подарунок для збереження особливих моментів!</strong></p><p>Стандартний набір включає:</p><ul><li>90 хвилин професійної фотосесії</li><li>40 професійно оброблених фотографій</li><li>Прага та околиці</li><li>Дійсний 6 місяців з моменту придбання</li></ul>',
        'form.location': 'Ми в даний момент працюємо в містах Прага та її околицях.',
        'pkg.basic': 'Базовий — 60 хв + 25 фото',
        'pkg.standard': 'Стандарт — 90 хв + 40 фото',
        'pkg.premium': 'Преміум — 120 хв + 60 фото',
        'pkg.video_hour': 'Відео',
        'about.title': 'Історія компанії Memori',
        'about.p1': 'Memori – це команда, яка зберігає найцінніше у житті – ваші моменти. Ми займаємось професійною фото- та відеозйомкою, створюємо індивідуальні кліпи, слайд-шоу, друкуємо фотографії та допомагаємо зробити так, щоб жодна важлива подія не загубилася у потоці часу.',
        'about.p2': 'Наша команда операторів і фотографів зробить усе, щоб твій момент запам’ятався. Ми вкладаємо у кожну роботу не тільки техніку, а й душу, щоб знімки передавали справжні емоції.',
        'about.p3': 'Наша мета проста – подарувати людям можливість повертатися у свої спогади тоді, коли цього найбільше хочеться. Весілля, день народження, перша дитяча усмішка, концерт, виступ чи навіть звичайний день, який став особливим – усе це можна прожити знову, відкривши альбом чи ввімкнувши відео.',
        'about.p4': 'Ми робимо це тому, що віримо: моменти – це справжнє багатство. Речі можна замінити, але почуття, емоції та спогади безцінні. Саме тому Memori створена для того, щоб зупиняти час у кадрі й дарувати людям пам’ять, яка не згасає.',
        'about.p5': 'Наша філософія проста: життя складається з моментів – і ми робимо їх вічними.',
        'toast.success': 'Дякуємо! Ми отримали вашу заявку. Найближчим часом зв’яжемося, щоб уточнити деталі та підтвердити час.',
        'toast.error': 'Вибачте, сталася помилка. Спробуйте пізніше або зв’яжіться з нами напряму.',
        'toast.close': 'Закрити',
    }
};

function applyI18n(lang = null) {
    const currentLang = lang || getCurrentLang();
    const dict = translations[currentLang] || translations.cs || translations.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    // translate optgroup labels
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
        const key = el.getAttribute('data-i18n-label');
        if (dict[key]) el.setAttribute('label', dict[key]);
    });
    // Update custom multiselect labels and display text
    document.querySelectorAll('.custom-multiselect').forEach(ms => {
        const name = ms.getAttribute('data-name');
        const placeholderKey = name === 'package' ? 'form.package_placeholder' : 'form.service_placeholder';
        const displayText = ms.querySelector('.custom-multiselect__display');
        if (displayText) {
            const checked = ms.querySelectorAll('.custom-multiselect__checkbox:checked');
            if (checked.length === 0) {
                displayText.textContent = dict[placeholderKey] || 'Choose...';
            } else if (checked.length === 1) {
                const option = checked[0].closest('.custom-multiselect__option');
                const span = option.querySelector('span');
                // Update option text from i18n if available
                const checkbox = checked[0];
                const select = document.querySelector(`select[name="${name}"]`);
                if (select) {
                    const optionEl = select.querySelector(`option[value="${checkbox.value}"]`);
                    if (optionEl) {
                        const i18nKey = optionEl.getAttribute('data-i18n');
                        if (i18nKey && dict[i18nKey]) {
                            span.textContent = dict[i18nKey];
                        }
                    }
                }
                displayText.textContent = span.textContent;
            } else {
                displayText.textContent = `${checked.length} ${dict['form.selected'] || 'selected'}`;
            }
        }
        // Update group labels
        ms.querySelectorAll('.custom-multiselect__group-label').forEach(labelEl => {
            const group = labelEl.closest('.custom-multiselect__group');
            const select = document.querySelector(`select[name="${name}"]`);
            if (select) {
                const optgroups = select.querySelectorAll('optgroup');
                optgroups.forEach((optgroup, idx) => {
                    const groupEls = ms.querySelectorAll('.custom-multiselect__group');
                    if (groupEls[idx] === group) {
                        const i18nKey = optgroup.getAttribute('data-i18n-label');
                        if (i18nKey && dict[i18nKey]) {
                            labelEl.textContent = dict[i18nKey];
                        }
                    }
                });
            }
        });
        // Update option labels
        ms.querySelectorAll('.custom-multiselect__option span').forEach(span => {
            const checkbox = span.previousElementSibling;
            if (checkbox && checkbox.type === 'checkbox') {
                const select = document.querySelector(`select[name="${name}"]`);
                if (select) {
                    const optionEl = select.querySelector(`option[value="${checkbox.value}"]`);
                    if (optionEl) {
                        const i18nKey = optionEl.getAttribute('data-i18n');
                        if (i18nKey && dict[i18nKey]) {
                            span.textContent = dict[i18nKey];
                        }
                    }
                }
            }
        });
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
    // Update voucher images based on language
    document.querySelectorAll('.voucher-card').forEach((card) => {
        const img = card.querySelector('.voucher-img');
        if (img) {
            const imgUa = card.getAttribute('data-img-ua');
            const imgOther = card.getAttribute('data-img-other');
            img.src = currentLang === 'uk' ? imgUa : imgOther;
        }
    });
    localStorage.setItem('lang', currentLang);
    document.querySelectorAll('.lang-switch button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

// Custom dropdown - always opens downward
const langDd = document.getElementById('lang-dd');
if (langDd) {
    const btn = langDd.querySelector('.lang-dd__btn');
    const list = langDd.querySelector('.lang-dd__list');
    const label = document.getElementById('lang-dd-label');
    const saved = getCurrentLang(); // Use consistent function
    label.textContent = saved.toUpperCase();
    applyI18n(saved);
    // highlight active
    list.querySelectorAll('li').forEach(li => li.classList.toggle('active', li.getAttribute('data-lang') === saved));

    btn.addEventListener('click', () => {
        const open = langDd.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(open));
    });
    list.querySelectorAll('li').forEach((li) => {
        li.addEventListener('click', () => {
            const lang = li.getAttribute('data-lang');
            applyI18n(lang);
            localStorage.setItem('lang', lang);
            label.textContent = lang.toUpperCase();
            list.querySelectorAll('li').forEach(el => el.classList.toggle('active', el === li));
            langDd.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            
            // Reload dynamic content when language changes
            if (typeof loadPricingProducts === 'function') {
                loadPricingProducts();
            }
            if (typeof loadLessonsProducts === 'function') {
                loadLessonsProducts();
            }
            if (typeof loadServices === 'function') {
                loadServices();
            }
            if (typeof loadFormOptions === 'function') {
                loadFormOptions();
            }
        });
    });
    document.addEventListener('click', (e) => {
        if (!langDd.contains(e.target)) {
            langDd.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        }
    });
}

// Product popup for pricing page
// Initialize product modals with event delegation
let productModalsInitialized = false;
function initProductModals() {
    const productPopup = document.getElementById('product-popup');
    if (!productPopup) return; // Only initialize if modal exists on page
    
    // Prevent multiple initializations
    if (productModalsInitialized) return;
    productModalsInitialized = true;
    
    const popupImage = document.getElementById('popup-image');
    const popupTitle = document.getElementById('popup-title');
    const popupPrice = document.getElementById('popup-price');
    const popupClose = productPopup.querySelector('.product-popup-close');
    const popupOverlay = productPopup.querySelector('.product-popup-overlay');

    const openPopup = (imageSrc, title, price, description) => {
        if (popupImage) {
            popupImage.src = imageSrc || '';
            popupImage.alt = title;
        }
        if (popupTitle) popupTitle.textContent = title;
        if (popupPrice) popupPrice.textContent = price;
        
        // Find or create description element
        let popupDesc = popupTitle.parentElement.querySelector('.product-popup-description');
        if (description && description.trim()) {
            if (!popupDesc) {
                popupDesc = document.createElement('div');
                popupDesc.className = 'product-popup-description';
                popupDesc.style.cssText = 'padding: 0 24px 24px; text-align: center; color: #6b7280; line-height: 1.6;';
                if (popupPrice) {
                    popupPrice.after(popupDesc);
                } else if (popupTitle) {
                    popupTitle.after(popupDesc);
                }
            }
            // Use innerHTML to render HTML tags
            popupDesc.innerHTML = description;
            popupDesc.style.display = 'block';
        } else {
            // Hide description if it exists but no description provided
            if (popupDesc) {
                popupDesc.style.display = 'none';
            }
        }
        
        productPopup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closePopup = () => {
        // Move focus out of the modal before hiding it
        document.activeElement?.blur();
        productPopup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Use event delegation on pricing container - only on pricing page
    const pricingContainer = document.getElementById('pricing-products-container');
    if (pricingContainer) {
        pricingContainer.addEventListener('click', (e) => {
            // Don't open popup if clicking on order button
            if (e.target.closest('.pricing-order-btn')) {
                return;
            }
            
            const card = e.target.closest('.pricing-card[data-product-code]');
            if (!card) return;
            
            const description = decodeURIComponent(card.getAttribute('data-product-description') || '');
            
            const img = card.querySelector('.pricing-card-icon img') || card.querySelector('.pricing-card-image img');
            const label = card.querySelector('.pricing-card-label');
            const price = card.querySelector('.pricing-card-price');
            const imageSrc = card.getAttribute('data-product-image') || (img ? img.src : '');

            if (label && price) {
                openPopup(imageSrc, label.textContent, price.textContent, description);
            }
        });
    }

    // Close popup
    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }
    if (popupOverlay) {
        popupOverlay.addEventListener('click', closePopup);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productPopup.getAttribute('aria-hidden') === 'false') {
            closePopup();
        }
    });
}

// Reusable Team Member Modal Component
function createTeamModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal__close';
    closeBtn.setAttribute('aria-label', 'Close modal');
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => closeTeamModal(overlay));

    const content = document.createElement('div');
    content.className = 'modal__content';

    modal.appendChild(closeBtn);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return { overlay, content, closeBtn };
}

function openTeamModal(photoSrc, name, role, description) {
    let modal = document.querySelector('.modal-overlay[data-team-modal]');

    if (!modal) {
        const { overlay } = createTeamModal();
        overlay.setAttribute('data-team-modal', 'true');
        modal = overlay;
    }

    const content = modal.querySelector('.modal__content');
    content.innerHTML = `
        <img src="${photoSrc}" alt="${name}" class="modal__photo">
        <h3 class="modal__name">${name}</h3>
        <div class="modal__role">${role}</div>
        <div class="modal__description">${description}</div>
    `;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus management
    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
}

function closeTeamModal(overlay) {
    if (!overlay) overlay = document.querySelector('.modal-overlay[data-team-modal]');
    if (!overlay) return;

    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
}

// Initialize team member modals using event delegation
let teamModalsInitialized = false;

function initTeamModals() {
    if (teamModalsInitialized) return;
    teamModalsInitialized = true;

    // Use event delegation on the team grid container
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;

    teamGrid.addEventListener('click', (e) => {
        // Find the clicked team card (might be clicked on child element)
        const card = e.target.closest('.team-card[data-team-photo]');
        if (!card) return;

        const photoSrc = card.getAttribute('data-team-photo');
        const name = card.querySelector('.name')?.textContent || '';
        const role = card.querySelector('.role')?.textContent || '';

        // Get description from translation key or direct HTML
        const descriptionKey = card.getAttribute('data-team-description-key');
        let description = '';

        if (descriptionKey) {
            const lang = getCurrentLang();
            const dict = translations[lang] || translations.cs || translations.en;
            description = dict[descriptionKey] || '';
        } else {
            description = card.getAttribute('data-team-description') || '';
        }

        if (photoSrc && name) {
            openTeamModal(photoSrc, name, role, description);
        }
    });

    // Close modal on overlay click (event delegation)
    document.addEventListener('click', (e) => {
        const modal = document.querySelector('.modal-overlay[data-team-modal].is-open');
        if (modal && e.target === modal) {
            closeTeamModal(modal);
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay[data-team-modal].is-open');
            if (modal) {
                closeTeamModal(modal);
            }
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamModals);
} else {
    initTeamModals();
}

// ===============================
// Voucher Modal Functionality
// ===============================
function initVoucherModals() {
    const voucherCards = document.querySelectorAll('.voucher-card');
    const modal = document.getElementById('voucher-modal');

    if (!modal || voucherCards.length === 0) return;

    const modalImg = document.getElementById('voucher-modal-img');
    const modalTitle = document.getElementById('voucher-modal-title');
    const modalPrice = document.getElementById('voucher-modal-price');
    const modalDesc = document.getElementById('voucher-modal-desc');
    const closeBtn = modal.querySelector('.modal__close');

    voucherCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const lang = getCurrentLang();
            const dict = translations[lang] || translations.cs || translations.en;

            const imgSrc = lang === 'uk'
                ? card.getAttribute('data-img-ua')
                : card.getAttribute('data-img-other');
            const descKey = card.getAttribute('data-description-key');
            const titleEl = card.querySelector('[data-i18n]');
            const priceEl = card.querySelector('.pricing-card-price');

            modalImg.src = imgSrc;
            modalTitle.textContent = titleEl ? titleEl.textContent : '';
            modalPrice.textContent = priceEl ? priceEl.textContent : '';
            modalDesc.innerHTML = dict[descKey] || '';

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close on button click
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    }

    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });
}

// Initialize voucher modals
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoucherModals);
} else {
    initVoucherModals();
}

// Pricing order buttons - redirect to leadForm with pre-selected service/package
function initPricingOrderButtons() {
    const orderButtons = document.querySelectorAll('.pricing-order-btn');
    orderButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.pricing-card');
            if (!card) return;

            const service = card.getAttribute('data-service');
            const packageValue = card.getAttribute('data-package');

            let url = './leadForm.html';
            if (service) {
                url += `?service=${encodeURIComponent(service)}`;
            } else if (packageValue) {
                url += `?package=${encodeURIComponent(packageValue)}`;
            }

            window.location.href = url;
        });
    });
}

// Lessons page - make cards clickable to redirect to leadForm
function initLessonsCards() {
    const lessonsPage = document.querySelector('.lessons-page');
    if (!lessonsPage) return;

    const lessonCards = lessonsPage.querySelectorAll('.pricing-card');
    lessonCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const label = card.querySelector('.pricing-card-label');
            if (!label) return;

            const labelText = label.textContent.trim();
            let serviceValue = '';

            // Map lesson labels to service values
            const lessonMap = {
                'Photography Basics': 'lesson_photo_basics',
                'Portrait Photography': 'lesson_photo_portrait',
                'Photo Editing': 'lesson_photo_editing',
                'Guitar for Beginners': 'lesson_guitar_basics',
                'Intermediate Level': 'lesson_guitar_intermediate',
                'Learn Your Favorite Songs': 'lesson_guitar_songs',
                'Czech for Beginners (A1-A2)': 'lesson_czech_basics',
                'Conversational Czech': 'lesson_czech_conversation',
                'Czech for Work': 'lesson_czech_business',
                'Package: 5 lessons': 'photo_lessons_5',
                'Package: 8 lessons': 'guitar_lessons_8',
                'Package: 10 lessons': 'czech_lessons_10'
            };

            // Check if it's a package
            if (labelText.includes('Package:')) {
                if (labelText.includes('5')) {
                    window.location.href = './leadForm.html?package=photo_lessons_5';
                    return;
                } else if (labelText.includes('8')) {
                    window.location.href = './leadForm.html?package=guitar_lessons_8';
                    return;
                } else if (labelText.includes('10')) {
                    window.location.href = './leadForm.html?package=czech_lessons_10';
                    return;
                }
            }

            // Check data-i18n attribute for more reliable matching
            const i18nKey = label.getAttribute('data-i18n');
            if (i18nKey) {
                const i18nMap = {
                    'lessons.photo_basics': 'lesson_photo_basics',
                    'lessons.photo_portrait': 'lesson_photo_portrait',
                    'lessons.photo_editing': 'lesson_photo_editing',
                    'lessons.guitar_basics': 'lesson_guitar_basics',
                    'lessons.guitar_intermediate': 'lesson_guitar_intermediate',
                    'lessons.guitar_songs': 'lesson_guitar_songs',
                    'lessons.czech_basics': 'lesson_czech_basics',
                    'lessons.czech_conversation': 'lesson_czech_conversation',
                    'lessons.czech_business': 'lesson_czech_business',
                    'lessons.photo_package': 'photo_lessons_5',
                    'lessons.guitar_package': 'guitar_lessons_8',
                    'lessons.czech_package': 'czech_lessons_10'
                };
                serviceValue = i18nMap[i18nKey];
            } else {
                serviceValue = lessonMap[labelText];
            }

            if (serviceValue) {
                if (serviceValue.startsWith('lesson_')) {
                    window.location.href = `./leadForm.html?service=${encodeURIComponent(serviceValue)}`;
                } else {
                    window.location.href = `./leadForm.html?package=${encodeURIComponent(serviceValue)}`;
                }
            }
        });
    });
}

// Custom multiselect dropdown component
function initCustomMultiselect() {
    const selects = document.querySelectorAll('select[name="package"], select[name="service"]');
    selects.forEach(select => {
        if (select.hasAttribute('data-custom-multiselect')) return; // Already initialized
        
        const maxSelections = select.name === 'package' ? 3 : 4;
        const placeholderKey = select.name === 'package' ? 'form.package_placeholder' : 'form.service_placeholder';
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-multiselect';
        wrapper.setAttribute('data-name', select.name);
        wrapper.setAttribute('data-max', maxSelections);
        
        // Create trigger button
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-multiselect__trigger input-select';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        
        // Create display text
        const displayText = document.createElement('span');
        displayText.className = 'custom-multiselect__display';
        const lang = getCurrentLang();
        const dict = translations[lang] || translations.cs || translations.en;
        displayText.textContent = dict[placeholderKey] || 'Choose...';
        trigger.appendChild(displayText);
        
        // Create dropdown arrow
        const arrow = document.createElement('span');
        arrow.className = 'custom-multiselect__arrow';
        arrow.innerHTML = '▼';
        trigger.appendChild(arrow);
        
        // Create dropdown panel
        const panel = document.createElement('div');
        panel.className = 'custom-multiselect__panel';
        panel.setAttribute('role', 'listbox');
        
        // Process optgroups first
        const optgroups = [];
        const optionsInGroups = new Set();
        Array.from(select.querySelectorAll('optgroup')).forEach(optgroup => {
            const groupLabel = optgroup.getAttribute('label') || optgroup.getAttribute('data-i18n-label');
            const groupI18n = optgroup.getAttribute('data-i18n-label');
            const groupOptions = [];
            Array.from(optgroup.querySelectorAll('option')).forEach(opt => {
                if (opt.disabled || !opt.value) return;
                optionsInGroups.add(opt.value);
                groupOptions.push({
                    value: opt.value,
                    text: opt.textContent.trim(),
                    i18n: opt.getAttribute('data-i18n')
                });
            });
            if (groupOptions.length > 0) {
                optgroups.push({
                    label: groupLabel,
                    i18n: groupI18n,
                    options: groupOptions
                });
            }
        });
        
        // Process standalone options (not in optgroups)
        const options = [];
        Array.from(select.options).forEach(opt => {
            if (opt.disabled || !opt.value || optionsInGroups.has(opt.value)) return;
            options.push({
                value: opt.value,
                text: opt.textContent.trim(),
                i18n: opt.getAttribute('data-i18n')
            });
        });
        
        // Build panel HTML
        optgroups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'custom-multiselect__group';
            const groupLabelEl = document.createElement('div');
            groupLabelEl.className = 'custom-multiselect__group-label';
            const lang = getCurrentLang();
            const dict = translations[lang] || translations.cs || translations.en;
            groupLabelEl.textContent = group.i18n && dict[group.i18n] ? dict[group.i18n] : group.label;
            groupEl.appendChild(groupLabelEl);
            
            group.options.forEach(opt => {
                const optionEl = document.createElement('label');
                optionEl.className = 'custom-multiselect__option';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = opt.value;
                checkbox.className = 'custom-multiselect__checkbox';
                const span = document.createElement('span');
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                span.textContent = opt.i18n && dict[opt.i18n] ? dict[opt.i18n] : opt.text;
                optionEl.appendChild(checkbox);
                optionEl.appendChild(span);
                groupEl.appendChild(optionEl);
            });
            panel.appendChild(groupEl);
        });
        
        // Add standalone options
        options.forEach(opt => {
            const optionEl = document.createElement('label');
            optionEl.className = 'custom-multiselect__option';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = opt.value;
            checkbox.className = 'custom-multiselect__checkbox';
            const span = document.createElement('span');
            const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
            span.textContent = opt.i18n && dict[opt.i18n] ? dict[opt.i18n] : opt.text;
            optionEl.appendChild(checkbox);
            optionEl.appendChild(span);
            panel.appendChild(optionEl);
        });
        
        // Assemble wrapper
        wrapper.appendChild(trigger);
        wrapper.appendChild(panel);
        
        // Replace select
        select.setAttribute('data-custom-multiselect', 'true');
        select.style.display = 'none';
        select.parentNode.insertBefore(wrapper, select);
        
        // Update display text function
        const updateDisplay = () => {
            const checked = wrapper.querySelectorAll('.custom-multiselect__checkbox:checked');
            const lang = getCurrentLang();
            const dict = translations[lang] || translations.cs || translations.en;
            if (checked.length === 0) {
                displayText.textContent = dict[placeholderKey] || 'Choose...';
            } else if (checked.length === 1) {
                displayText.textContent = checked[0].closest('.custom-multiselect__option').querySelector('span').textContent;
            } else {
                displayText.textContent = `${checked.length} ${dict['form.selected'] || 'selected'}`;
            }
        };
        
        // Handle checkbox changes
        panel.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const checked = wrapper.querySelectorAll('.custom-multiselect__checkbox:checked');
                if (checked.length > maxSelections) {
                    e.target.checked = false;
                    const lang = getCurrentLang();
                    const dict = translations[lang] || translations.cs || translations.en;
                    const errorKey = select.name === 'package' ? 'err.max_packages' : 'err.max_services';
                    showToast(dict[errorKey] || `Maximum ${maxSelections} can be selected`, 'error');
                    return;
                }
                updateDisplay();
                // Sync with hidden select
                const selectedValues = Array.from(checked).map(cb => cb.value);
                Array.from(select.options).forEach(opt => {
                    opt.selected = selectedValues.includes(opt.value);
                });
            }
        });
        
        // Handle trigger click
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = wrapper.classList.contains('is-open');
            document.querySelectorAll('.custom-multiselect').forEach(ms => {
                if (ms !== wrapper) ms.classList.remove('is-open');
            });
            wrapper.classList.toggle('is-open', !isOpen);
            trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
        
        updateDisplay();
    });
}

// URL parameter parsing - pre-select form fields on leadForm page
function initFormPreSelection() {
    const leadForm = document.querySelector('.lead-form');
    if (!leadForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    // Support both single values and comma-separated values
    const serviceParam = urlParams.get('service');
    const packageParam = urlParams.get('package');
    
    // Get all values for service (support multiple parameters or comma-separated)
    const services = [];
    if (serviceParam) {
        // Check if comma-separated
        if (serviceParam.includes(',')) {
            services.push(...serviceParam.split(',').map(s => s.trim()));
        } else {
            services.push(serviceParam);
        }
    }
    // Also check for multiple parameters with same name
    urlParams.getAll('service').forEach(s => {
        if (!services.includes(s)) services.push(s);
    });
    
    // Get all values for package
    const packages = [];
    if (packageParam) {
        if (packageParam.includes(',')) {
            packages.push(...packageParam.split(',').map(p => p.trim()));
        } else {
            packages.push(packageParam);
        }
    }
    urlParams.getAll('package').forEach(p => {
        if (!packages.includes(p)) packages.push(p);
    });

    if (services.length > 0) {
        const serviceSelect = leadForm.querySelector('select[name="service"]');
        if (serviceSelect) {
            // Select multiple options in hidden select
            services.forEach(serviceValue => {
                const option = serviceSelect.querySelector(`option[value="${serviceValue}"]`);
                if (option) {
                    option.selected = true;
                }
            });
            // Update custom multiselect checkboxes
            const customMultiselect = leadForm.querySelector(`.custom-multiselect[data-name="service"]`);
            if (customMultiselect) {
                services.forEach(serviceValue => {
                    const checkbox = customMultiselect.querySelector(`.custom-multiselect__checkbox[value="${serviceValue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                // Update display
                const checked = customMultiselect.querySelectorAll('.custom-multiselect__checkbox:checked');
                const displayText = customMultiselect.querySelector('.custom-multiselect__display');
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                if (checked.length === 0) {
                    displayText.textContent = dict['form.service_placeholder'] || 'Choose...';
                } else if (checked.length === 1) {
                    displayText.textContent = checked[0].closest('.custom-multiselect__option').querySelector('span').textContent;
                } else {
                    displayText.textContent = `${checked.length} ${dict['form.selected'] || 'selected'}`;
                }
            }
            // Trigger change event to ensure form validation works
            serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    if (packages.length > 0) {
        const packageSelect = leadForm.querySelector('select[name="package"]');
        if (packageSelect) {
            // Select multiple options in hidden select
            packages.forEach(packageValue => {
                const option = packageSelect.querySelector(`option[value="${packageValue}"]`);
                if (option) {
                    option.selected = true;
                }
            });
            // Update custom multiselect checkboxes
            const customMultiselect = leadForm.querySelector(`.custom-multiselect[data-name="package"]`);
            if (customMultiselect) {
                packages.forEach(packageValue => {
                    const checkbox = customMultiselect.querySelector(`.custom-multiselect__checkbox[value="${packageValue}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                // Update display
                const checked = customMultiselect.querySelectorAll('.custom-multiselect__checkbox:checked');
                const displayText = customMultiselect.querySelector('.custom-multiselect__display');
                const lang = getCurrentLang();
                const dict = translations[lang] || translations.cs || translations.en;
                if (checked.length === 0) {
                    displayText.textContent = dict['form.package_placeholder'] || 'Choose...';
                } else if (checked.length === 1) {
                    displayText.textContent = checked[0].closest('.custom-multiselect__option').querySelector('span').textContent;
                } else {
                    displayText.textContent = `${checked.length} ${dict['form.selected'] || 'selected'}`;
                }
            }
            // Trigger change event to ensure form validation works
            packageSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Load and render products for pricing page
async function loadPricingProducts() {
    const container = document.getElementById('pricing-products-container');
    if (!container) return;
    
    try {
        const data = await fetchAPI('/products', { page: 'pricing' });
        if (!data || !data.groups) return;
        
        const lang = getCurrentLang();
        let html = '';
        
        // Sort groups by order
        const sortedGroups = [...data.groups].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        sortedGroups.forEach(group => {
            const groupName = getTranslatedText(group.label || group.name, lang);
            html += `<h2 class="pricing-section-title">${groupName || 'Products'}</h2>`;
            html += '<div class="pricing-cards-grid">';
            
            // Sort products by order
            const sortedProducts = [...(group.products || [])]
                .filter(p => p.active !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            sortedProducts.forEach(product => {
                const productName = getTranslatedText(product.name, lang) || 'Product';
                const shortDescRaw = product.short_description || product.shortDescription || null;
                const shortDesc = shortDescRaw ? getTranslatedText(shortDescRaw, lang) : '';
                const fullDesc = product.description ? getTranslatedText(product.description, lang) : '';
                const price = formatPrice(product.price, product.priceRange, product.priceUnit || 'Kč');
                const isFullWidth = product.isFullWidth === true;
                const allowModal = product.allowModal === true;
                
                // Determine icon/image
                let iconHtml = '';
                const imageUrl = (product.imageUrl && product.imageUrl.trim()) || (product.iconImage && product.iconImage.trim()) || null;
                if (imageUrl && imageUrl.trim()) {
                    const imagePath = imageUrl.startsWith('./') || imageUrl.startsWith('/') || imageUrl.startsWith('http') 
                        ? imageUrl 
                        : `./${imageUrl}`;
                    iconHtml = `<img src="${imagePath}" alt="${productName}" />`;
                } else if (product.iconSvg && product.iconSvg.trim()) {
                    iconHtml = product.iconSvg;
                } else {
                    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M3 12h18" />
                    </svg>`;
                }
                
                // Determine data attribute for form redirect
                const formField = product.formField || (product.type === 'package' ? 'package' : 'service');
                const dataAttr = formField === 'package' ? `data-package="${product.code}"` : `data-service="${product.code}"`;
                
                // Add data attributes for modal if allowModal is true
                const modalAttrs = allowModal ? `data-product-code="${product.code}" data-product-description="${fullDesc ? encodeURIComponent(fullDesc) : ''}" data-product-image="${imageUrl || ''}"` : '';
                
                // Full-width class
                const fullWidthClass = isFullWidth ? ' pricing-card--full-width' : '';
                
                html += `<div class="pricing-card${fullWidthClass}" ${dataAttr} ${modalAttrs}>`;
                if (isFullWidth && imageUrl) {
                    html += `<div class="pricing-card-image">${iconHtml}</div>`;
                } else {
                    html += `<div class="pricing-card-icon">${iconHtml}</div>`;
                }
                html += `<div class="pricing-card-label">${productName}</div>`;
                if (shortDesc) {
                    html += `<div class="pricing-card-desc">${shortDesc}</div>`;
                }
                html += `<div class="pricing-card-price">${price}</div>`;
                html += `<button type="button" class="btn btn-primary pricing-order-btn" data-i18n="pricing.order">Order</button>`;
                html += '</div>';
            });
            
            html += '</div>';
        });
        
        container.innerHTML = html;
        
        // Re-initialize order buttons after content is loaded
        initPricingOrderButtons();
        
        // Initialize product modals after content is loaded
        initProductModals();
        
        // Apply i18n translations with current language
        applyI18n(lang);
    } catch (error) {
        console.error('Failed to load pricing products:', error);
        container.innerHTML = '<p>Failed to load products. Please try again later.</p>';
    }
}

// Load and render lessons for lessons page
async function loadLessonsProducts() {
    const lessonsPage = document.querySelector('.lessons-page');
    if (!lessonsPage) return;
    
    const container = lessonsPage.querySelector('.pricing-content');
    if (!container) return;
    
    try {
        const data = await fetchAPI('/products', { page: 'lessons' });
        if (!data || !data.groups) return;
        
        const lang = getCurrentLang();
        let html = '';
        
        // Sort groups by order
        const sortedGroups = [...data.groups].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        sortedGroups.forEach(group => {
            const groupName = getTranslatedText(group.label || group.name, lang);
            html += `<h2 class="pricing-section-title">${groupName || 'Lessons'}</h2>`;
            html += '<div class="pricing-cards-grid">';
            
            // Sort products by order
            const sortedProducts = [...(group.products || [])]
                .filter(p => p.active !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            sortedProducts.forEach(product => {
                const productName = getTranslatedText(product.name, lang) || 'Lesson';
                const shortDescRaw = product.short_description || product.shortDescription || null;
                const shortDesc = shortDescRaw ? getTranslatedText(shortDescRaw, lang) : '';
                const fullDesc = product.description ? getTranslatedText(product.description, lang) : '';
                const price = formatPrice(product.price, product.priceRange, product.priceUnit || 'Kč');
                const allowModal = product.allowModal === true;
                const hasModal = allowModal && fullDesc && fullDesc.trim();
                
                // Determine icon/image - prioritize imageUrl, then iconImage, then iconSvg
                let iconHtml = '';
                const imageUrl = (product.imageUrl && product.imageUrl.trim()) || (product.iconImage && product.iconImage.trim()) || null;
                if (imageUrl && imageUrl.trim()) {
                    const imagePath = imageUrl.startsWith('./') || imageUrl.startsWith('/') || imageUrl.startsWith('http') 
                        ? imageUrl 
                        : `./${imageUrl}`;
                    iconHtml = `<img src="${imagePath}" alt="${productName}" />`;
                } else if (product.iconSvg && product.iconSvg.trim()) {
                    iconHtml = product.iconSvg;
                } else {
                    // Default SVG placeholder
                    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M3 12h18" />
                    </svg>`;
                }
                
                // Determine data attribute for form redirect
                const formField = product.formField || (product.type === 'package' ? 'package' : 'service');
                const dataAttr = formField === 'package' ? `data-package="${product.code}"` : `data-service="${product.code}"`;
                
                // Add data attributes for modal if allowModal is true
                const modalAttrs = allowModal ? `data-product-code="${product.code}" data-product-description="${fullDesc ? encodeURIComponent(fullDesc) : ''}" data-product-image="${imageUrl || ''}"` : '';
                
                html += `<div class="pricing-card" ${dataAttr} ${modalAttrs}>`;
                html += `<div class="pricing-card-icon">${iconHtml}</div>`;
                html += `<div class="pricing-card-label">${productName}</div>`;
                if (shortDesc) {
                    html += `<div class="pricing-card-desc">${shortDesc}</div>`;
                }
                html += `<div class="pricing-card-price">${price}</div>`;
                html += '</div>';
            });
            
            html += '</div>';
        });
        
        // Replace static content with dynamic content
        // Find all static sections (h2 titles and grids)
        const staticSections = container.querySelectorAll('.pricing-section-title, .pricing-cards-grid');
        staticSections.forEach(el => el.remove());
        
        // Insert new content after the note paragraph
        const note = container.querySelector('.pricing-page-note');
        if (note) {
            note.insertAdjacentHTML('afterend', html);
        } else {
            container.insertAdjacentHTML('beforeend', html);
        }
        
        // Re-initialize lessons cards click handlers
        initLessonsCards();
        
        // Initialize product modals if needed
        initProductModals();
        
        // Apply i18n translations with current language
        applyI18n(lang);
    } catch (error) {
        console.error('Failed to load lessons products:', error);
    }
}

// Load and render services for services page (index.html)
async function loadServices() {
    const servicesSection = document.getElementById('services');
    if (!servicesSection) return;
    
    try {
        const data = await fetchAPI('/products', { page: 'packages' });
        if (!data || !data.groups || data.groups.length === 0) {
            // If no data, keep static content
            return;
        }
        
        const lang = getCurrentLang();
        let html = '';
        
        // Sort groups by order
        const sortedGroups = [...data.groups].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        sortedGroups.forEach(group => {
            const groupName = getTranslatedText(group.label || group.name, lang);
            html += `<h3 class="grid-title">${groupName || 'Services'}</h3>`;
            html += '<div class="cards-grid cards-2">';
            
            // Sort products by order
            const sortedProducts = [...(group.products || [])]
                .filter(p => p.active !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            
            sortedProducts.forEach(product => {
                const productName = getTranslatedText(product.name, lang) || 'Service';
                
                // For service cards, prioritize imageUrl, then iconSvg, then default SVG
                let iconHtml = '';
                const imageUrl = (product.imageUrl && product.imageUrl.trim()) || (product.iconImage && product.iconImage.trim()) || null;
                if (imageUrl && imageUrl.trim()) {
                    const imagePath = imageUrl.startsWith('./') || imageUrl.startsWith('/') || imageUrl.startsWith('http') 
                        ? imageUrl 
                        : `./${imageUrl}`;
                    iconHtml = `<img src="${imagePath}" alt="${productName}" />`;
                } else if (product.iconSvg && product.iconSvg.trim()) {
                    iconHtml = product.iconSvg;
                } else {
                    // Default SVG placeholder
                    iconHtml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M3 12h18" />
                    </svg>`;
                }
                
                // Determine redirect type based on formField or type
                const formField = product.formField || (product.type === 'package' ? 'package' : 'service');
                const dataAttr = formField === 'package' ? `data-package="${product.code}"` : `data-service="${product.code}"`;
                
                html += `<a class="service-card" href="./leadForm.html" ${dataAttr}>`;
                html += `<div class="icon" aria-hidden="true">${iconHtml}</div>`;
                html += `<div class="label">${productName}</div>`;
                html += '</a>';
            });
            
            html += '</div>';
        });
        
        // Replace static content with dynamic content only if we have HTML to insert
        if (html) {
            const heroContent = servicesSection.querySelector('.hero-content');
            if (heroContent) {
                // Find all static grid titles and card grids (but keep hero-title and hero-subtitle)
                const staticContent = heroContent.querySelectorAll('.grid-title, .cards-grid');
                if (staticContent && staticContent.length > 0) {
                    staticContent.forEach(el => el.remove());
                }
                
                // Insert new content after subtitle
                const subtitle = heroContent.querySelector('.hero-subtitle');
                if (subtitle) {
                    subtitle.insertAdjacentHTML('afterend', html);
                } else {
                    heroContent.insertAdjacentHTML('beforeend', html);
                }
            }
        }
        
        // Apply i18n translations with current language
        applyI18n(lang);
    } catch (error) {
        console.error('Failed to load services:', error);
        // On error, keep static content visible
    }
}

// Load form dropdown options from API
async function loadFormOptions() {
    const packageSelect = document.querySelector('select[name="package"]');
    const serviceSelect = document.querySelector('select[name="service"]');
    if (!packageSelect && !serviceSelect) return;

    try {
        const data = await fetchAPI('/form-options');
        if (!data) return;

        const lang = getCurrentLang();

        // Helper: build <option> element
        function createOption(item) {
            const opt = document.createElement('option');
            opt.value = item.code;
            opt.textContent = item.name
                ? (typeof item.name === 'object' ? getTranslatedText(item.name, lang) : item.name)
                : item.code;
            return opt;
        }

        // Helper: build <optgroup> from group object
        function createOptgroup(group) {
            const og = document.createElement('optgroup');
            og.label = group.label
                ? (typeof group.label === 'object' ? getTranslatedText(group.label, lang) : group.label)
                : group.id || '';
            const options = group.options || [];
            options
                .filter(o => o.active !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .forEach(item => og.appendChild(createOption(item)));
            return og;
        }

        // Populate package select
        if (packageSelect && data.packages) {
            // Remember any pre-selected values
            const preSelected = new Set(
                Array.from(packageSelect.selectedOptions).map(o => o.value).filter(Boolean)
            );

            // Clear existing options (keep first disabled placeholder)
            const placeholder = packageSelect.querySelector('option[disabled]');
            packageSelect.innerHTML = '';
            if (placeholder) packageSelect.appendChild(placeholder);

            // Standalone items
            if (data.packages.standalone && data.packages.standalone.length > 0) {
                data.packages.standalone
                    .filter(o => o.active !== false)
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .forEach(item => packageSelect.appendChild(createOption(item)));
            }

            // Groups
            if (data.packages.groups && data.packages.groups.length > 0) {
                data.packages.groups
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .forEach(group => packageSelect.appendChild(createOptgroup(group)));
            }

            // Restore pre-selection
            if (preSelected.size > 0) {
                Array.from(packageSelect.options).forEach(opt => {
                    if (preSelected.has(opt.value)) opt.selected = true;
                });
            }
        }

        // Populate service select
        if (serviceSelect && data.services) {
            const preSelected = new Set(
                Array.from(serviceSelect.selectedOptions).map(o => o.value).filter(Boolean)
            );

            const placeholder = serviceSelect.querySelector('option[disabled]');
            serviceSelect.innerHTML = '';
            if (placeholder) serviceSelect.appendChild(placeholder);

            // Services only have groups
            if (data.services.groups && data.services.groups.length > 0) {
                data.services.groups
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .forEach(group => serviceSelect.appendChild(createOptgroup(group)));
            }

            // Restore pre-selection
            if (preSelected.size > 0) {
                Array.from(serviceSelect.options).forEach(opt => {
                    if (preSelected.has(opt.value)) opt.selected = true;
                });
            }
        }

        // Re-initialize custom multiselect dropdowns with new options
        // Remove old custom multiselects
        document.querySelectorAll('.custom-multiselect').forEach(ms => {
            const selectEl = ms.parentNode.querySelector('select');
            if (selectEl) {
                selectEl.removeAttribute('data-custom-multiselect');
                selectEl.style.display = '';
            }
            ms.remove();
        });
        initCustomMultiselect();

        // Re-apply form pre-selection (URL params) after options are loaded
        initFormPreSelection();

        // Apply translations
        applyI18n(lang);
    } catch (error) {
        console.error('Failed to load form options:', error);
        // On error, keep static options visible
    }
}

// Initialize all components
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initCustomMultiselect();
        initPricingOrderButtons();
        initLessonsCards();
        initFormPreSelection();
        initProductModals();
        loadPricingProducts();
        loadLessonsProducts();
        loadServices();
        loadFormOptions();
    });
} else {
    initCustomMultiselect();
    initPricingOrderButtons();
    initLessonsCards();
    initFormPreSelection();
    initProductModals();
    loadPricingProducts();
    loadLessonsProducts();
    loadServices();
    loadFormOptions();
}
