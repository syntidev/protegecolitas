# SOP — Protege Colitas
> Procedimientos Operativos Estándar · v1.0

---

## 1. DEPLOY A PRODUCCIÓN

```bash
# Local — preparar y subir
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# VPS — aplicar cambios
ssh -i C:\Users\carbo\.ssh\id_ed25519 root@187.124.241.213
cd /var/www/protegecolitas
git pull
npm install        # solo si hay nuevas dependencias
npm run build
pm2 restart protegecolitas
pm2 save
```

**Verificar:** https://protegecolitas.org carga sin errores
**Logs:** `pm2 logs protegecolitas --lines 20`

---

## 2. MODERACIÓN DE REPORTES (admin)

**Flujo estándar:**
1. Entra a `admin.protegecolitas.org`
2. Sección "Pendientes" → revisa foto y datos
3. Si es válido → Aprobar → status cambia a "publicado"
4. Si es duplicado → Rechazar → status "descartado" + nota
5. Si necesita info → contactar por WhatsApp antes de aprobar

**Reglas de moderación:**
- Foto clara del animal → REQUERIDA para aprobar
- WhatsApp válido → REQUERIDO
- Zona específica → REQUERIDA (no aceptar "Caracas" solo)
- Contenido ofensivo → rechazar inmediatamente

---

## 3. ACTUALIZAR INSUMOS

1. Admin → sección "Necesidades"
2. Seleccionar item
3. Actualizar `cantidad_recibida`
4. Guardar → se refleja en tiempo real en el sitio

**Criterios de prioridad:**
- `crítico` → menos del 30% recibido
- `urgente` → entre 30% y 70%
- `cubierto` → 100% o más

---

## 4. PUBLICAR EN FEED DE NOTICIAS

**Tipos de nota:**
- `alerta` → necesidad urgente, rojo
- `rescate` → animal rescatado, azul
- `buenas` → mascota reunida, verde
- `info` → anuncio general, gris

**Proceso:**
1. Admin → Feed → Nueva nota
2. Seleccionar tipo
3. Título (máx 80 chars) + cuerpo (máx 500 chars)
4. Publicar → aparece al tope del feed

---

## 5. GESTIÓN DE VETERINARIOS

**Para aprobar un vet:**
- Verificar que el WhatsApp responde
- Confirmar zona de atención real
- Marcar como "verificado" en admin

**Para desactivar:**
- Cambiar status a "inactivo"
- No eliminar — mantener historial

---

## 6. BACKUP DE BASE DE DATOS

Supabase hace backup automático diario.
Para backup manual desde el dashboard:
1. Supabase → Settings → Database
2. Backups → Download

---

## 7. MONITOREO

**Verificar diariamente:**
```bash
pm2 status                        # proceso corriendo
pm2 logs protegecolitas --lines 5 # errores recientes
```

**Cloudflare Analytics:**
- dashboard.cloudflare.com → protegecolitas.org → Analytics
- Ver: visitas, países, dispositivos, errores 4xx/5xx

**Alertas críticas (actuar inmediato):**
- PM2 status = errored → `pm2 restart protegecolitas`
- Sitio caído → revisar nginx: `systemctl status nginx`
- DB error → revisar Supabase dashboard

---

## 8. AGREGAR MODERADOR

1. Supabase → tabla `moderadores`
2. Insert: nombre, email, rol='moderador', activo=true
3. Crear cuenta en Directus con ese email
4. Asignar rol "Moderador" en Directus

---

## 9. EMERGENCIA — SITIO CAÍDO

```bash
# 1. Verificar PM2
pm2 status
pm2 restart protegecolitas

# 2. Verificar Nginx
systemctl status nginx
systemctl restart nginx

# 3. Verificar puerto
curl http://localhost:4321

# 4. Ver logs de error
pm2 logs protegecolitas --err --lines 50
```

---

## 10. VARIABLES DE ENTORNO

Archivo `.env` en `/var/www/protegecolitas/.env`
**NUNCA subir al repo — está en .gitignore**

```
PUBLIC_SUPABASE_URL=https://ocggpvwoppniecdmeovp.supabase.co
PUBLIC_SUPABASE_ANON_KEY=[key]
```

Si se pierden las keys:
- Supabase Dashboard → Settings → API → Legacy anon key
