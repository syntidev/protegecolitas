# AGENTS.md — Protege Colitas
# Orquestación de agentes autónomos
# Versión: 1.0 | Junio 2026 | Carlos Bolívar — SYNTIdev

---

## PROYECTO

Protege Colitas — Plataforma de emergencia para mascotas perdidas.
Stack: Astro 5 SSR + TypeScript + CSS vanilla + Supabase + Directus
Local: `C:\laragon\www\protegecolitas\`
VPS: root@187.124.241.213 | protegecolitas.org | Puerto 4321

---

## LEER SIEMPRE PRIMERO (en este orden, sin saltarse ninguno)

1. `CLAUDE.md`   → gobernanza, stack sellado, Principios Karpathy, reglas irrompibles
2. `ROADMAP.md`  → fases activas, prioridades, métricas de éxito
3. `SOP.md`      → procedimientos de deploy, moderación, monitoreo
4. `AGENTS.md`   → este archivo, protocolo multi-agente

**Si no has leído los 4 archivos → cualquier acción que tomes es potencialmente destructiva.**

---

## ROLES DE AGENTES

| Agente | Rol        | Qué hace                                              | Qué NO puede hacer                         |
|--------|------------|-------------------------------------------------------|--------------------------------------------|
| CLI-A  | Backend    | APIs Astro, lógica Supabase, validaciones, storage    | Tocar CSS, componentes de presentación     |
| CLI-B  | Frontend   | Componentes Astro, CSS variables, animaciones, mobile | Tocar lógica de negocio, queries Supabase  |
| CLI-C  | Calidad    | Auditoría de seguridad, code review — SOLO reporta    | Corregir P1/P2/P3, proponer refactors      |
| CLI-D  | Features   | Páginas nuevas, formularios, integraciones Directus   | Actuar sin que CLI-A/B hayan completado    |

**CLI-C corrige P0 únicamente (datos expuestos, bypass de moderación). Todo lo demás lo documenta.**

---

## FLUJO DE TRABAJO — 5 PASOS, NINGUNO SALTABLE

```
1. Carlos describe la tarea con criterios de éxito verificables
         ↓
2. El agente declara supuestos y lee los docs relevantes
         ↓
3. El agente declara el plan en pasos con verificación por paso
         ↓
4. Carlos aprueba el plan → el agente ejecuta
         ↓
5. El agente verifica cada criterio y reporta resultado real
         ↓
6. Carlos aprueba → el agente commitea con bloque estándar
```

**Saltarse el paso 2 o el paso 5 está prohibido.**

---

## SKILLS OBLIGATORIOS POR CLI

```
CLI-A: /code-review + /security-guidance + /software-architecture
CLI-B: /impeccable craft + /frontend-design + /ui-ux-pro-max
CLI-C: /code-review + /security-guidance
CLI-D: /impeccable craft + /frontend-design
```

---

## PROTOCOLO KARPATHY POR AGENTE

### Antes de escribir código (todos los agentes)

```
## Supuestos que estoy haciendo
- [Supuesto 1]: [base de por qué lo asumo]
- [Supuesto 2]: [base de por qué lo asumo]

## Archivos que voy a tocar
- [archivo] → [qué voy a cambiar y por qué]

## Plan de ejecución
1. [Paso] → verifico con: [check concreto]
2. [Paso] → verifico con: [check concreto]

## Criterios de éxito
- [Criterio 1]: [cómo se verifica sin abrir el código]
- [Criterio 2]: [cómo se verifica sin abrir el código]
```

### Después de ejecutar (todos los agentes)

```
## Verificación de criterios
- [Criterio 1]: ✅ / ❌ [resultado real, no inferido]
- [Criterio 2]: ✅ / ❌ [resultado real, no inferido]

## Build status
npm run build → [OK / error]

## Anomalías fuera de scope detectadas
- [1 línea por anomalía — reportar, NO corregir]
```

---

## PROTOCOLO DE SCOPE

Cada prompt de agente debe comenzar con:
```
# CLI-X — [SCOPE]
# Fase: N | Fecha: YYYY-MM-DD
# Skills: /skill1 + /skill2
# Archivos a tocar: [lista]
# Archivos prohibidos: [lista]
```

---

## SEÑALES DE ALERTA — PARAR Y REPORTAR A CARLOS

- **Fachada detectada:** botón sin acción, formulario que no envía, UI con datos falsos
- **Key expuesta:** cualquier key de Supabase hardcodeada en código
- **Sin validación WhatsApp:** formulario que acepta cualquier número
- **Sin rate limit:** endpoint público sin protección de spam
- **Mascota publicada sin moderar:** status 'publicado' sin pasar por moderación
- **CLI-B invadiendo scope de CLI-A** o viceversa
- **Agente proponiendo ejecutar sin declarar plan** primero

---

## BLOQUE DE COMMIT ESTÁNDAR (obligatorio, sin excepciones)

```bash
git add .
git commit -m "tipo(scope): descripción concisa

- Modificado: [archivo] → [qué cambió exactamente]
- Creado: [archivo] → [propósito]
- Verificado: [qué check confirma que funciona]
- Pendiente: [si hay algo sin resolver]

Agente: CLI-X | Fase: N | Fecha: YYYY-MM-DD"
git push origin main
git log --oneline -3
```

**NUNCA hacer commit de código que no compiló.**
**NUNCA hacer commit en VPS — solo local, luego pull en VPS.**
**NUNCA `git stash` en VPS.**

---

## ESTADO DE DEUDA TÉCNICA

| ID     | Severidad | Descripción                                        | Agente | Fase |
|--------|-----------|----------------------------------------------------|--------|------|
| DT-001 | P1        | `import.meta.env` no funciona — usar dotenv        | CLI-A  | 1    |
| DT-002 | P2        | Supabase Storage no configurado para fotos         | CLI-A  | 1    |
| DT-003 | P2        | Rate limit por IP no implementado                  | CLI-A  | 1    |
| DT-004 | P2        | Panel admin (Directus) pendiente de instalar       | CLI-D  | 3    |
| DT-005 | P3        | Meta tags OG para WhatsApp/Instagram               | CLI-B  | 5    |

**Regla:** P1 se resuelve antes de hacer pública la página. P2 antes del primer reporte real.

---

## PROTOCOLO DE DEPLOY VPS

```bash
ssh -i C:\Users\carbo\.ssh\id_ed25519 root@187.124.241.213
cd /var/www/protegecolitas
git pull origin main
npm install        # solo si hay nuevas dependencias
npm run build
pm2 restart protegecolitas
pm2 save

# Verificar
curl http://localhost:4321
pm2 logs protegecolitas --lines 5
```

**Verificar siempre:** https://protegecolitas.org carga sin errores después del deploy.
