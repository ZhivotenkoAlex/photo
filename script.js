const navToggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav');

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

// Close mobile menu when a nav item is clicked
document.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('is-open')) {
            navMenu.classList.remove('is-open');
            if (navToggleButton) navToggleButton.setAttribute('aria-expanded', 'false');
        }
    });
});

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
        const phoneValid = isValidPhoneNumber(phone);
        console.log("🚀 ~ phoneValid:", phoneValid)
        if (!phone) {
            errors.push('phone');
            markError('phone', 'err.required');
        } else if (!phoneValid) {
            errors.push('phone');
            markError('phone', 'err.phone');
        }
        if (!service) { errors.push('service'); markError('service', 'err.required'); }
        if (errors.length) return;
        const url = 'https://script.google.com/macros/s/AKfycbw5rkSkBRpG4MejP6yIZfEDKy_Zl_zRYklByB4XLOjsDeyq0MOIH1X9s-BblH160zhgyQ/exec'
        const qs = new URLSearchParams({ name, surname, phone, contact, city, street, house, comment, package: packageName, service });
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
        'nav.price': 'Price',
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
        'svc.video_birthday': 'Birthday video',
        'svc.video_wedding': 'Wedding video',
        'svc.video_corporate': 'Corporate video',
        'svc.photo_studio': 'Studio photo session',
        'svc.video_misc': 'Other video',
        'group.photo': 'Photo',
        'group.video': 'Video',
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
        'form.package': 'Package',
        'form.package_placeholder': 'Choose a package',
        'form.service': 'Service',
        'form.service_placeholder': 'Choose a service',
        'form.required_hint': 'Fields marked with * are required.',
        'err.required': 'This field is required',
        'err.phone': 'Enter a valid phone number',
        'form.submit': 'Get a Quote',
        'form.note': 'By sending the form, you agree to our privacy policy.',
        'ph.name': 'Jane',
        'ph.surname': 'Doe',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram or Viber number',
        'ph.city': 'City',
        'ph.street': 'Street name',
        'ph.house': 'e.g., 24A',
        'ph.comment': 'Describe your request (date, location, style)...',
        'pricing.title': 'Packages and pricing (CZK)',
        'pricing.note': "Prices are indicative and may vary depending on location, timing and specific requirements. We'll confirm the final quote after a quick chat.",
        'pricing.photo': 'Photography',
        'pricing.standard': 'Standard — 90 min + 40 photos',
        'pricing.basic': 'Basic — 60 min + 25 photos',
        'pricing.premium': 'Premium — 120 min + 60 photos',
        'pricing.video': 'Videography',
        'pricing.video_hour': '1 hour',
        'pricing.extras': 'Extras',
        'pricing.print_all': 'Printing all package photos',
        'pricing.video_disc': 'Video on disc',
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
    },
    cs: {
        'nav.services': 'Služby',
        'nav.portfolio': 'Portfolio',
        'nav.about': 'O nás',
        'nav.contact': 'Kontakt',
        'nav.price': 'Ceny',
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
        'svc.photo_corporate': 'Fotografie na korporátní akce',
        'svc.video_birthday': 'Video na narozeniny',
        'svc.video_wedding': 'Video na svatbu',
        'svc.video_corporate': 'Video na korporátní akce',
        'svc.photo_studio': 'Ateliérové focení',
        'svc.video_misc': 'Ostatní video',
        'group.photo': 'Foto',
        'group.video': 'Video',
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
        'form.package': 'Balíček',
        'form.package_placeholder': 'Vyberte balíček',
        'form.service': 'Služba',
        'form.service_placeholder': 'Vyberte službu',
        'form.required_hint': 'Povinná pole jsou označena *.',
        'err.required': 'Toto pole je povinné',
        'err.phone': 'Zadejte platné telefonní číslo',
        'form.submit': 'Získat nabídku',
        'form.note': 'Odesláním formuláře souhlasíte se zásadami ochrany osobních údajů.',
        'ph.name': 'Jan',
        'ph.surname': 'Novák',
        'ph.phone': '+420 777 123 456',
        'ph.contact': '@telegram nebo číslo Viberu',
        'ph.city': 'Město',
        'ph.street': 'Název ulice',
        'ph.house': 'např. 24A',
        'ph.comment': 'Popište svou poptávku (termín, místo, styl)...',
        'pricing.title': 'Balíčky a ceny (Kč)',
        'pricing.note': 'Ceny jsou orientační a mohou se lišit podle místa, termínu a konkrétních požadavků. Konečnou nabídku potvrdíme po krátké konzultaci.',
        'pricing.photo': 'Fotografie',
        'pricing.standard': 'Standard — 90 min + 40 fotografií',
        'pricing.basic': 'Basic — 60 min + 25 fotografií',
        'pricing.premium': 'Premium — 120 min + 60 fotografií',
        'pricing.video': 'Video',
        'pricing.video_hour': '1 hodina',
        'pricing.extras': 'Doplňky',
        'pricing.print_all': 'Tisk všech fotografií z balíčku',
        'pricing.video_disc': 'Video na disku',
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
    },
    uk: {
        'nav.services': 'Послуги',
        'nav.portfolio': 'Портфоліо',
        'nav.about': 'Про нас',
        'nav.contact': 'Контакти',
        'nav.price': 'Ціни',
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
        'svc.video_birthday': 'Відео на день народження',
        'svc.video_wedding': 'Відео на весілля',
        'svc.video_corporate': 'Відео для корпоративів',
        'svc.video_misc': 'Інше відео',
        'group.photo': 'Фото',
        'group.video': 'Відео',
        'dark.title': 'Фото- та відеопослуги у вашому місті',
        'dark.desc': 'Досвідчена команда, чесні ціни, швидкі терміни. Залишайте заявку — ми передзвонимо протягом 15 хвилин.',
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
        'form.submit': 'Отримати пропозицію',
        'form.note': 'Надсилаючи форму, ви погоджуєтесь з політикою конфіденційності.',
        'ph.name': 'Іван',
        'ph.surname': 'Іваненко',
        'ph.phone': '+ 420 777 123 456',
        'ph.contact': '@telegram або номер Viber',
        'ph.city': 'Місто',
        'ph.street': 'Назва вулиці',
        'ph.house': 'напр., 24А',
        'ph.comment': 'Опишіть запит (дата, локація, стиль)...',
        'pricing.title': 'Пакети та ціни (CZK)',
        'pricing.note': 'Ціни орієнтовні та можуть змінюватись залежно від локації, часу та вимог. Остаточну вартість підтвердимо після короткої консультації.',
        'pricing.photo': 'Фотографія',
        'pricing.standard': 'Стандарт — 90 хв + 40 фото',
        'pricing.basic': 'Базовий — 60 хв + 25 фото',
        'pricing.premium': 'Преміум — 120 хв + 60 фото',
        'pricing.video': 'Відео',
        'pricing.video_hour': '1 година',
        'pricing.extras': 'Додатково',
        'pricing.print_all': 'Друк усіх фото з пакету',
        'pricing.video_disc': 'Відео на диску',
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
    }
};

function applyI18n(lang) {
    const dict = translations[lang] || translations.sc;
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
