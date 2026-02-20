(function () {
  const KEY = 'ds_cookie_consent_v1';

  function getConsent() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('consent:changed', { detail: { value } }));
  }

  function accept() {
    setConsent('accepted');
  }

  function reject() {
    setConsent('rejected');
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('consent:changed', { detail: { value: null } }));
  }

  window.CookieConsent = { getConsent, accept, reject, reset };
})();
