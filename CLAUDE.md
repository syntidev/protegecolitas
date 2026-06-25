# CLAUDE.md — Protege Colitas
# Instrucciones maestras para Claude Code y todos los agentes
# ⚠️ LEER COMPLETO ANTES DE CUALQUIER ACCIÓN
# Versión: 1.0 | Junio 2026 | Carlos Bolívar — SYNTIdev

---

## GOBERNANZA — LEER PRIMERO, SIEMPRE

### Modos de operación

| MODO      | Palabra clave | Qué hacer                          | PROHIBIDO                              |
|-----------|---------------|------------------------------------|----------------------------------------|
| CONSULTA  | [CONSULTA]    | Responder en ≤5 líneas, sin código | Abrir archivos, escribir código        |
| DISEÑO    | [DISEÑO]      | Proponer arquitectura              | Implementar, tocar archivos            |
| EJECUCIÓN | [EJECUTA]     | Implementar lo acordado            | Inferir cambios fuera del scope        |
| REVISIÓN  | [REVISA]      | Auditar código existente           | Proponer refactors no solicitados      |
| DEBUG     | [DEBUG]       | Diagnosticar SOLO el error         | Tocar código fuera del scope           |

**Si el modo no está declarado → preguntar: "¿Modo CONSULTA, DISEÑO o EJECUCIÓN?" y PARAR.**
**NUNCA asumir modo EJECUCIÓN por defecto.**

### Protocolo anti-deriva (irrompible)

Antes de CADA respuesta, verificar internamente:
1. ¿Me pidieron código? → Solo entonces escribo código
2. ¿El scope es claro y acotado? → Si no, preguntar en UNA línea y parar
3. ¿Voy a modificar algo fuera de lo pedido? → PARAR
4. ¿Encontré un bug fuera del scope? → Reportar en 1 línea, NO corregir
5. ¿Mis criterios de éxito son verificables por Carlos sin saber el código? → Si no, reescribirlos

**Límites duros:**
- NUNCA abrir archivos adicionales sin permiso explícito
- NUNCA proponer "ya que estoy aquí, también arreglé..."
- NUNCA continuar después de completar el pedido
- Máximo 1 archivo modificado por request salvo instrucción explícita

---

## PRINCIPIOS KARPATHY — IRROMPIBLES

### Principio 1 — Pensar antes de codificar
- Declarar supuestos explícitamente antes de implementar
- Si hay múltiples interpretaciones → presentarlas, no elegir en silencio
- Si algo no está claro → DETENER y preguntar

### Principio 2 — Simplicidad primero
- Código mínimo que resuelve el problema
- Sin features más allá de lo pedido
- Sin abstracciones para código de un solo uso

### Principio 3 — Cambios quirúrgicos
- Tocar solo lo necesario
- No "mejorar" código adyacente
- No refactorizar cosas que no están rotas

### Principio 4 — Ejecución orientada a objetivos
- Definir criterios de éxito verificables antes de escribir código
- Si Carlos da un criterio débil ("que funcione") → pedir uno verificable

### Principio 5 — Cero fachadas
- PROHIBIDO: botones sin acción implementada
- PROHIBIDO: endpoints con mock data
- PROHIBIDO: UI con valores hardcodeados presentados como reales
- Si algo no está completo → DECIRLO antes de commitear

---

## PROYECTO

