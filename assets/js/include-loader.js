(() => {
    // ─────────────────────────────────────────────
    // 1. Path resolution
    // ─────────────────────────────────────────────

    /**
     * Compute the path prefix needed to reach the site root from the
     * current page.  Works under any GitHub Pages subpath.
     *
     * Examples (pathname → prefix):
     *   /es/                         → ../
     *   /es/projects/                → ../../
     *   /es/projects/dolarplus/      → ../../../
     *   /repo/es/projects/dolarplus/ → ../../../   (subpath repo is ignored)
     *
     * Strategy: count how many path segments live *after* the lang segment.
     */
    const computePrefix = () => {
        const parts = window.location.pathname
            .replace(/\/$/, '')   // strip trailing slash
            .split('/')
            .filter(Boolean);     // remove empty strings

        // Find the index of the lang segment (es or en)
        const langIdx = parts.findIndex((p) => p === 'es' || p === 'en');

        if (langIdx === -1) {
            // Not inside a lang folder — shouldn't normally happen
            return './';
        }

        // Segments after lang segment = depth below lang root
        const depth = parts.length - langIdx; // lang itself counts as 1
        return '../'.repeat(depth);
    };

    /**
     * Detect current language from pathname.
     */
    const detectLang = () => {
        const m = window.location.pathname.match(/(^|\/)(\ben|\bes)\//);
        return m ? m[2] : 'es';
    };

    // ─────────────────────────────────────────────
    // 2. Navigation link builder
    // ─────────────────────────────────────────────

    /**
     * After injecting the header/footer, resolve all [data-nav] links.
     * The home page uses anchor links (#section); sub-pages use absolute
     * paths so the browser can navigate back to the home sections.
     *
     * Link map per nav key:
     *   home     → <prefix><lang>/
     *   projects → <prefix><lang>/#projects   (anchor on home)
     *   about    → <prefix><lang>/#about
     *   contact  → <prefix><lang>/#contact
     *   privacy  → <prefix><lang>/privacy/
     *
     * Text map per key × lang:
     *   projects: Proyectos / Projects
     *   about:    Sobre mi  / About
     *   contact:  Contacto  / Contact
     *   privacy:  Privacidad / Privacy
     */
    const NAV_TEXT = {
        es: {
            projects: 'Proyectos',
            about: 'Sobre mi',
            contact: 'Contacto',
            privacy: 'Privacidad',
        },
        en: {
            projects: 'Projects',
            about: 'About',
            contact: 'Contact',
            privacy: 'Privacy',
        },
    };

    const FOOTER_TAGLINE = {
        es: 'Hecho con claridad y cuidado.',
        en: 'Built with clarity and care.',
    };

    const resolveNavLinks = (root, prefix, lang) => {
        const base = `${prefix}${lang}/`;
        const links = {
            home:     base,
            projects: `${base}projects/`,
            about:    `${base}about/`,
            contact:  `${base}contact/`,
            privacy:  `${base}privacy/`,
        };
        const text = NAV_TEXT[lang] || NAV_TEXT['es'];

        root.querySelectorAll('[data-nav]').forEach((el) => {
            const key = el.getAttribute('data-nav');
            if (links[key]) {
                el.setAttribute('href', links[key]);
            }
            if (text[key]) {
                el.textContent = text[key];
            }
        });

        // Footer tagline
        root.querySelectorAll('[data-footer-tagline]').forEach((el) => {
            el.textContent = FOOTER_TAGLINE[lang] || FOOTER_TAGLINE['es'];
        });
    };

    // ─────────────────────────────────────────────
    // 3. Script re-initializers
    //    theme.js and lang-switcher.js wire up on DOMContentLoaded,
    //    but by the time we inject the header they've already run.
    //    Re-run their core logic after injection.
    // ─────────────────────────────────────────────

    const reinitTheme = () => {
        const STORAGE_KEY = 'm2-theme';
        const body = document.body;
        const getButtons = () => Array.from(document.querySelectorAll('[data-theme-switch]'));

        const applyTheme = (theme) => {
            body.setAttribute('data-theme', theme);
            getButtons().forEach((btn) => {
                btn.setAttribute(
                    'aria-pressed',
                    btn.getAttribute('data-theme-switch') === theme ? 'true' : 'false'
                );
            });
        };

        let saved;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { /* ignore */ }
        const currentTheme = saved || body.getAttribute('data-theme') || 'web';

        getButtons().forEach((btn) => {
            // Avoid double-binding by cloning
            const fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);
            fresh.addEventListener('click', () => {
                const theme = fresh.getAttribute('data-theme-switch');
                try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* ignore */ }
                applyTheme(theme);
            });
        });

        applyTheme(currentTheme);
    };

    const reinitLangSwitcher = () => {
        const LANGS = ['es', 'en'];

        const detectCurrentLang = (pathname) => {
            for (const lang of LANGS) {
                if (new RegExp(`(^|/)${lang}(/|$)`).test(pathname)) return lang;
            }
            return null;
        };

        const buildTargetPath = (pathname, fromLang, toLang) =>
            pathname.replace(
                new RegExp(`((?:^|/))(${fromLang})(/|$)`),
                `$1${toLang}$3`
            );

        const switchTo = (toLang) => {
            const { pathname } = window.location;
            const fromLang = detectCurrentLang(pathname);
            if (!fromLang) { window.location.href = `./${toLang}/`; return; }
            if (fromLang === toLang) return;

            const targetPath = buildTargetPath(pathname, fromLang, toLang);
            fetch(targetPath, { method: 'HEAD' })
                .then((res) => {
                    window.location.href = res.ok
                        ? targetPath
                        : pathname.replace(
                            new RegExp(`((?:^|/))(${fromLang})(/.*)?$`),
                            `$1${toLang}/`
                        );
                })
                .catch(() => { window.location.href = targetPath; });
        };

        const markActive = () => {
            const currentLang = detectCurrentLang(window.location.pathname);
            document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
                btn.setAttribute(
                    'aria-pressed',
                    btn.getAttribute('data-lang-switch') === currentLang ? 'true' : 'false'
                );
            });
        };

        document.querySelectorAll('[data-lang-switch]').forEach((btn) => {
            const fresh = btn.cloneNode(true);
            btn.parentNode.replaceChild(fresh, btn);
            fresh.addEventListener('click', () => switchTo(fresh.getAttribute('data-lang-switch')));
        });

        markActive();
    };

    // ─────────────────────────────────────────────
    // 4. Core loader
    // ─────────────────────────────────────────────

    const load = async () => {
        const prefix = computePrefix();
        const lang   = detectLang();
        const slots  = document.querySelectorAll('[data-include]');

        if (!slots.length) return;

        const fetches = Array.from(slots).map(async (slot) => {
            const name = slot.getAttribute('data-include');
            const url  = `${prefix}components/${name}.html`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`${res.status} ${url}`);
                const html = await res.text();

                // Use a temporary container to parse & resolve nav links
                const tmp = document.createElement('div');
                tmp.innerHTML = html;
                resolveNavLinks(tmp, prefix, lang);

                // Replace slot content
                slot.innerHTML = tmp.innerHTML;
            } catch (err) {
                console.warn(`[include-loader] Could not load component "${name}":`, err);
            }
        });

        await Promise.all(fetches);

        // Re-init scripts that depend on the injected DOM
        reinitTheme();
        reinitLangSwitcher();
    };

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
