(() => {
    const STORAGE_KEY = 'm2-theme';
    const body = document.body;
    const buttons = document.querySelectorAll('[data-theme-switch]');

    const applyTheme = (theme) => {
        body.setAttribute('data-theme', theme);
        buttons.forEach((btn) => {
            const active = btn.getAttribute('data-theme-switch') === theme;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    };

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            applyTheme(saved);
        } else {
            applyTheme(body.getAttribute('data-theme') || 'web');
        }
    } catch (error) {
        applyTheme(body.getAttribute('data-theme') || 'web');
    }

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme-switch');
            try {
                localStorage.setItem(STORAGE_KEY, theme);
            } catch (error) {
                // Ignore storage errors.
            }
            applyTheme(theme);
        });
    });
})();
