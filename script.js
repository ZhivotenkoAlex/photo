const navToggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav');
const emailUrl = 'https://script.google.com/macros/s/AKfycbyTs5M0E_DNRt5xVgUUpzH422yaroOlw4AarYOqwXBuyj0IJzWMwP62nYs0sF521Egf2g/exec'

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
    const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
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
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(leadForm);
        const name = (formData.get('name') || '').toString().trim();
        const surname = (formData.get('surname') || '').toString().trim();
        const phone = (formData.get('phone') || '').toString().trim();
        const contact = (formData.get('contact') || '').toString().trim();
        const service = (formData.get('service') || '').toString().trim();
        const city = (formData.get('city') || '').toString().trim();
        const street = (formData.get('street') || '').toString().trim();
        const house = (formData.get('house') || '').toString().trim();
        const comment = (formData.get('comment') || '').toString().trim();
        const packageName = (formData.get('package') || '').toString().trim();
        // Basic validation
        // clear previous errors
        leadForm.querySelectorAll('.field-error').forEach(el => el.remove());
        leadForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        const errors = [];
        const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
        const markError = (selectorKey, messageKey) => {
            const field = leadForm.querySelector(`[name="${selectorKey}"]`);
            if (field) {
                field.classList.add('error');
                const msg = document.createElement('div');
                msg.className = 'field-error';
                msg.textContent = dict[messageKey] || dict['err.required'];
                field.parentElement.appendChild(msg);
            }
        };
        if (!name) { errors.push('name'); markError('name', 'err.required'); }
        if (!surname) { errors.push('surname'); markError('surname', 'err.required'); }
        if (!city) { errors.push('city'); markError('city', 'err.required'); }
        if (!packageName) { errors.push('package'); markError('package', 'err.required'); }
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
        if (!service) { errors.push('service'); markError('service', 'err.required'); }
        if (errors.length) {
            const firstErrorEl = leadForm.querySelector('.error');
            if (firstErrorEl) scrollToWithOffset(firstErrorEl);
            return;
        }
        const url = emailUrl
        const qs = new URLSearchParams({ name, surname, phone, contact, city, street, house, comment, package: packageName, service });
        fetch(`${url}?${qs.toString()}`, { method: 'GET' })
            .then(async (r) => {
                const data = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(data.error || 'Request failed');
                const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.success'] || 'Thank you! We will contact you shortly.');
                }
                leadForm.reset();
            })
            .catch((err) => {
                console.error(err);
                const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.error'] || 'Sorry, something went wrong. Please try again later.', 'error');
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
        const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
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

        const url = emailUrl
        const qs = new URLSearchParams({
            type: 'cooperation', name, phone, email, city, role, portfolio, experience, driving_b: drivingB, comment
        });
        fetch(`${url}?${qs.toString()}`, { method: 'GET' })
            .then(async (r) => {
                const data = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(data.error || 'Request failed');
                const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.success'] || 'Thank you! We will contact you shortly.');
                }
                coopForm.reset();
            })
            .catch((err) => {
                console.error(err);
                const dict = translations[localStorage.getItem('lang') || 'en'] || translations.en;
                if (typeof showToast === 'function') {
                    showToast(dict['toast.error'] || 'Sorry, something went wrong. Please try again later.', 'error');
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
        'nav.coop': 'Cooperation',
        'nav.services': 'Services',
        'nav.portfolio': 'Portfolio',
        // Portfolio
        'portfolio.title': 'Selected Works',
        'portfolio.subtitle': 'A glimpse into our photography and video projects.',
        'team.title': 'Our Team',
        'team.owner_desc': '3D rendering. Taking and processing photos and videos.',
        'team.photographer_desc': 'Portraits, events and product shoots.',
        'team.videographer_desc': 'Wedding and corporate video production.',
        'team.agent_desc': 'Friendly first contact who confirms details and timing.',
        // Team labels
        'team.label_name': 'Name',
        'team.label_experience': 'Experience',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ years',
        'team.name_photographer': '—',
        'team.exp_photographer': '15+ years',
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
        'team.worker_name_1': 'Dmytro',
        'team.worker_name_2': 'Obiwan',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Chubaka',
        'team.photo_editor_desc': 'Photo editing.',
        'team.video_editor_desc': 'Video editing.',
        'team.worker_1_role': 'Photographer & Videographer',
        'team.worker_1_description': '<p>I am a professional videographer and photographer with extensive experience working in television and over 40 filmed wedding ceremonies. I specialize in shooting various events: concerts, corporate events, presentations, educational and cultural projects.</p><p>I have deep experience in live content shooting, reportage photography, visual storytelling, and working with people on camera. My goal is to capture genuine emotions and create quality visual content that conveys the atmosphere of the event.</p><p>I have completed professional courses in video editing in Adobe Premiere Pro and photo processing in Adobe Lightroom. I work with modern digital photo and video cameras in HD format, using a stabilizer for smooth camera movements and a lapel microphone for quality sound.</p>',
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
        'pricing.discount': 'Grand Opening Special: 30% discount on all packages!',
        'pricing.note': "Prices are indicative and may vary depending on location, timing and specific requirements.",
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
        'nav.coop': 'Spolupráce',
        'nav.services': 'Služby',
        'nav.portfolio': 'Portfolio',
        // Portfolio
        'portfolio.title': 'Ukázky prací',
        'portfolio.subtitle': 'Nahlédněte do našich foto a video projektů.',
        'team.title': 'Náš tým',
        'team.owner_desc': '3D rendering. Pořizování a zpracování fotografií a videí.',
        'team.photographer_desc': 'Portréty, akce a produktové focení.',
        'team.videographer_desc': 'Svatby a firemní video produkce.',
        'team.agent_desc': 'Přátelský první kontakt, který potvrdí detaily a čas.',
        // Team labels
        'team.label_name': 'Jméno',
        'team.label_experience': 'Zkušenosti',
        'team.founder_name': 'Evgen',
        'team.worker_name_1': 'Dmytro',
        'team.worker_name_2': 'Obiwan',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Chubaka',
        'team.photo_editor_desc': 'Úprava fotografií.',
        'team.video_editor_desc': 'Střih videa.',
        'team.worker_1_role': 'Fotograf a videograf',
        'team.worker_1_description': '<p>Jsem profesionální videograf a fotograf s rozsáhlými zkušenostmi z práce v televizi a více než 40 natočenými svatebními obřady. Specializuji se na natáčení různých akcí: koncertů, firemních akcí, prezentací, vzdělávacích a kulturních projektů.</p><p>Mám hluboké zkušenosti s natáčením živého obsahu, reportážní fotografií, vizuálním storytellingem a prací s lidmi před kamerou. Mým cílem je zachytit skutečné emoce a vytvořit kvalitní vizuální obsah, který přenáší atmosféru události.</p><p>Absolvoval jsem profesionální kurzy střihu videa v Adobe Premiere Pro a zpracování fotografií v Adobe Lightroom. Pracuji s moderními digitálními fotoaparáty a videokamerami ve formátu HD, používám stabilizátor pro plynulé pohyby kamery a náhrdelníkový mikrofon pro kvalitní zvuk.</p>',
        'team.founder_description': '<p>Po ukončení kariéry profesionálního kaskadéra jsem se konečně věnoval tomu, co mě vždy přitahovalo — umění zachycovat okamžiky. Roky intenzivního fyzického výkonu mě naučily vidět krásu v pohybu, předvídat dokonalý moment a chápat sílu vizuálního vyprávění.</p><p>Moje zkušenosti s kaskadérstvím mi daly jedinečný pohled na kompozici, načasování a schopnost zůstat v klidu pod tlakem. Vím z první ruky, co je potřeba k zachycení dokonalého záběru — ať už jde o zlomek sekundy výrazu nebo dynamickou akční sekvenci. Tyto zkušenosti pohání vše, co v Memori děláme.</p><p>Jako zakladatel dohlížím na každý projekt, abych zajistil nejvyšší kvalitu. Koordinuji náš talentovaný tým, starám se o vztahy s klienty a osobně dohlížím na složité natáčení. Mým posláním je jednoduché: pomoci lidem uchovat jejich nejcennější okamžiky s výjimečnou kvalitou a pozorností k detailům.</p><p>Memori není jen podnikání — je to realizace celoživotní vášně. Každý záběr, který zachytíme, každé video, které vytvoříme, nese oddanost a odbornost, která pochází z opravdové lásky k tomu, co děláte.</p>',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ let',
        'team.name_photographer': '—',
        'team.exp_photographer': '15+ let',
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
        'pricing.discount': 'Speciální akce k otevření: 30% sleva na všechny balíčky!',
        'pricing.note': 'Ceny jsou orientační a mohou se lišit podle místa, termínu a konkrétních požadavků.',
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
        'nav.coop': 'Співпраця',
        'nav.services': 'Послуги',
        'nav.portfolio': 'Портфоліо',
        // Portfolio
        'portfolio.title': 'Обрані роботи',
        'portfolio.subtitle': 'Трохи наших фото- та відеопроєктів.',
        'team.title': 'Наша команда',
        'team.owner_desc': '3D обробка. Зйомка і обробка фото і відео.',
        'team.photographer_desc': 'Портрети, івенти та предметна зйомка.',
        'team.videographer_desc': 'Весільне та корпоративне відео.',
        'team.agent_desc': 'Перший контакт, який підтверджує деталі та час.',
        // Team labels
        'team.label_name': "Ім'я",
        'team.label_experience': 'Досвід',
        // Team values
        'team.name_owner': 'Memori',
        'team.exp_owner': '4+ років',
        'team.name_photographer': '—',
        'team.exp_photographer': '15+ років',
        'team.worker_name_2': 'Обіван',
        'team.exp_videographer': '5+ років',
        'team.worker_name_3': '3CPO',
        'team.worker_name_4': 'R2D2',
        'team.worker_name_5': 'Чубaka',
        'team.founder_name': 'Євген',
        'team.worker_name_1': 'Дмитро',
        'team.worker_1_role': 'Фотограф та відеооператор',
        'team.worker_1_description': '<p>Я — професійний відеограф та фотограф з багаторічним досвідом роботи на телебаченні та понад 40 відзнятими весільними церемоніями. Спеціалізуюся на зйомці різноманітних подій: концертів, корпоративних заходів, презентацій, освітніх та культурних проєктів.</p><p>Маю глибокий досвід у зйомці живого контенту, репортажної фотографії, візуального сторітелінгу та роботи з людьми в кадрі. Моя мета — зафіксувати справжні емоції та створити якісний візуальний контент, який передає атмосферу події.</p><p>Пройшов професійні курси відеомонтажу в Adobe Premiere Pro та обробки фотографій в Adobe Lightroom. Працюю з сучасними цифровими фото- та відеокамерами у форматі HD, використовую стабілізатор для плавних рухів камери та петличний мікрофон для якісного звуку.</p>',
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
        'err.required': 'Це поле є обов’язковим',
        'err.phone': 'Введіть коректний номер телефону.',
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
        'pricing.discount': 'Акція на відкриття: знижка 30% на всі пакети!',
        'pricing.note': 'Ціни орієнтовні та можуть змінюватись залежно від локації, часу та вимог.',
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

function applyI18n(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
    // translate optgroup labels
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
        const key = el.getAttribute('data-i18n-label');
        if (dict[key]) el.setAttribute('label', dict[key]);
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

// Custom dropdown - always opens downward
const langDd = document.getElementById('lang-dd');
if (langDd) {
    const btn = langDd.querySelector('.lang-dd__btn');
    const list = langDd.querySelector('.lang-dd__list');
    const label = document.getElementById('lang-dd-label');
    const saved = localStorage.getItem('lang') || 'cs';
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
const productPopup = document.getElementById('product-popup');
if (productPopup) {
    const popupImage = document.getElementById('popup-image');
    const popupTitle = document.getElementById('popup-title');
    const popupPrice = document.getElementById('popup-price');
    const popupClose = productPopup.querySelector('.product-popup-close');
    const popupOverlay = productPopup.querySelector('.product-popup-overlay');

    const openPopup = (imageSrc, title, price) => {
        popupImage.src = imageSrc;
        popupImage.alt = title;
        popupTitle.textContent = title;
        popupPrice.textContent = price;
        productPopup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closePopup = () => {
        productPopup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Open popup on product card click
    const productCards = document.querySelectorAll('.pricing-products-grid .pricing-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const img = card.querySelector('.pricing-card-icon img');
            const label = card.querySelector('.pricing-card-label');
            const price = card.querySelector('.pricing-card-price');

            if (img && label && price) {
                openPopup(img.src, label.textContent, price.textContent);
            }
        });
    });

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

// Initialize team member modals
let teamModalsInitialized = false;

function initTeamModals() {
    if (teamModalsInitialized) return;
    teamModalsInitialized = true;

    const teamCards = document.querySelectorAll('.team-card[data-team-photo]');

    teamCards.forEach(card => {
        card.addEventListener('click', () => {
            const photoSrc = card.getAttribute('data-team-photo');
            const name = card.querySelector('.name')?.textContent || '';
            const role = card.querySelector('.role')?.textContent || '';

            // Get description from translation key or direct HTML
            const descriptionKey = card.getAttribute('data-team-description-key');
            let description = '';

            if (descriptionKey) {
                const lang = localStorage.getItem('lang') || 'en';
                const dict = translations[lang] || translations.en;
                description = dict[descriptionKey] || '';
            } else {
                description = card.getAttribute('data-team-description') || '';
            }

            if (photoSrc && name) {
                openTeamModal(photoSrc, name, role, description);
            }
        });
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
