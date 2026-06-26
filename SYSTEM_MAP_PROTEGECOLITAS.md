# SYSTEM_MAP — Protege Colitas
**Generado:** 2026-06-25 | **Modo:** DIAGNÓSTICO SOLO — sin cambios al código

---

## 1. ÁRBOL DE ARCHIVOS

```
src/
├── components/
│   ├── Welcome.astro              ← LEGACY (init Astro, no se usa)
│   ├── Ribbon.astro               ← LEGACY (no se usa, también en src/src/)
│   ├── PetCard.astro              ← LEGACY (no se usa, también en src/src/)
│   ├── home/
│   │   ├── BannerEmergencia.astro
│   │   ├── GlobalStats.astro
│   │   ├── HelpCenters.astro
│   │   ├── HopeStories.astro
│   │   ├── LiveFeed.astro
│   │   ├── NewsSection.astro
│   │   ├── PetsFoundCarousel.astro
│   │   ├── PetsLostCarousel.astro
│   │   ├── QuickActions.astro
│   │   ├── ShareCTA.astro
│   │   ├── UrgentNeeds.astro
│   │   └── VetsList.astro
│   ├── layout/
│   │   ├── Footer.astro
│   │   └── Header.astro
│   └── ui/
│       ├── Badge.astro
│       └── Button.astro
├── layouts/
│   ├── Base.astro                 ← ACTIVO en páginas internas (TIENE Tailwind CDN + Phosphor CDN)
│   ├── BaseLayout.astro           ← ACTIVO en index.astro (sin CDN, SVG inline)
│   └── Layout.astro               ← LEGACY (init Astro, no se usa)
├── lib/
│   └── supabase.ts                ← supabase (anon) + supabaseAdmin (service role)
├── pages/
│   ├── index.astro                ← landing
│   ├── reportar.astro             ← formulario (NO mascotas.astro — ver §9)
│   ├── insumos.astro
│   ├── veterinarios.astro
│   ├── noticias.astro
│   ├── acopio.astro
│   ├── admin/
│   │   └── index.astro            ← panel sin layout base
│   └── api/
│       ├── banners.ts
│       ├── mascotas.ts
│       ├── reportar.ts
│       ├── vets.ts
│       └── voluntarios.ts
├── src/                           ← ⚠️ DIRECTORIO DUPLICADO (ver §9 #3)
│   ├── components/ (Ribbon, PetCard)
│   ├── layouts/    (Base.astro)
│   ├── lib/        (supabase.ts)
│   ├── pages/      (index.astro)
│   └── styles/     (global.css)
└── styles/
    └── global.css                 ← activo
```

---

## 2. CONTENIDO DE ARCHIVOS CRÍTICOS

### src/lib/supabase.ts
```ts
export const supabase      = createClient(URL, ANON_KEY)
export const supabaseAdmin = createClient(URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
```
dotenv cargado explícitamente vía `dotenv.config()`.

### src/layouts/Base.astro (usado por 5 páginas internas)
- Carga `global.css` (Inter via @import)
- **⚠️ Aún tiene `<script src="https://cdn.tailwindcss.com"></script>`**
- **⚠️ Aún tiene `<script src="https://unpkg.com/@phosphor-icons/web@2.1.1/...">`**
- Bottom nav con `<i class="ph-bold ph-house">` (Phosphor CDN)
- NO carga Syne ni Nunito

### src/layouts/BaseLayout.astro (usado solo por index.astro)
- Carga Inter + Nunito vía Google Fonts `<link>`
- Bottom nav con SVG inline (sin CDN)
- NO carga Syne
- Colors hardcodeados en `<style>`: `#E8E1D6`, `#7A4A24`, `#9CA3AF`, `#C96A1B` en vez de CSS vars

