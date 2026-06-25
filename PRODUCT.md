# Product

## Register

brand

## Users

Venezolanos afectados por el terremoto del 24 jun 2026 — dueños buscando mascotas perdidas, ciudadanos que encontraron animales, veterinarios voluntarios, donantes de insumos. Acceso primario desde teléfonos móviles, en condiciones de estrés y conectividad intermitente.

## Product Purpose

Plataforma de emergencia para reunir mascotas perdidas con sus dueños tras el terremoto en Venezuela. Coordina reportes de mascotas, donaciones de insumos, voluntarios veterinarios y noticias de la emergencia. Éxito = mascotas reunidas con sus familias.

## Brand Personality

Cálido, venezolano, esperanzador. Urgente sin ser alarmista. Verbos de acción: Reporta, Encuentra, Ayuda, Reúne.

## Anti-references

- Sitios de emergencia genéricos con fondo oscuro y rojo dominante
- Interfaces frías, clínicas o gubernamentales
- Páginas alarmistas con "ALERTA MÁXIMA" y tipografía gritona
- Diseño SaaS con métricas y dashboards
- Cualquier patrón que sugiera normalidad o frivolidad

## Design Principles

1. **Esperanza visible** — cada pantalla debe transmitir que la reunión es posible, no solo urgencia
2. **Fricción mínima** — quien reporta está bajo estrés; el camino al formulario debe ser de 2 toques
3. **Cálido, no frío** — identidad visual con amarillo y marrón, nunca fondo oscuro ni rojo dominante
4. **Mobile-first absoluto** — base 375px, touch targets 44px mínimo, imágenes lazy-loaded
5. **Cero fachadas** — si un botón existe, tiene acción real detrás

## Accessibility & Inclusion

WCAG AA mínimo. Español venezolano sin tecnicismos. Touch targets ≥44px. `aria-label` en controles interactivos. `role="alert"` en mensajes de error. `loading="lazy"` en imágenes. `prefers-reduced-motion` respetado.