**Protege Colitas** — Plataforma de emergencia para reunir mascotas perdidas
tras el terremoto en Venezuela (24 jun 2026, 7.1–7.5).
**Dominio:** protegecolitas.org
**Local:** `C:\laragon\www\protegecolitas\`
**VPS:** root@187.124.241.213 | Puerto: 4321
**Repo:** github.com/syntidev/protegecolitas | Rama: main
**Deploy:** PM2 + Nginx + Cloudflare SSL

### Documentación del proyecto (leer en este orden)
```
1. CLAUDE.md    → gobernanza, reglas irrompibles
2. ROADMAP.md   → fases, prioridades, métricas de éxito
3. SOP.md       → procedimientos operativos, deploy, moderación
4. AGENTS.md    → protocolo multi-agente
```

---

## STACK SELLADO — NO NEGOCIABLE

```
Astro 5.x SSR     → Framework principal (Node adapter, modo standalone)
TypeScript 5.x    → Strict mode
CSS vanilla       → Variables CSS en global.css, sin Tailwind
Supabase          → Postgres + Auth + Storage + Realtime
dotenv            → Carga manual de .env (import.meta.env no funciona en SSR)
Directus          → Panel admin en admin.protegecolitas.org
PM2               → Process manager en VPS
Nginx             → Proxy inverso
Cloudflare        → DNS + SSL Full
```

---

## PALETA DE COLORES — IDENTIDAD PROTEGE COLITAS

```css
--amarillo:  #F5C107   /* primario — fondo logo, acentos */
--marron:    #6B3A2A   /* texto principal, headers */
--blanco:    #FFFFFF   /* fondos de cards */
--gris-bg:   #F9F6F0   /* fondo general cálido */
--gris-txt:  #6B7280   /* texto secundario */
--rojo:      #DC2626   /* alertas y urgencia SOLO — usar con moderación */
--verde:     #16A34A   /* confirmación, reunidos */
--azul:      #2563EB   /* links, zona, acciones */
--border:    #E5DDD0   /* bordes suaves */
```

**Regla de color:**
- Rojo: SOLO para estado "perdido" y errores críticos
- Amarillo: acento principal, CTAs primarios
- Marrón: headers, texto de peso
- NO usar fondo oscuro — la identidad es cálida y esperanzadora

---

## TIPOGRAFÍA

- **Display**: Syne 800 — títulos, headlines, contadores
- **Body**: Inter 400/600/700 — todo lo demás

---

## LENGUAJE B2H (Brand to Human)

- Directo, cálido, venezolano
- Sin tecnicismos ni lenguaje de emergencia exagerado
- Verbos de acción: "Reporta", "Encuentra", "Ayuda", "Reúne"
- Urgente pero esperanzador — NUNCA alarmista

| Correcto                        | Incorrecto                    |
|---------------------------------|-------------------------------|
| "¿La has visto?"                | "ALERTA MÁXIMA"               |
| "Ayúdanos a reunirlos"          | "EMERGENCIA CRÍTICA"          |
| "Cada colita tiene familia"     | "ANIMAL EN PELIGRO"           |
| "Reporta en segundos"           | "ACTÚA YA O MUERE"            |

---

## ESTRUCTURA DE CARPETAS

```
/var/www/protegecolitas/     ← raíz en VPS
C:\laragon\www\protegecolitas\ ← raíz local

src/
  components/
    Ribbon.astro       ← Banner de emergencia
    PetCard.astro      ← Card de mascota
    NeedBar.astro      ← Barra de progreso insumos
    FeedItem.astro     ← Item del feed de noticias
  layouts/
    Base.astro         ← Layout principal
  lib/
    supabase.ts        ← Cliente Supabase con dotenv
  pages/
    index.astro        ← Landing + hero + contadores
    reportar.astro     ← Formulario inteligente por tipo
    mascotas.astro     ← Grid público con búsqueda
    mascota/[id].astro ← Ficha individual
    insumos.astro      ← Dashboard de necesidades
    veterinarios.astro ← Directorio vets voluntarios
    acopio.astro       ← Info centro de acopio
    noticias.astro     ← Feed de actualizaciones
    admin/
      index.astro      ← Panel protegido (Directus)
  styles/
    global.css         ← Variables CSS, reset, base
public/
  logo.png
.env                   ← NUNCA en repo
```

---

## TABLAS SUPABASE

```sql
mascotas (
  id uuid PK,
  nombre text,
  especie text NOT NULL,         -- Perro, Gato, Ave, Otro
  descripcion text,
  color text,
  tamanio text,                  -- pequeño, mediano, grande
  zona text NOT NULL,
  status text DEFAULT 'pendiente', -- pendiente, publicado, en_contacto, reunido, descartado
  foto_url text,                 -- Supabase Storage
  whatsapp text,
  created_at timestamptz,
  moderado_por text,
  moderado_at timestamptz,
  log text
)

