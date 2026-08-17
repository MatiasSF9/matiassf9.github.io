# IA.MD - Project Notes (Matías Fernández site)

Fecha de actualización: 2026-08-17

## Overview
Sitio estático multi-idioma (`/es` y `/en`) para Matías Fernández, publicado en GitHub Pages con dominio custom (`matiasrfernandez.com`). Construido con Jekyll + Liquid; header/footer se renderizan como Jekyll includes en tiempo de build (no inyección por JS).

## Arquitectura
- **Build**: Jekyll + Liquid templating, sin bundler/framework JS
- **Copy centralizada**: toda el texto de páginas vive en `_data/copy.json` y se inyecta en tiempo de build (no cliente)
- **Layout**: `_layouts/default.html` envuelve todas las páginas con `_includes/head.html`, `_includes/header.html`, content, `_includes/footer.html`
- **Índice.html**: redirección cliente-side a `/es/` o `/en/` basada en `navigator.language` (con fallback `<noscript>` a `/es/`)

## Estructura de páginas
- `index.html`: redirección al idioma
- `es/` y `en/`: contenido principal por idioma (home, about, contact, projects/, privacy/)
- `_data/copy.json`: texto centralizado de todas las páginas (títulos, meta descriptions, body)
- `_includes/head.html`, `_includes/header.html`, `_includes/footer.html`: componentes Jekyll compartidos (no client-side include-loader)
- `assets/css/style.css`: estilos globales
- `assets/images/`: imágenes del sitio

## Client-side scripts (`assets/js/`)
- `theme.js`: persiste tema web/apple/android a `localStorage`, toggled por botones `[data-theme-switch]`
- `lang-switcher.js`: maneja botones ES/EN (`[data-lang-switch]`) en cada página
- `cookie-consent.js`, `cookie-banner.js`, `ga4-consent-loader.js`: banner de consentimiento de cookies tipo EU (cookie gate para Google Analytics 4)
- `analytics.js`: delegated click-tracking que lee atributos `data-ga-event` y `data-ga-label` para eventos GA4
- `screenshots-carousel.js`: carrusel infinito/continuo para screenshots en página Dolar+ (respeta `prefers-reduced-motion`)

## Privacidad
- Web privacy:
  - `/es/privacy/`
  - `/en/privacy/`
- App privacy (Dolar+):
  - `/es/privacy/apps/dolarplus/`
  - `/en/privacy/apps/dolarplus/`

## SEO / metadata
- `_includes/head.html` genera `<title>`, meta description, canonical, hreflang links, OG, Twitter Cards desde `_data/copy.json` (no editar HTML)
- `sitemap.xml` con rutas principales incluyendo privacy web + app

## Dolar+ – screenshots
La sección “Interfaz / Interface and Experience” usa un carrusel infinito y continuo (sin interacción manual), con duplicado de items para loop. Respeta `prefers-reduced-motion`.

## Límites y trade-offs
- `index.html` hace redirección client-side por idioma (impacto SEO/UX si JS está deshabilitado; no hay alternativa en GitHub Pages sin CDN/edge function)
- Enlaces absolutos (`/en/...`, `/es/...`) requieren CNAME; cambiar a subpath sin dominio custom requeriría reescribir a paths relativos
- Accesibilidad: faltan estilos `:focus-visible` en algunos elementos y un “skip to content”
- Performance: algunas PNGs grandes; ideal migrar a WebP/AVIF + tamaños responsivos
