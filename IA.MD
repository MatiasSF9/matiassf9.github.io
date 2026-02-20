# IA.MD - Project Notes (Matías Fernández site)

Fecha de actualización: 2026-02-20

## Overview
Sitio estático multi-idioma (`/es` y `/en`) para Matías Fernández, publicado en GitHub Pages. Header/footer se inyectan por JS y hay selector de tema (web/apple/android).

## Estructura
- `index.html`: redirección al idioma.
- `es/` y `en/`: contenido principal por idioma.
- `components/header.html`, `components/footer.html`: navegación compartida (inyectada).
- `assets/css/style.css`: estilos globales.
- `assets/js/include-loader.js`: inyección de header/footer + nav links + reinit de theme/lang.
- `assets/js/theme.js`: persistencia de tema.
- `assets/js/screenshots-carousel.js`: carrusel continuo para screenshots en Dolar+.
- `assets/images/`: imágenes del sitio.

## Privacidad
- Web privacy:
  - `/es/privacy/`
  - `/en/privacy/`
- App privacy (Dolar+):
  - `/es/privacy/apps/dolarplus/`
  - `/en/privacy/apps/dolarplus/`

## SEO / metadata
- Canonical + OG + Twitter Cards en páginas internas.
- `sitemap.xml` con rutas principales, incluyendo privacy web + app.

## Dolar+ – screenshots
La sección “Interfaz / Interface and Experience” usa un carrusel infinito y continuo (sin interacción manual), con duplicado de items para loop. Respeta `prefers-reduced-motion` (se queda estático si el usuario lo pide).

## Pendientes / arquitectura
- Link de App Store para Dolar+ sigue siendo placeholder (`https://apps.apple.com`) en `/es/projects/dolarplus/` y `/en/projects/dolarplus/`.
- URL de privacidad usada en App Store / dentro de la app debe apuntar a `.../privacy/apps/dolarplus/` (fuera de este repo).
- No hay banner de consentimiento de cookies (relevante si se apunta a EU/UK).
- Header/footer dependen de JS (no hay fallback `noscript`).
- `index.html` hace redirección client-side por idioma (impacto SEO/UX si JS está deshabilitado).
- Enlaces absolutos (`/en/...`, `/es/...`) pueden romper si se publica bajo subpath sin CNAME.
- `assets/js/lang-switcher.js` y `assets/js/slideshow.js` parecen no estar referenciados (código muerto).
- Accesibilidad: faltan estilos `:focus-visible` y un “skip to content”.
- Performance: PNGs grandes; ideal migrar a WebP/AVIF + tamaños responsivos.
