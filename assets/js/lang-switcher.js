(() => {
    const switchTo = (toLang) => {
        const link = document.querySelector(`link[hreflang="${toLang}"]`);
        if (link) {
            window.location.href = link.href;
        }
    };

    // Mark the active language button
    const markActive = () => {
        const currentLang = document.documentElement.lang;
        document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
            const isActive = btn.getAttribute('data-lang-switch') === currentLang;
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    };

    // Wire up buttons
    document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
        btn.addEventListener('click', () => {
            switchTo(btn.getAttribute('data-lang-switch'));
        });
    });

    markActive();
})();