### src/pages/api/reportar.ts
- Imports: `{ supabaseAdmin }` de lib
- INSERT en `mascotas` con status='pendiente'
- validateModerador usa `supabaseAdmin.auth.getUser(token)`
- Rate limit: 1 reporte por IP cada 5 min (en memoria — se resetea con restart)
- **⚠️ `contacto_nombre` llega en body pero NO se guarda en DB**
- **⚠️ Fotos NO se reciben ni procesan (ver §9 #16)**

### src/pages/api/mascotas.ts
- Imports: `{ supabaseAdmin }` de lib
- GET público, filtra `status='publicado'`
- Paginación de 20 items por página
- Filtros: especie, zona (ilike), q (OR text search)

### src/pages/api/banners.ts
- **⚠️ Crea `db` local con `createClient(...)` — no usa `supabaseAdmin` del lib**
- Validación HMAC de `admin_session` cookie
- INSERT en `banners`

### src/pages/api/vets.ts
- Imports: `{ supabaseAdmin }` de lib (post fix anterior)
- POST, INSERT en `vets`
- **⚠️ Endpoint público con service role — RLS bypasseado (ver §9 #18)**

### src/pages/api/voluntarios.ts
- Imports: `{ supabaseAdmin }` de lib (post fix anterior)
- POST, INSERT en `feed` con tipo='voluntario'
- **⚠️ Endpoint público con service role — RLS bypasseado (ver §9 #18)**

---

## 3. VARIABLES DE ENTORNO

```env
PUBLIC_SUPABASE_URL=***
PUBLIC_SUPABASE_ANON_KEY=***
ADMIN_PASSWORD=***
SUPABASE_SERVICE_ROLE_KEY=***
```
4 variables. No hay `SUPABASE_JWT_SECRET` ni `DIRECTUS_*` definidas.

---

## 4. NAVEGACIÓN — mapa por página

| Página       | Layout         | Back → /  | Bottom nav       | Syne cargada | Notas                         |
|-------------|----------------|-----------|------------------|--------------|-------------------------------|
| /            | BaseLayout.astro | ❌ (es home) | ✅ SVG inline    | ❌           | Header + Footer propios       |
| /reportar    | Base.astro     | ✅ `href="/"` | ✅ Phosphor CDN | ❌           | 3 pantallas JS (no SSR fetch) |
| /insumos     | Base.astro     | ✅ `href="/"` | ✅ Phosphor CDN | ❌           | SSR fetch necesidades         |
| /veterinarios| Base.astro     | ✅ `href="/"` | ✅ Phosphor CDN | ❌           | SSR fetch vets + form         |
| /noticias    | Base.astro     | ✅ `href="/"` | ✅ Phosphor CDN | ❌           | SSR fetch feed (todos tipos)  |
| /acopio      | Base.astro     | ✅ `href="/"` | ✅ Phosphor CDN | ❌           | Estático — sin fetch          |
| /admin       | ninguno        | ❌           | ❌              | ❌           | HTML puro, HMAC auth          |
| /mascotas    | —              | —           | —               | —            | **❌ PÁGINA NO EXISTE (404)** |
| /mascota/[id]| —              | —           | —               | —            | **❌ PÁGINA NO EXISTE (404)** |

---

## 5. ENDPOINTS DE API

| Archivo           | Método | Cliente       | Tabla(s)   | Retorna                        | Auth              |
|------------------|--------|---------------|------------|-------------------------------|-------------------|
| mascotas.ts      | GET    | supabaseAdmin | mascotas   | `{ mascotas, page, pageSize }` | Ninguna (público) |
| reportar.ts      | POST   | supabaseAdmin | mascotas   | `{ id, message }`              | Rate limit por IP |
| vets.ts          | POST   | supabaseAdmin | vets       | `{ id, message }`              | Ninguna (público) |
| voluntarios.ts   | POST   | supabaseAdmin | feed       | `{ id }`                       | Ninguna (público) |
| banners.ts       | POST   | db local (¹)  | banners    | `{ ok, error }`                | HMAC cookie       |

(¹) `banners.ts` crea su propio `createClient` en lugar de importar `supabaseAdmin`.

---

## 6. CONEXIONES FRONTEND → BACKEND

| Página/Componente     | Fetch a          | Método | Maneja error | Notas                                              |
|----------------------|------------------|--------|--------------|----------------------------------------------------|
| reportar.astro (JS)  | /api/reportar    | POST   | ✅ try/catch  | Payload: texto solo — fotos NO se envían           |
| veterinarios.astro (JS) | /api/vets    | POST   | ✅ try/catch  | Formulario registro vet                            |
| acopio.astro (JS)    | /api/voluntarios | POST   | ✅ try/catch  | Formulario voluntarios                             |
| admin/index.astro (JS) | /admin         | POST   | ✅ try/catch  | Moderación via FormData                            |
| admin/index.astro (JS) | /api/banners  | — (²)  | —            | ¿Formulario banner llama directo a /admin no /api/banners? |
| insumos.astro        | —                | SSR    | ❌ sin catch  | `await supabase.from('necesidades')` — fallo silencioso |
| veterinarios.astro   | —                | SSR    | ❌ sin catch  | `await supabase.from('vets')` — fallo silencioso   |
| noticias.astro       | —                | SSR    | ❌ sin catch  | `await supabase.from('feed')` — fallo silencioso   |
| BannerEmergencia.astro | —              | SSR    | ✅ try/catch  | Fallo silencioso explícito                         |
| index.astro (componentes home) | —    | SSR    | ⚠️ varía      | Cada componente home hace su propio fetch          |

(²) El formulario de banner en admin/index.astro usa `action=banner` via POST a `/admin`, NO a `/api/banners`.
El endpoint `/api/banners.ts` existe pero no se llama desde el admin. Duplicación de lógica.

---

## 7. ESTADO DE LA DB — queries por archivo

| Archivo               | Operación | Tabla        | Filtros                                    |
|----------------------|-----------|--------------|-------------------------------------------|
| insumos.astro         | SELECT    | necesidades  | ORDER BY prioridad ASC                     |
| veterinarios.astro    | SELECT    | vets         | ORDER BY created_at DESC                   |
| noticias.astro        | SELECT    | feed         | ORDER BY published_at DESC (todos los tipos) |
| BannerEmergencia.astro | SELECT   | banners      | activo=true, ORDER BY created_at DESC LIMIT 1 |
| admin/index.astro     | SELECT×6  | mascotas×4, necesidades, vets | status pendiente/publicado/reunido, count |
| api/mascotas.ts       | SELECT    | mascotas     | status=publicado, paginado, filtros opcionales |
| api/reportar.ts       | INSERT    | mascotas     | status='pendiente'                         |
| api/vets.ts           | INSERT    | vets         | gratuito=true hardcoded                    |
| api/voluntarios.ts    | INSERT    | feed         | tipo='voluntario'                          |
| api/banners.ts        | INSERT    | banners      | activo según checkbox                      |
| admin/index.astro     | UPDATE×2  | mascotas     | status → publicado / descartado + moderado_at |
| admin/index.astro     | UPDATE    | necesidades  | cantidad_recibida                          |
| admin/index.astro     | INSERT    | feed         | tipo, titulo, cuerpo                       |
| admin/index.astro     | INSERT    | banners      | titulo, descripcion, link, imagen_url, activo |

**Tablas referenciadas en código:** mascotas, necesidades, vets, feed, banners, moderadores
**Tablas en CLAUDE.md schema:** mascotas, necesidades, vets, feed, reportes_log, moderadores
**Tabla `reportes_log`:** definida en schema, no se usa en ningún archivo de código.
**Tabla `banners`:** no hay confirmación de que exista en Supabase (SQL pendiente de ejecución manual).

---

## 8. DIAGNÓSTICO DE FLUJO

```
1. Usuario entra a protegecolitas.org → landing carga
   ✅ index.astro existe, BaseLayout.astro funcional, componentes home hacen SSR fetch

2. Usuario va a /reportar → formulario visible
   ✅ reportar.astro existe, Base.astro lo renderiza
   ⚠️ Base.astro carga Tailwind CDN + Phosphor CDN (latencia extra, posible falla offline)

3. Usuario envía formulario → INSERT en mascotas
   ✅ POST /api/reportar → supabaseAdmin INSERT funciona (fix aplicado)
   ❌ Fotos se comprimen en browser pero NUNCA se envían al API ni se suben a Storage
   ⚠️ contacto_nombre llega al API pero no se persiste en DB

4. Rita entra a /admin → ve pendientes
   ✅ /admin/index.astro existe, HMAC cookie auth funcional
   ✅ Query SELECT mascotas WHERE status='pendiente'

5. Rita aprueba → status cambia a publicado
   ✅ POST /admin action=aprobar → supabaseAdmin UPDATE funcional (fix aplicado)

6. /mascotas muestra la mascota aprobada
   ❌ src/pages/mascotas.astro NO EXISTE → 404
   ✅ El endpoint GET /api/mascotas.ts sí existe y funciona
   ❌ Ninguna página pública consume /api/mascotas

7. /mascota/[id] abre la ficha individual
   ❌ src/pages/mascota/[id].astro NO EXISTE → 404
```

**Resumen del flujo:** Pasos 1–5 funcionales. Paso 6–7 completamente ausentes.
El flujo completo de publicación nunca llega al usuario final.

---

## 9. DEUDA TÉCNICA DETECTADA

1. **`mascotas.astro` NO EXISTE** — /mascotas da 404; el listado público de mascotas no está implementado
2. **`mascota/[id].astro` NO EXISTE** — /mascota/[id] da 404; la ficha individual no está implementada
3. **`src/src/` — directorio duplicado anidado** — 6 archivos: supabase.ts, global.css, Base.astro, Ribbon.astro, PetCard.astro, index.astro; artefacto de deploy erróneo o git
4. **`Base.astro` aún tiene Tailwind CDN + Phosphor CDN** — afecta /reportar, /insumos, /veterinarios, /noticias, /acopio; la migración CDN→vanilla se hizo solo en BaseLayout.astro
5. **Syne font nunca se carga en ningún layout** — todos los componentes la referencian vía `font-family: 'Syne', sans-serif` pero ningún `<head>` la incluye; el browser cae back a sans-serif
6. **Dos layouts activos con estilos divergentes** — BaseLayout.astro (index) vs Base.astro (resto); inconsistencia en bottom nav, fonts, colores, variables CSS
7. **Fotos NO se envían al backend** — el formulario de reportar comprime imágenes en canvas, las muestra en preview, pero el payload JSON que se envía a /api/reportar no incluye ninguna foto; no hay upload a Supabase Storage
8. **`contacto_nombre` se recopila en form pero no se persiste en DB** — el campo no está en el schema de mascotas ni en el INSERT de api/reportar.ts
9. **WA hardcodeado con número viejo en `reportar.astro` (screen 3)**: `584242042786` — debería ser `584142494136` o `584222494136`
10. **WA hardcodeado con número viejo en `insumos.astro`**: `584242042786` — mismo problema
11. **`api/banners.ts` crea `db` local** — no usa el `supabaseAdmin` centralizado del lib; duplica lógica de autenticación y credenciales
12. **Tabla `banners` puede no existir** — el SQL de CREATE TABLE + RLS policy fue generado pero marcado como "ejecutar manualmente"; sin confirmación de ejecución
13. **Tabla `reportes_log` definida en schema pero jamás usada** — ningún endpoint registra acciones de moderación en este log
14. **`noticias.astro` muestra registros tipo='voluntario'** — los voluntarios que se registran aparecen en el feed de noticias públicas (tipo='voluntario' va a tabla feed)
15. **SSR fetches en insumos/veterinarios/noticias sin manejo de error** — si Supabase falla o RLS bloquea, la página renderiza silenciosamente vacía sin mensaje al usuario
16. **`GET /api/mascotas` existe pero ninguna página lo consume** — endpoint funcional sin consumidor
17. **`BaseLayout.astro` tiene colores hardcodeados** — `#E8E1D6`, `#7A4A24`, `#9CA3AF`, `#C96A1B` en `<style>` en lugar de usar las CSS variables canónicas
18. **`vets.ts` y `voluntarios.ts` usan service role en endpoints públicos** — RLS bypasseado; flaggeado por security review como HIGH (ver nota §5)
19. **Rate limit de reportar está en memoria (Map)** — se resetea en cada restart de PM2; no persiste entre deploys
20. **`admin/index.astro` sin `<body>` con fonts cargadas** — la página admin no carga Google Fonts explícitamente; Inter/Nunito provienen de BaseLayout solo si index.astro fue visitado antes (cache browser)
21. **`src/components/Welcome.astro`, `Layout.astro`** — archivos del init de Astro, no usados, generan confusión
22. **`favicon.svg`** referenciado en BaseLayout.astro pero puede no existir en `/public/`

---

*Este archivo es solo lectura diagnóstica. No contiene cambios de código.*
*Replicar en VPS con `git pull` después del próximo deploy.*
