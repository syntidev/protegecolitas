# ROADMAP — Protege Colitas
> Versión 1.0 · Emergencia Terremoto Venezuela · Jun 2026

---

## FASE 0 — Base ✅ COMPLETADA
> Objetivo: Sitio vivo en producción

- [x] Dominio protegecolitas.org registrado
- [x] Cloudflare configurado (DNS + SSL)
- [x] VPS Hostinger Ubuntu 24.04
- [x] Astro 5 SSR instalado y corriendo con PM2
- [x] Nginx como proxy inverso
- [x] Supabase conectado (4 tablas base)
- [x] Repo GitHub syntidev/protegecolitas
- [x] Hero con contadores en tiempo real
- [x] Ribbon de emergencia activa

---

## FASE 1 — Reportes públicos 🔴 URGENTE
> Objetivo: Cualquier persona puede reportar desde el móvil
> Tiempo estimado: 1-2 días

- [ ] `/reportar` — formulario inteligente por tipo
  - [ ] Selector de tipo (perdido / encontrado / vet / insumo / voluntario)
  - [ ] Campos dinámicos según tipo
  - [ ] Upload de fotos (min 1, max 3, compresión automática)
  - [ ] Validación WhatsApp venezolano
  - [ ] Rate limit por IP (1 cada 5 min)
  - [ ] Status inicial: "pendiente" (no visible hasta moderar)
  - [ ] Confirmación visual al enviar

- [ ] `/mascotas` — grid público
  - [ ] Filtro por especie, zona, status
  - [ ] Búsqueda full-text (nombre, color, descripción)
  - [ ] Solo muestra status "publicado"

- [ ] `/mascota/[id]` — ficha individual
  - [ ] Fotos en carrusel
  - [ ] Botón WhatsApp directo con mensaje pre-llenado
  - [ ] Botón compartir en redes
  - [ ] Estado visual claro

---

## FASE 2 — Secciones de apoyo 🟡 ESTA SEMANA
> Objetivo: Información completa para la comunidad
> Tiempo estimado: 2-3 días

- [ ] `/insumos` — dashboard de necesidades
  - [ ] Cards con barras de progreso
  - [ ] Colores por prioridad (crítico / urgente / cubierto)
  - [ ] Botón "Quiero donar esto" → WhatsApp
  - [ ] Actualizable desde admin

- [ ] `/veterinarios` — directorio de vets voluntarios
  - [ ] Cards con zona, servicios, horario
  - [ ] Filtro por zona
  - [ ] Botón WhatsApp directo
  - [ ] Formulario para registrarse como vet

- [ ] `/acopio` — centro de acopio
  - [ ] Dirección, horarios, mapa estático
  - [ ] Lista de qué traer
  - [ ] Formulario voluntarios
  - [ ] Botón WhatsApp

- [ ] `/noticias` — feed de actualizaciones
  - [ ] Cards por tipo (alerta, rescate, buenas noticias, anuncio)
  - [ ] Ordenado por fecha desc
  - [ ] Compartible

---

## FASE 3 — Panel Admin 🟡 ESTA SEMANA
> Objetivo: Tu amiga gestiona todo sin código
> Tiempo estimado: 2-3 días

- [ ] Instalar Directus en `admin.protegecolitas.org`
- [ ] Conectar Directus a Supabase (misma DB)
- [ ] Configurar colecciones en Directus
- [ ] Roles: Super Admin, Moderador
- [ ] Flujo de moderación:
  - [ ] Ver reportes pendientes
  - [ ] Aprobar / rechazar con un clic
  - [ ] Botón WhatsApp directo desde la ficha
  - [ ] Cambiar status de mascota
  - [ ] Agregar nota interna
- [ ] Bitácora de acciones por moderador
- [ ] Actualizar insumos (cantidades)
- [ ] Publicar en feed de noticias

---

## FASE 4 — Match automático 🟢 PRÓXIMA SEMANA
> Objetivo: Sistema detecta posibles coincidencias
> Tiempo estimado: 2 días

- [ ] Algoritmo de match: zona + especie + color
- [ ] Banner "Posible match detectado" en ficha
- [ ] Notificación al admin cuando hay match
- [ ] Historial de matches sugeridos

---

## FASE 5 — Analytics y difusión 🟢 PRÓXIMA SEMANA
> Tiempo estimado: 1 día

- [ ] Cloudflare Analytics (ya disponible, activar)
- [ ] QR del sitio para imprimir
- [ ] Meta tags para compartir en WhatsApp/Instagram
- [ ] Contador de días sin resolver (urgencia visual)
- [ ] Página de agradecimiento a donantes/voluntarios

---

## MÉTRICAS DE ÉXITO
```
Semana 1:  50+ reportes publicados
Semana 2:  10+ mascotas reunidas
Semana 2:  3+ veterinarios registrados
Mes 1:     500+ visitas únicas
```

---

## DECISIONES TÉCNICAS TOMADAS
| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| Astro SSR | Next.js | Más liviano, mejor para VPS |
| Supabase | MySQL propio | Realtime, auth, storage incluido |
| Directus admin | Panel custom | Velocidad, ya tiene UI lista |
| Cloudflare | SSL propio | Gratuito, protección DDoS |
| dotenv manual | import.meta.env | Astro 5 SSR no lee .env automático |
