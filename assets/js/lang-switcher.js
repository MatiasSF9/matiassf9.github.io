(() => {
    const LANGS = ['es', 'en'];

    // Detect current language from pathname.
    // Works under any GitHub Pages subpath (e.g. /repo/es/projects/).
    const detectCurrentLang = (pathname) => {
        for (const lang of LANGS) {
            // Match /<anything>/es/ or /<anything>/es/more/path
            const re = new RegExp(`(^|/)${lang}(/|$)`);
            if (re.test(pathname)) {
                return lang;
            }
        }
        return null;
    };

    // Swap the language segment in the pathname.
    const buildTargetPath = (pathname, fromLang, toLang) => {
        // Replace first occurrence of /fromLang/ or /fromLang at end
        return pathname.replace(
            new RegExp(`((?:^|/))(${fromLang})(/|$)`),
            `$1${toLang}$3`
        );
    };

    const switchTo = (toLang) => {
        const { pathname } = window.location;
        const fromLang = detectCurrentLang(pathname);

        if (!fromLang) {
            // Not inside a lang folder — go to lang home
            window.location.href = `./${toLang}/`;
            return;
        }

        if (fromLang === toLang) {
            return; // Already on the right language
        }

        const targetPath = buildTargetPath(pathname, fromLang, toLang);

        // Verify mirror page exists before navigating
        fetch(targetPath, { method: 'HEAD' })
            .then((res) => {
                if (res.ok) {
                    window.location.href = targetPath;
                } else {
                    // Fallback: go to lang home, preserving the base path prefix
                    const basePath = pathname.replace(
                        new RegExp(`((?:^|/))(${fromLang})(/.*)?$`),
                        `$1${toLang}/`
                    );
                    window.location.href = basePath;
                }
            })
            .catch(() => {
                // Network error — still try the target; worst case browser shows 404
                window.location.href = targetPath;
            });
    };

    // Mark the active language button
    const markActive = () => {
        const currentLang = detectCurrentLang(window.location.pathname);
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
