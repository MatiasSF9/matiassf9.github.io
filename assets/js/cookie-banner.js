(function () {
  const COPY = {
    es: {
      text: 'Usamos cookies de analítica para entender el tráfico del sitio. Puedes aceptar o rechazar.',
      accept: 'Aceptar analítica',
      reject: 'Rechazar',
      link: 'Ver política de privacidad',
      href: '/es/privacy/',
    },
    en: {
      text: 'We use analytics cookies to understand site traffic. You can accept or reject.',
      accept: 'Accept analytics',
      reject: 'Reject',
      link: 'View privacy policy',
      href: '/en/privacy/',
    },
  };

  const detectLang = () => {
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang) {
      return htmlLang.toLowerCase().startsWith('en') ? 'en' : 'es';
    }
    const path = window.location.pathname || '';
    if (/(^|\/)en(\/|$)/.test(path)) return 'en';
    if (/(^|\/)es(\/|$)/.test(path)) return 'es';
    return 'es';
  };

  const buildBanner = (lang) => {
    const copy = COPY[lang] || COPY.es;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');

    const content = document.createElement('div');
    content.className = 'cookie-banner__content';

    const text = document.createElement('p');
    text.className = 'cookie-banner__text';
    text.textContent = copy.text;

    const actions = document.createElement('div');
    actions.className = 'cookie-banner__actions';

    const accept = document.createElement('button');
    accept.type = 'button';
    accept.setAttribute('data-cc', 'accept');
    accept.textContent = copy.accept;

    const reject = document.createElement('button');
    reject.type = 'button';
    reject.setAttribute('data-cc', 'reject');
    reject.textContent = copy.reject;

    const link = document.createElement('a');
    link.href = copy.href;
    link.textContent = `${copy.link} →`;

    actions.appendChild(accept);
    actions.appendChild(reject);
    actions.appendChild(link);

    content.appendChild(text);
    content.appendChild(actions);
    banner.appendChild(content);

    return banner;
  };

  const init = () => {
    if (!window.CookieConsent || typeof window.CookieConsent.getConsent !== 'function') {
      return;
    }
    if (document.querySelector('.cookie-banner')) return;

    const lang = detectLang();
    const banner = buildBanner(lang);
    document.body.appendChild(banner);

    const setVisibility = (value) => {
      const visible = value == null;
      banner.classList.toggle('cookie-banner--visible', visible);
      banner.setAttribute('aria-hidden', visible ? 'false' : 'true');
    };

    const current = window.CookieConsent.getConsent();
    setVisibility(current);

    banner.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.getAttribute('data-cc');
      if (action === 'accept') {
        window.CookieConsent.accept();
      }
      if (action === 'reject') {
        window.CookieConsent.reject();
      }
    });

    window.addEventListener('consent:changed', (event) => {
      const detail = event.detail || {};
      setVisibility(detail.value ?? null);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
