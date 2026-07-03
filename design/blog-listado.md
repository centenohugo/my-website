# Blog — Especificación de diseño

Diseño de la sección **Escritos** (blog) de la web personal.
Variante elegida: **1a — Flotante** (imagen + texto sin marco).

Estilo: minimalista, editorial, fondo papel cálido con mucho aire.

---

## 1. Principios

- Papel cálido ligeramente sepia como base, nunca blanco puro.
- Máximo espacio en blanco, casi sin bordes ni contenedores.
- La imagen manda: thumbnail limpio 3:2, sin sombra ni marco.
- Tipografía serif editorial + detalle monoespaciado para metadatos.
- Sin interacción al pasar el ratón (todo estático).
- Grid de 3 columnas en escritorio; scroll infinito que carga más al llegar abajo.

---

## 2. Color

Definido en `app/theme.ts` (`siteColors`), compartido por todo el sitio — el blog lo reexporta como `blogColors` en `app/blog/theme.ts`.

| Rol | Valor | Uso |
|---|---|---|
| Papel (fondo) | `#ece5d7` | Fondo general de la página |
| Papel elevado | `#f4efe5` | Contenedor/lienzo del blog |
| Texto principal | `#262019` | Títulos |
| Texto título card | `#282219` | Título de cada artículo |
| Texto apagado | `#877d6c` | Subtítulos |
| Texto secundario | `#857b6b` | Descripción de cabecera |
| Fecha (mono) | `#a2977f` | Metadato de fecha |
| Etiqueta placeholder | `rgba(30,24,14,0.26)` | Categoría sobre el thumbnail |
| Cargando (mono) | `#a89d87` | Indicador scroll infinito |
| Fin de archivo (mono) | `#c0b6a0` | Indicador scroll infinito |

### Tonos de los thumbnails (placeholder)
Paleta apagada y armónica (croma bajo ≈ 0.03) que rota por artículo. En producción se sustituyen por tus fotos.

```
oklch(0.83 0.028 66)    /* arena  */
oklch(0.81 0.026 150)   /* salvia */
oklch(0.80 0.030 250)   /* azul polvo */
oklch(0.83 0.032 36)    /* arcilla */
oklch(0.82 0.020 96)    /* verde apagado */
oklch(0.79 0.028 300)   /* malva */
oklch(0.84 0.022 120)   /* oliva claro */
oklch(0.80 0.030 20)    /* terracota */
```

---

## 3. Tipografía

Dos familias (Google Fonts):

- **Newsreader** (serif) — títulos, subtítulos, texto editorial.
- **JetBrains Mono** (monoespaciada) — fechas, categorías y micro-etiquetas.

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,380;0,6..72,440;0,6..72,500;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Escala

| Elemento | Familia | Tamaño | Peso | Interlineado | Otros |
|---|---|---|---|---|---|
| Título de página "Escritos" | Newsreader | 32px | 440 | — | letter-spacing −0.015em |
| Descripción de cabecera | Newsreader | 15px | 400 | — | color apagado |
| Fecha (metadato) | JetBrains Mono | 10.5px | 400 | — | UPPERCASE, tracking 0.14em |
| Título de artículo | Newsreader | 19px | 440 | 1.28 | letter-spacing −0.01em, `text-wrap: pretty` |
| Subtítulo de artículo | Newsreader | 14px | 400 | 1.5 | color apagado, `text-wrap: pretty` |
| Etiqueta sobre thumbnail | JetBrains Mono | 10px | 400 | — | UPPERCASE, tracking 0.22em |

---

## 4. Layout

### Grid
- 3 columnas: `grid-template-columns: repeat(3, minmax(0, 1fr))`.
- Separación entre cards (gap): **38px** (cómodo) · **26px** (compacto).
- Cabecera "Escritos" + descripción arriba, con ~44px de aire superior.
- Padding lateral del contenido: 44px.

### Card (variante 1a — sin marco)
Columna vertical, sin contenedor ni borde:

```
[ thumbnail 3:2 ]
  gap 13px
[ fecha (mono) ]        ← opcional
  gap 6px
[ título (serif) ]
  gap 6px
[ subtítulo (serif apagado) ]
```

- El bloque de texto usa `display:flex; flex-direction:column; gap:6px`.
- Toda la card es un enlace (`<a>`) con `color: inherit` y sin subrayado.

### Thumbnail
- Proporción fija **3:2** (`aspect-ratio: 3/2`), ancho 100%.
- `border-radius: 3px`, `overflow: hidden`.
- Placeholder = color tonal + trama diagonal muy sutil + categoría centrada tenue:

```css
/* trama sobre el color tonal */
background-image: repeating-linear-gradient(135deg,
  rgba(0,0,0,0.035) 0 1px, transparent 1px 10px);
```

---

## 5. Comportamiento — scroll infinito

- Se cargan **9** artículos al inicio.
- Al desplazar y quedar a **≤ 520px** del final, se añaden **6** más.
- Tope del ejemplo: 45 artículos, luego "Fin del archivo".
- Indicador inferior (mono, mayúsculas): `Cargando más ·` → `Fin del archivo`.

Lógica de detección:
```js
if (el.scrollTop + el.clientHeight >= el.scrollHeight - 520) cargarMas();
```

---

## 6. Datos de un artículo

```json
{
  "title": "El valor de lo que no se ve",
  "subtitle": "Notas sobre el diseño invisible y por qué el buen trabajo desaparece.",
  "cat": "Ensayo",
  "date": "JUL 2026",
  "image": "/img/no-se-ve.jpg"
}
```

Metadatos mostrados: solo **fecha** (además de título y subtítulo). La categoría aparece únicamente como etiqueta tenue sobre el placeholder mientras no haya foto.

---

## 7. Opciones configurables

- **Columnas:** 2 · 3 · 4
- **Densidad:** Cómodo · Compacto (cambia el gap)
- **Mostrar fecha:** sí / no

---

## 8. Notas de implementación

- Sustituir los placeholders tonales por imágenes reales 3:2 (recorte centrado, `object-fit: cover`).
- Mantener el fondo papel; evitar blanco puro y sombras marcadas.
- Sin estados hover: el diseño se apoya en la retícula y el espacio, no en el movimiento.
- Responsive implementado: `grid-cols-1` (móvil) → `sm:grid-cols-2` (tablet) → `lg:grid-cols-3` (escritorio), conservando la proporción 3:2.

---

## 9. Implementación (componentes)

- `app/blog/page.tsx` — Server Component: consulta `posts` (Postgres vía `sql`), renderiza cabecera y `BlogGrid` con los primeros `initialCount` (9) artículos.
- `app/blog/BlogGrid.tsx` — Client Component: grid + scroll infinito. Escucha `scroll` en `window` y pide más vía `GET /api/posts?limit&offset` al acercarse a `thresholdPx` del final.
- `app/blog/PostCard.tsx` — Card individual (variante 1a sin marco). Usa `paletteColorForSlug`/`categoryForSlug` (hash determinista del slug) para asignar color de placeholder y etiqueta de categoría de forma estable por artículo.
- `app/blog/theme.ts` — Reexporta `blogColors`/`blogFonts` desde `app/theme.ts` (colores y tipografía compartidos con el resto del sitio) y añade lo específico del blog: `thumbnailPalette`, `blogTypography`, `blogLayout`, `blogScrollBehavior`, categorías placeholder.
- No existen aún controles de UI para las opciones configurables (columnas, densidad, mostrar fecha) — están fijadas en `theme.ts`/`BlogGrid.tsx` (3 columnas, densidad cómoda, fecha visible).
