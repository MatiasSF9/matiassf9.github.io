(function () {
  const GA_ID = 'G-4P6GBFYSSK';

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = window.gtag || gtag;
  }

  function setDefaultDenied() {
    ensureDataLayer();
    window.gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function grantAnalytics() {
    ensureDataLayer();
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }

  function loadGtagScriptOnce() {
    if (document.querySelector('script[data-ga4="true"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    s.setAttribute('data-ga4', 'true');
    document.head.appendChild(s);
  }

  function initGA4() {
    ensureDataLayer();
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function sync() {
    const c = window.CookieConsent && window.CookieConsent.getConsent
      ? window.CookieConsent.getConsent()
      : null;

    setDefaultDenied();

    if (c === 'accepted') {
      loadGtagScriptOnce();
      grantAnalytics();
      initGA4();
    }
  }

  window.addEventListener('consent:changed', sync);
  document.addEventListener('DOMContentLoaded', sync);
})();
