# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static bilingual (`es`/`en`) personal site for Matías Fernández, built with Jekyll and deployed as static HTML/CSS/JS to GitHub Pages (custom domain `matiasrfernandez.com`, see `CNAME`). There is no JS framework, bundler, or package.json — Jekyll/Liquid is the only build step, and the shipped output is plain HTML/CSS/JS.

## Commands

```bash
# Install gems (first time / after Gemfile changes)
bundle install --path vendor/bundle

# Build the static site into _site/
bundle exec jekyll build

# Build + rebuild on file changes, served at http://localhost:4000
bundle exec jekyll serve

# Serve an already-built _site/ output directly
cd _site && python3 -m http.server 4174
```

There is no test suite, linter, or CI config in this repo — validate changes by building and manually checking pages in a browser.

## Architecture: centralized page authoring (Jekyll layout + copy.json)

Every page under `es/` and `en/` — home, `about`, `contact`, `projects/` (hub and `dolarplus`), and `privacy/` (site and `privacy/apps/dolarplus`) — follows one pattern:

- Each page is a Liquid template with front matter (`layout: default`, `lang`, `copy_group`, optionally `copy_key`, `translation_path`, `permalink`, `extra_js`).
- `_layouts/default.html` wraps the page: includes `_includes/head.html`, `_includes/header.html`, `{{ content }}`, `_includes/footer.html`.
- All copy (titles, meta description, body text) is pulled at **build time** from `_data/copy.json`, keyed as `site.data.copy[page.lang][copy_group]` (or `...projects[copy_key]` for individual project pages, e.g. `dolarplus`). Shared strings (nav labels, footer tagline, shared emails) live under `copy.shared` / `copy[lang].shared`.
- `_includes/head.html` derives `<title>`, meta description, canonical/hreflang links, and OG/Twitter tags from `page_copy.meta` — so adding/editing a page's SEO metadata means editing `copy.json`, not the HTML `<head>`.
- To edit visible copy on any page: edit `_data/copy.json`, not the HTML template.
- To add a new page: add a copy block to `_data/copy.json`, create the `.html` file with the appropriate front matter, and reference `copy.xxx` fields with Liquid.

There is no more client-side include-injection track — `assets/js/include-loader.js` and the `components/` directory were removed once the last static pages (the projects hub and both privacy pages) were migrated onto this pattern; header/footer are always Jekyll includes rendered at build time.

`index.html` at the site root is a minimal client-side + `<noscript>` redirect to `/es/` or `/en/` based on `navigator.language` (English is the default fallback, matching the site's `x-default` hreflang convention); it does not go through the Jekyll layout (see "Known inconsistencies" below).

## Shared client-side scripts (`assets/js/`)

- `theme.js` — persists a `web`/`apple`/`android` theme choice (`data-theme` on `<body>`) to `localStorage` (`m2-theme`); toggled via `[data-theme-switch]` buttons in the header.
- `lang-switcher.js` — handles the ES/EN toggle buttons (`[data-lang-switch]`) on every page.
- `cookie-consent.js`, `cookie-banner.js`, `ga4-consent-loader.js` — EU-style cookie consent gate for Google Analytics 4; `ga4-consent-loader.js` loads GA4 tracking after consent is granted.
- `analytics.js` — delegated click-tracking listener that reads `data-ga-event` and `data-ga-label` attributes on elements to send GA4 events.
- `screenshots-carousel.js` — infinite/continuous screenshot carousel used only on the Dolar+ project page (loaded via that page's `extra_js` front matter); respects `prefers-reduced-motion`.

## Known inconsistencies (from IA.MD notes)

These are accepted trade-offs of static GitHub Pages hosting, not bugs with a clean fix:

- `index.html`'s language redirect is client-side (with a `<noscript>` fallback to `/en/`); GitHub Pages serves no server-side logic, so there's no way to redirect by `Accept-Language` without adding external infrastructure (e.g. a CDN/edge function). This has SEO/UX implications if JS is disabled.
- Internal links use Liquid's `{{ '/en/xxx/' | relative_url }}` filter rather than hardcoded paths, so they stay correct under any `baseurl` (currently `""`, i.e. served at the domain root via `CNAME`).
