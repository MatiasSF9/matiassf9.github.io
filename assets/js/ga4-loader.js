(function () {
  function ensureGtagStub() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    }
  }

  const GA_ID = 'G-4P6GBFYSSK';

  function loadScriptOnce(src) {
    if (document.querySelector('script[data-ga4="true"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    s.setAttribute('data-ga4', 'true');
    document.head.appendChild(s);
  }

  function initGtag() {
    ensureGtagStub();
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function enableGA() {
    loadScriptOnce('https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    initGtag();
  }

  function sync() {
    const c = window.CookieConsent && window.CookieConsent.getConsent
      ? window.CookieConsent.getConsent()
      : null;

    if (c === 'accepted') enableGA();
  }

  window.addEventListener('consent:changed', sync);
  document.addEventListener('DOMContentLoaded', sync);

  ensureGtagStub();
})();
