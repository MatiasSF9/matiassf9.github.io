# IA.MD - Findings del sitio M2 Media

Fecha de análisis: 2026-02-06

## Resumen rápido
Sitio estático simple (HTML/CSS), sin JS. Contenido principal en `index.html` y una página de privacidad separada en `privacy.html`. Se detectan inconsistencias de contenido, enlaces y referencias a archivos inexistentes, además de oportunidades claras en accesibilidad, SEO y mantenimiento.

## Hallazgos por área
### Contenido y consistencia
- En `privacy.html` aparece el placeholder “Your Name” en el texto de privacidad. No coincide con la marca real. (`privacy.html`)
- El texto “We are a passionate group of people devoted to create great prod.” está truncado. (`index.html`)
- El footer indica `© 2023` y no se actualiza. (`index.html`)
- Hay dos políticas de privacidad: una sección en `index.html` y una página completa en `privacy.html`. El contenido no es idéntico (títulos, encabezado, textos y estructura). Esto genera divergencias futuras.

### Enlaces y recursos
- `privacy.html` referencia `app.css`, pero no existe en el repo. Esto deja la página sin estilos. (`privacy.html`)
- En `privacy.html` los links usan rutas absolutas (`/index.html`, `/privacy.html`). Si el sitio se publica bajo un subpath, esos enlaces fallan.
- Carpeta `javascript/` existe pero está vacía; sugiere trabajo incompleto o limpieza pendiente.

### Accesibilidad
- No hay landmark semántico `main` ni `aria`/`skip links` para navegación rápida. (Mejora de accesibilidad básica)
- Imágenes con `alt` genérico (“App Icon”, “Dolar + Preview”). Se puede describir mejor el contenido real para lectores de pantalla. (`index.html`)
- Tamaños tipográficos grandes sin ajuste responsivo específico en títulos; en pantallas pequeñas, el `h2` de 42px puede generar saltos visuales. (`css/style.css`)

### SEO y metadatos
- Falta `meta description` para index y privacy.
- No hay `favicon` declarado.
- No hay `og:` / `twitter:` meta tags para sharing.

### CSS y layout
- `box-sizing: border-box` solo está en `body`, no en todos los elementos. Esto puede producir layouts inconsistentes.
- Se combina `header` fixed + `nav` sticky con `top: 80px` y `section` con `margin-top: 80px` y `scroll-margin-top: 140px`. En resoluciones/zoom distintos, puede haber solapamientos o scroll incorrecto a anchors. (`css/style.css`)
- `.app-preview img` usa `max-width: 60%` sin contenedor definido; en desktop puede verse demasiado pequeño y en mobile puede comportarse de forma inesperada.

### Assets
- `assets/dolar-icon.png` y `assets/dolar-ios.png` no se usan en HTML/CSS actuales.
- `assets/dolar-icon-2.png` pesa ~455KB para un ícono 40x40; conviene optimizar o exportar versión pequeña.

## Archivos relevantes
- `index.html` (home)
- `privacy.html` (privacy page)
- `css/style.css` (estilos)
- `assets/` (imagenes)

## Riesgos prácticos
- La página de privacidad puede estar sin estilos en producción por `app.css` faltante.
- Inconsistencias de copy entre páginas pueden afectar confianza y cumplimiento.
- Navegación por anchors puede fallar con header fixed en móviles.

## Recomendaciones prioritarias (orden sugerido)
1. Unificar y corregir la política de privacidad (en página única o shared snippet) y reemplazar “Your Name”.
2. Corregir el stylesheet de `privacy.html` para usar `css/style.css` o crear `app.css`.
3. Revisar enlaces absolutos y migrarlos a relativos.
4. Ajustar layout de header/nav/anchors para evitar solapamientos.
5. Optimizar imágenes y eliminar assets no usados.
6. Completar el copy truncado y actualizar el año del footer.

