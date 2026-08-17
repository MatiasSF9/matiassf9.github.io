# Code and Site Audit — m2-media-site

Date: 2026-08-17
Branch audited: `add-open-social-ops-ai-sdlc-projects` (commit `7160e4c`)
Scope: Jekyll templates, `_data/copy.json`, CSS, JS, build output in `_site/`, repository hygiene.
Method: static read of all source files, plus inspection of the last build output in `_site/`.
This is a report only. No source file was changed.

**Note on the build.** I could not run `bundle exec jekyll build` during this audit.
`vendor/bundle` holds native gems compiled for Ruby 2.6, but the machine has Ruby 3.0.2,
so `ffi` fails to load (see finding I-1). I audited the committed `_site/` output instead,
which is newer than every source file and therefore current.

---

## Summary

| Category | Count | Highest severity |
|---|---|---|
| Inconsistencies | 8 | High |
| Bugs | 6 | High |
| Overengineering / dead code | 7 | Medium |
| Incomplete features | 8 | High |

**Top 5 items to do first**

| # | Item | Why |
|---|---|---|
| 1 | B-1 Google Fonts loads before consent | Legal risk. It contradicts your own cookie banner. |
| 2 | B-2 Empty `<p class="hero-subtitle">` on the EN home page | Visible defect in production. |
| 3 | N-1 No focus styles | The site is not usable by keyboard. |
| 4 | O-1 / N-8 11 MB of unused images and no lazy loading | Page weight and repository size. |
| 5 | I-8 Internal docs published to the public site | `CLAUDE.md` and `IA.MD` are live on your domain. |

---

## 1. Inconsistencies

### I-1 — The `Gemfile` pins gems that do not build on current Ruby — HIGH
`Gemfile:4` pins `ffi ~> 1.15.5`. That version has no binary for Ruby 3.x on ARM Linux.
Your `vendor/bundle` was built for Ruby 2.6.0, so `jekyll build` fails with
`cannot load such file -- 3.0/ffi_c`.

The build works only on the exact machine that created `vendor/bundle`.
**Fix:** remove the `ffi` pin (Jekyll pulls the correct version itself), delete `vendor/bundle`,
and run `bundle install` again. Commit the new `Gemfile.lock`.

### I-2 — The ES home page is missing an element that the EN page has — MEDIUM
`en/index.html:13` renders `<p class="hero-subtitle">`. `es/index.html` has no equivalent line.
The two language templates must stay identical except for `lang` and the App Store badge.
See also B-2: the EN element is empty anyway.

### I-3 — Internal links mix three styles — MEDIUM
| Style | Example |
|---|---|
| Root-absolute | `en/about/index.html:74` → `/en/contact/#architecture` |
| Page-relative | `en/index.html:16` → `contact/#architecture` |
| Parent-relative | `en/index.html:43` → `../assets/images/dolarplus-home.png` |

All three work today, but they break under different conditions, so a future change breaks
only some of them. `CLAUDE.md` states that internal links are root-absolute. That is not true.
**Fix:** choose one style. With Jekyll available, `{{ '/en/contact/' | relative_url }}` is the
correct one — it stays right under any `baseurl`.

### I-4 — Scripts load in two different ways — LOW
`_includes/head.html:26` loads `theme.js` with `defer` in the `<head>`.
`_layouts/default.html:11` loads `lang-switcher.js` as a blocking script at the end of `<body>`.
Both patterns work; having both is confusing and one is slower.

### I-5 — `IA.MD` describes a site that no longer exists — MEDIUM
`IA.MD` still says header and footer are injected by JS, lists `include-loader.js` and
`components/`, and states "No hay banner de consentimiento de cookies". All of that is wrong now.
It also lists `lang-switcher.js` as dead code, which it is not.
**Fix:** delete `IA.MD` or rewrite it. Right now it actively misleads.

### I-6 — `CLAUDE.md` documents files that are not used — MEDIUM
`CLAUDE.md:46` describes `ga4-loader.js` as part of the consent chain. No page loads it (see O-2).
`CLAUDE.md` does not mention `slideshow.js` at all, although the file exists (see O-3).

