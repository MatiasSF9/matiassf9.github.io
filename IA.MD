# IA.MD - Findings del sitio Matías Fernández

Fecha de análisis: 2026-02-20

## Resumen rápido
Sitio estático multi-idioma (/es y /en) con redirección por idioma en `index.html`, header/footer inyectados vía JS, selector de tema (web/apple/android) y Google Analytics. SEO básico (OG, Twitter Cards, sitemap) ya está presente en las páginas internas.

## Hallazgos por área
### Cumplimiento / privacidad
- La política de privacidad afirma “No se utilizan SDKs de terceros para seguimiento o analítica”, pero todas las páginas cargan Google Analytics (`gtag.js`). Esto es inconsistente con lo declarado. (`es/privacy/index.html`, `en/privacy/index.html`, páginas `es/**` y `en/**`)
- No hay mecanismo de consentimiento/cookies. Si apuntás a EU/UK, puede ser obligatorio. (todas las páginas con GA)

### Navegación e i18n
- `index.html` redirige por JS + meta refresh a `/es/`. Sin JS, fuerza ES y no ofrece selector de idioma en la home. Además, las redirecciones client-side pueden afectar SEO. (`index.html`)
- Hay mezcla de enlaces absolutos (`/en/contact/#...`, `/en/privacy/`) y relativos. Si el sitio se publica bajo subpath (GitHub Pages sin CNAME), esos enlaces rompen. (ej: `en/index.html`, `en/projects/dolarplus/index.html`, equivalentes `es/**`)

### Dependencia de JS / resiliencia
- Header y footer se inyectan con `include-loader.js`. Si falla `fetch` o JS está deshabilitado, se pierde navegación y los selectores de idioma/tema. No hay fallback `<noscript>`. (`components/*.html`, `assets/js/include-loader.js`, páginas con `data-include`)
- `assets/js/lang-switcher.js` y `assets/js/slideshow.js` no están referenciados en `/es` o `/en` (código muerto / assets sin uso).

### Contenido / enlaces
- En la página de Dolar+ el link al App Store es placeholder (`https://apps.apple.com`) con TODO. (`es/projects/dolarplus/index.html`, `en/projects/dolarplus/index.html`)

### Accesibilidad
- Botones de idioma/tema no tienen estilos de foco visibles (`:focus-visible`). La navegación por teclado queda poco clara. (`assets/css/style.css`)
- No hay “skip to content”. Recomendable para navegación con teclado/lectores. (todas las páginas)

### Performance / assets
- PNGs grandes (ej. `assets/images/dolarplus-home.png` ~383KB, `assets/images/dolar-icon.png` ~204KB). Sería mejor WebP/AVIF + tamaños responsivos. (`assets/images/*`)

## Archivos relevantes
- `index.html` (redirige a /es o /en)
- `es/**` y `en/**` (páginas principales)
- `components/header.html`, `components/footer.html`
- `assets/css/style.css`
- `assets/js/include-loader.js`, `assets/js/theme.js`
- `assets/js/lang-switcher.js`, `assets/js/slideshow.js` (posibles sobrantes)
- `sitemap.xml`, `robots.txt`

## Riesgos prácticos
- Declaración de privacidad inconsistente con uso real de GA.
- Enlaces absolutos pueden fallar en subpaths.
- Navegación depende de JS (si falla, se pierde el header/footer).

## Recomendaciones prioritarias (orden sugerido)
1. Alinear la política de privacidad con el uso real de GA (y, si aplica, añadir consentimiento).
2. Reemplazar links placeholders de App Store por URLs reales.
3. Unificar enlaces a rutas relativas o generar rutas con prefijo para soportar subpaths.
4. Agregar fallback para header/footer (noscript) o prerender estático.
5. Eliminar JS no utilizado o integrarlo donde corresponda.
6. Agregar estilos `:focus-visible` y un “skip to content”.
7. Optimizar imágenes grandes (WebP/AVIF + tamaños responsivos).