necesidades (
  id uuid PK,
  item text NOT NULL,
  cantidad_requerida int NOT NULL,
  cantidad_recibida int DEFAULT 0,
  prioridad text DEFAULT 'urgente', -- critico, urgente, cubierto
  updated_at timestamptz
)

vets (
  id uuid PK,
  nombre text NOT NULL,
  zona text NOT NULL,
  servicios text,
  horario text,
  whatsapp text,
  gratuito boolean DEFAULT true,
  created_at timestamptz
)

feed (
  id uuid PK,
  titulo text NOT NULL,
  cuerpo text NOT NULL,
  tipo text DEFAULT 'info',      -- alerta, rescate, buenas, info
  published_at timestamptz
)

reportes_log (
  id uuid PK,
  mascota_id uuid FK → mascotas,
  accion text,                   -- aprobado, rechazado, contactado, reunido
  usuario text,
  nota text,
  created_at timestamptz
)

moderadores (
  id uuid PK,
  nombre text,
  email text,
  rol text,                      -- super_admin, moderador
  activo boolean DEFAULT true
)
```

---

## STATUS DE MASCOTAS

```
pendiente   → recién reportado, NO visible al público
publicado   → visible al público
en_contacto → alguien está en comunicación activa
reunido     → caso resuelto ✓
descartado  → duplicado o falso reporte
```

---

## REGLAS CRÍTICAS — NUNCA VIOLAR

### Variables de entorno
- NUNCA hardcodear keys en código fuente
- Usar `dotenv` + `process.env` — NO `import.meta.env` (no funciona en Astro 5 SSR)
- `.env` en `.gitignore` siempre

### Mobile-first
- Breakpoint base: 375px
- Touch targets mínimo 44px
- Fotos lazy-loaded siempre

### Fotos
- Mínimo 1, máximo 3 por reporte
- Comprimir a máx 900px / 500KB antes de subir
- Storage: Supabase Storage

### Validaciones
- WhatsApp venezolano: `/^04[0-9]{2}[0-9]{7}$/`
- Rate limit público: 1 reporte por IP cada 5 minutos
- Sin rate limit para moderadores autenticados
- Zona: mínimo 5 caracteres (no aceptar solo "Caracas")

### Commits
- En español con prefijos: `feat:`, `fix:`, `chore:`, `docs:`
- Bloque estándar obligatorio (ver AGENTS.md)

---

## COMANDOS CLAVE

```bash
# Desarrollo local
npm run dev

# Verificación antes de commit
npm run build   # debe compilar sin errores

# Deploy VPS
ssh -i C:\Users\carbo\.ssh\id_ed25519 root@187.124.241.213
cd /var/www/protegecolitas
git pull
npm install     # solo si hay nuevas dependencias
npm run build
pm2 restart protegecolitas
pm2 save

# Logs
pm2 logs protegecolitas --lines 50
pm2 logs protegecolitas --err --lines 20

# Verificar que está vivo
curl http://localhost:4321
```

---

## CHECKLIST PRE-COMMIT — OBLIGATORIO

- [ ] Build limpio: `npm run build` sin errores
- [ ] Cero keys hardcodeadas en código
- [ ] Mobile-first verificado en DevTools (375px)
- [ ] Cero fachadas: todos los botones tienen acción real
- [ ] Validación WhatsApp implementada
- [ ] `.env` NO incluido en el commit
- [ ] Commit con bloque estándar completo

---

## LO QUE NUNCA SE TOCA

- Otros proyectos en el VPS (activopos, sportbar, etc.)
- `.env` de otros proyectos
- Configuración de Nginx de otros dominios
- `git stash` en VPS — riesgo de perder trabajo