### I-7 — The privacy policy does not match the shipped behaviour — HIGH
`copy.json` → `[lang].privacy.cookies.body` tells the visitor to "use tracking blockers or
browser settings" if they do not want analytics. The site has had a real accept/reject banner
since commit `018e264`. The policy also never mentions Google Fonts (a third-party request,
see B-1) or the `localStorage` keys the site writes (`ds_cookie_consent_v1`, `m2-theme`).

### I-8 — Internal documents are published to the live site — MEDIUM
`_site/` contains `CLAUDE.md`, `IA.MD` and `README.MD`, so they are served at
`matiasrfernandez.com/CLAUDE.md` and so on. `robots.txt` allows all crawlers.
**Fix:** add to `_config.yml`:
```yaml
exclude: [CLAUDE.md, IA.MD, README.MD, Gemfile, Gemfile.lock, vendor, _pr-assets]
```

---

## 2. Bugs

### B-1 — Google Fonts loads before cookie consent — HIGH
`assets/css/style.css:1-2` contains two `@import url('https://fonts.googleapis.com/...')` calls.
These run as soon as the stylesheet parses, on every page, before the banner appears and
regardless of what the visitor chooses. They send the visitor IP address to Google.

This defeats the purpose of the consent gate and contradicts the privacy policy.
It is also the German court case that made self-hosted fonts standard practice in the EU.

**Fix:** download the font files into `assets/fonts/` and declare them with `@font-face`.
This also fixes the performance problem below.

### B-2 — The EN home page renders an empty paragraph — HIGH (visible)
`en/index.html:13` renders `{{ copy.hero.subtitle }}`. That key does not exist in `copy.json`
in either language. Liquid renders a missing key as an empty string, so the built page contains:

```html
<!-- _site/en/index.html:85 -->
<p class="hero-subtitle"></p>
```

An empty element that still takes vertical margin. **Fix:** add `hero.subtitle` to both
languages in `copy.json`, or delete the line from `en/index.html`.

Root cause worth noting: Liquid fails silently on typos. A missing key is invisible until
you look at the output. Consider adding a build check that greps `_site` for `><\/p>`.

### B-3 — Two `@import` calls block the first paint — MEDIUM
CSS `@import` is the slowest way to load a font. The browser must download `style.css`,
parse it, then start a new request for each `@import`, then a third for the font files.
That is three serial round-trips before any text appears. Self-hosting (B-1) removes all three.

### B-4 — The root page declares the wrong language — LOW
`index.html:2` is hardcoded `<html lang="es">`, but it sends most visitors to `/en/`, and
`index.html:26` shows the English text "Redirecting…". The `<noscript>` fallback
(`index.html:22`) always goes to `/es/`, so a no-JS English visitor lands on Spanish.

### B-5 — The root page loads the consent stack it will never use — LOW
`index.html:8-10` loads `cookie-consent.js`, `cookie-banner.js` and `ga4-consent-loader.js`.
The inline script at `index.html:12` redirects immediately, so these three requests are
started and then thrown away. On a slow connection the banner can flash before the redirect.
Also, `cookie-banner.js` `detectLang()` returns `'en'` for path `/`, so if the flash happens
a Spanish visitor sees an English banner for a moment.

### B-6 — `gtag` is called from 14 inline `onclick` attributes — MEDIUM
14 links across 8 files call `gtag('event', ...)` inline, for example
`en/index.html:104`, `en/about/index.html:74`, `en/contact/index.html:37`.

Problems:
- If `ga4-consent-loader.js` is blocked by an extension, `window.gtag` is undefined and each
  click throws a `ReferenceError` into the console.
- The pattern cannot work under a Content-Security-Policy without `unsafe-inline`.
- The same event name is duplicated in 6 places, so renaming one is easy to get wrong.

**Fix:** one delegated listener in a script file, driven by a `data-ga-event` attribute.

---

## 3. Overengineering and dead code

### O-1 — 11.3 MB of unreferenced images are committed — MEDIUM
| File | Size |
|---|---|
| `assets/images/dolar/promotional/preview1.png` | 3.8 MB |
| `assets/images/dolar/promotional/preview2.png` | 3.6 MB |
| `assets/images/dolar/promotional/preview3.png` | 3.5 MB |
| `assets/images/dolar-icon.png` | 200 KB |
| `assets/images/preview-dolar.png` | 64 KB |

No HTML, CSS, JS or JSON file refers to any of them. They are the assets of the removed
slideshow (O-3). They are copied into `_site/` on every build and served by GitHub Pages.

