(function () {
  const COPY = {
    es: {
      text: 'Usamos cookies de analítica para entender el tráfico del sitio. Puedes aceptar o rechazar.',
      accept: 'Aceptar analítica',
      reject: 'Rechazar',
      link: 'Ver política de privacidad →',
      href: '/es/privacy/',
    },
    en: {
      text: 'We use analytics cookies to understand site traffic. You can accept or reject.',
      accept: 'Accept analytics',
      reject: 'Reject',
      link: 'View privacy policy →',
      href: '/en/privacy/',
    },
  };

  function detectLang() {
    const path = window.location.pathname || '/';
    if (path === '/es' || path.startsWith('/es/')) return 'es';
    if (path === '/en' || path.startsWith('/en/')) return 'en';
    return 'en';
  }

  function buildBanner(lang) {
    const copy = COPY[lang] || COPY.en;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie consent');

    const content = document.createElement('div');
    content.className = 'cookie-banner__content';

    const text = document.createElement('p');
    text.className = 'cookie-banner__text';
    text.textContent = copy.text;

    const actions = document.createElement('div');
    actions.className = 'cookie-banner__actions';

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'cookie-banner__btn cookie-banner__btn--primary';
    accept.setAttribute('data-cc', 'accept');
    accept.textContent = copy.accept;

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.className = 'cookie-banner__btn';
    reject.setAttribute('data-cc', 'reject');
    reject.textContent = copy.reject;

    const link = document.createElement('a');
    link.className = 'cookie-banner__link';
    link.setAttribute('data-cc', 'privacy');
    link.href = copy.href;
    link.textContent = copy.link;

    actions.appendChild(accept);
    actions.appendChild(reject);
    actions.appendChild(link);

    content.appendChild(text);
    content.appendChild(actions);
    banner.appendChild(content);

    return banner;
  }

  function init() {
    if (!window.CookieConsent || typeof window.CookieConsent.getConsent !== 'function') return;

    const current = window.CookieConsent.getConsent();
    if (current !== null) return;

    const banner = buildBanner(detectLang());
    document.body.appendChild(banner);

    banner.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.getAttribute('data-cc');
      if (action === 'accept') {
        window.CookieConsent.accept();
        banner.remove();
      }
      if (action === 'reject') {
        window.CookieConsent.reject();
        banner.remove();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