### O-2 — `ga4-loader.js` is a dead duplicate — MEDIUM
`assets/js/ga4-loader.js` (1179 bytes) is a near copy of `ga4-consent-loader.js`. It is loaded
by no page. Both define `GA_ID = 'G-4P6GBFYSSK'` and both attach a `consent:changed` listener.
If it were ever loaded, GA4 would be configured twice.
**Fix:** delete the file and remove it from `CLAUDE.md:46`.

### O-3 — `slideshow.js` is dead, with dead CSS behind it — MEDIUM
`assets/js/slideshow.js` (3623 bytes) implements a full lightbox: keyboard navigation, focus
restore, wrap-around index, ARIA state. No page loads it and no page contains
`[data-slideshow-modal]`, so it returns on line 3 and does nothing.

It brings 11 dead CSS rules with it: `.slideshow-modal`, `.slideshow-dialog`, `.slideshow-body`,
`.slideshow-close`, `.slideshow-footer`, `.slideshow-header`, `.slideshow-image`,
`.slideshow-nav`, `.slideshow-title`, plus the site's only `:focus-visible` rule
(`assets/css/style.css:738`), which targets `.card[data-slideshow]` — markup that no longer exists.

### O-4 — 38 CSS class rules are never used — LOW
Out of 153 class selectors in `style.css`, 38 match no markup. Beyond the slideshow set:
`glass-card`, `glass-content`, `card`, `cards`, `card-header`, `card-link`, `card-tags`,
`hero-actions`, `hero-stats`, `hero-visual`, `about-panel`, `focus-list`, `section-head`,
`eyebrow`, `pill`, `stat`, `split`, `lead`, `ghost`, `placeholder`, `btn`.
These are leftovers from an earlier design. The file is 1926 lines; roughly a quarter is unreachable.

### O-5 — The language switcher does an HTTP request it does not need — MEDIUM
`assets/js/lang-switcher.js:47` sends a `HEAD` request to check that the mirror page exists
before navigating, with a fallback path and a `catch` branch.

At build time Jekyll already knows the answer: every page declares `translation_path` in its
front matter, and `head.html` already emits it as `hreflang` links. The switcher could simply
read `document.querySelector('link[hreflang="es"]').href`. That removes the fetch, the latency
before navigation, and roughly 30 lines of regex path-rewriting.

### O-6 — PR screenshots are committed twice — LOW
`_pr-assets/` (3.1 MB) and `.github/pr-assets/` (3.1 MB) contain byte-identical files.
`_pr-assets/` is also served to the public because nothing excludes it. Delete one copy;
review-only images do not belong in the deployed repository at all.

### O-7 — Two stale git worktrees — LOW
`git worktree list` reports `claude/bold-sutherland` and `claude/eloquent-wing` as `prunable`,
both pointing at a path (`/Users/matiasfernandez/GIT/M2Media/...`) that differs from the
current repo location. They still hold the old `components/` and `include-loader.js` files.
**Fix:** `git worktree prune`, then delete the merged branches.

---

## 4. Incomplete features

### N-1 — The site has no focus styles — HIGH
`style.css` contains exactly one `:focus` rule, and it targets dead markup (O-3).
Every interactive element — the nav links, the ES/EN buttons, the three theme buttons,
the accept and reject buttons in the cookie banner — falls back to the browser default outline,
which is nearly invisible on your background colours.

Keyboard users cannot tell where they are. This is a WCAG 2.4.7 failure.
Your own `IA.MD` listed this in "Pendientes" in February and it is still open.

### N-2 — There is no skip link — MEDIUM
`_layouts/default.html` has no "skip to content" link. Every page makes a keyboard user tab
through 3 nav links, 2 language buttons and 3 theme buttons before reaching the content.
`en/index.html:9` already has the `id="top"` anchor for it. WCAG 2.4.1.

### N-3 — `<main>` is used on 3 pages out of 7 — MEDIUM
| Has `<main>` | No `<main>` |
|---|---|
| home, projects hub, dolarplus | about, contact, privacy, privacy/apps/dolarplus |

Screen readers use `<main>` for the "jump to content" command, so it works inconsistently
across the site. The clean fix is to move `<main>` into `_layouts/default.html` around
`{{ content }}` and remove it from the three pages.

### N-4 — The theme switcher does almost nothing — MEDIUM
The three themes (`web`, `apple`, `android`) only redefine colour and radius tokens
(`style.css:25-62`). All three are light. The differences are a few hex values and a border
radius. `apple` asks for `SF Pro`, which only exists on Apple devices; `android` asks for
`Roboto`, which is imported globally, so it is already active in all three themes.

So on a Mac the three buttons produce a barely visible change, and there is no dark mode
at all (`prefers-color-scheme` appears zero times in the CSS). Either finish the themes so
they are worth the three buttons in the header, or drop the switcher.

### N-5 — Two of the three project entries have no page — MEDIUM
`copy.json` → `projectsHub.sections`: "Open Social Ops" (in progress) and "ai-sdlc"
(exploration) have `title`, `description` and `status`, but no `link`. The template
(`en/projects/index.html:60,78`) only renders a link for the `live` section, so the two cards
are dead ends. That is a reasonable placeholder — but the `<div class="project-card">` is not
focusable and has no state to tell a screen-reader user that there is nothing to click.

### N-6 — `sitemap.xml` is maintained by hand and is stale — MEDIUM
`sitemap.xml` is a static file with `<lastmod>2026-02-20</lastmod>` on all 14 URLs. The site
has changed since (`74630e8`, `c615bbd`). It also omits the root URL `/`, and it carries no
`xhtml:link` hreflang alternates although the site is bilingual.
**Fix:** add `jekyll-sitemap` to the `Gemfile` and `plugins:` in `_config.yml`
(currently `plugins: []`), then delete the manual file.

### N-7 — There is no CI and no build check — MEDIUM
`.github/` holds only PR screenshots. There is no workflow. Nothing checks that the site still
builds, that no page renders an empty tag (B-2), that ES and EN stay in parity (I-2), or that
`copy.json` is valid JSON. A 20-line GitHub Actions job running `jekyll build` would have
caught B-2 and I-1.

### N-8 — Images are unoptimised and eagerly loaded — MEDIUM
`assets/images/` is 17 MB, all PNG, zero WebP or AVIF. The Dolar+ page alone loads about 4.9 MB
of screenshots (`Widget.png` is 2.4 MB). None of the 9 `<img>` tags on the home and Dolar+ pages
has `loading="lazy"`, `width` or `height`, so every image is fetched at once and every image
causes layout shift while it loads.

Note that `screenshots-carousel.js:33` clones each image, so the carousel shows 10 images.
The clones reuse the same URL, so there is no extra download — but 10 large decoded bitmaps
stay in memory on mobile.

Also missing: no favicon is declared anywhere in `_includes/head.html`.

---

## Things that are correct

To be fair to the codebase, these were checked and are in good order:

- **No broken links.** All 100+ internal `href` and `src` values in `_site/` resolve.
- **ES/EN copy parity is exact.** Every key path in `copy.json` under `es` exists under `en`,
  and the reverse. Only the missing `hero.subtitle` template line breaks the pattern.
- **No unused copy keys.** Every leaf in `copy.json` is rendered by a template.
- **Canonical, hreflang, OG and Twitter tags are correct** on all 14 pages, including the
  `x-default` → `/en/` rule.
- **The templates are genuinely DRY.** The move to `copy.json` plus Jekyll includes
  (`74630e8`) removed real duplication. Every page but the home page is a byte-for-byte
  match between languages after the `lang` swap.
- **The consent gate logic is correct.** GA4 is denied by default, the script only loads
  after `accepted`, and `loadGtagScriptOnce` guards against a double insert.

---

## Suggested order of work

| Phase | Items | Effort |
|---|---|---|
| 1. Legal and visible | B-1, B-2, I-7, I-8 | ~2 h |
| 2. Accessibility | N-1, N-2, N-3 | ~3 h |
| 3. Delete dead code | O-1, O-2, O-3, O-4, O-6, O-7 | ~1 h |
| 4. Build health | I-1, N-6, N-7 | ~2 h |
| 5. Consistency | I-2, I-3, I-4, I-5, I-6, O-5, B-6 | ~3 h |
| 6. Performance | B-3, N-8 | ~3 h |
| 7. Decide | N-4 (finish or drop themes), N-5 (project pages) | — |
