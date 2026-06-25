# PROTEGE COLITAS - Setup
# Ejecutar desde: protegecolitas\protegecolitas

New-Item -ItemType Directory -Force -Path "src/lib" | Out-Null
New-Item -ItemType Directory -Force -Path "src/components" | Out-Null
New-Item -ItemType Directory -Force -Path "src/layouts" | Out-Null
New-Item -ItemType Directory -Force -Path "src/pages/admin" | Out-Null
New-Item -ItemType Directory -Force -Path "src/styles" | Out-Null
New-Item -ItemType Directory -Force -Path "public" | Out-Null
Write-Host "OK directorios" -ForegroundColor Green

$env_content = "PUBLIC_SUPABASE_URL=https://TUPROYECTO.supabase.co`nPUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY"
Set-Content -Path ".env" -Value $env_content -Encoding UTF8
Add-Content -Path ".gitignore" -Value "`n.env"
Write-Host "OK .env" -ForegroundColor Green

Set-Content -Path "src/lib/supabase.ts" -Encoding UTF8 -Value @'
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
'@
Write-Host "OK supabase.ts" -ForegroundColor Green

Set-Content -Path "src/styles/global.css" -Encoding UTF8 -Value @'
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
:root {
  --amarillo:     #F5C107;
  --marron:       #6B3A2A;
  --blanco:       #FFFFFF;
  --negro:        #1A1A1A;
  --gris-bg:      #F9F6F0;
  --gris-txt:     #6B7280;
  --rojo:         #DC2626;
  --verde:        #16A34A;
  --azul:         #2563EB;
  --border:       #E5DDD0;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'Inter', sans-serif; background: var(--gris-bg); color: var(--negro); font-size: 15px; line-height: 1.6; }
'@
Write-Host "OK global.css" -ForegroundColor Green

Set-Content -Path "src/layouts/Base.astro" -Encoding UTF8 -Value @'
---
export interface Props { title?: string }
const { title = 'Protege Colitas' } = Astro.props
---
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <link rel="stylesheet" href="/styles/global.css" />
</head>
<body><slot /></body>
</html>
'@
Write-Host "OK Base.astro" -ForegroundColor Green

Set-Content -Path "src/components/Ribbon.astro" -Encoding UTF8 -Value @'
<div class="ribbon">
  <span class="dot"></span>
  EMERGENCIA ACTIVA - TERREMOTO VENEZUELA - #TerremotoVE
  <span class="dot"></span>
</div>
<style>
.ribbon { background:#DC2626; color:#fff; text-align:center; padding:9px 16px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:10px; }
.dot { width:6px; height:6px; background:#fff; border-radius:50%; animation:blink 1.2s infinite; flex-shrink:0; }
@keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
</style>
'@
Write-Host "OK Ribbon.astro" -ForegroundColor Green

Set-Content -Path "src/components/PetCard.astro" -Encoding UTF8 -Value @'
---
export interface Props { id:string; nombre:string; especie:string; descripcion:string; zona:string; status:string; foto_url?:string; whatsapp?:string }
const { id, nombre, especie, descripcion, zona, status, foto_url, whatsapp } = Astro.props
const labels: Record<string,string> = { perdido:'Perdido', encontrado:'Encontrado', urgente:'Urgente', reunido:'Reunido' }
const emoji = especie==='Gato'?'🐈':especie==='Ave'?'🐦':'🐕'
const wa = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g,'')}` : 'https://wa.me/584242042786'
---
<div class={`pet-card ${status}`}>
  <div class="pet-img">
    {foto_url ? <img src={foto_url} alt={nombre} loading="lazy" /> : <span class="emoji">{emoji}</span>}
    <span class={`badge badge-${status}`}>{labels[status]??status}</span>
  </div>
  <div class="pet-body">
    <div class="pet-name">{nombre||'Sin nombre'}</div>
    <div class="pet-meta">{especie} - {descripcion}</div>
    <div class="pet-zona">📍 {zona}</div>
    <div class="pet-actions">
      <a href={wa} target="_blank" class="btn-xs bx-wa">WhatsApp</a>
      <a href={`/mascota/${id}`} class="btn-xs bx-ver">Ver ficha</a>
    </div>
  </div>
</div>
<style>
.pet-card { background:var(--blanco); border-radius:14px; overflow:hidden; border:1px solid var(--border); position:relative; }
.pet-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; }
.pet-card.perdido::before    { background:var(--rojo); }
.pet-card.encontrado::before { background:var(--verde); }
.pet-card.urgente::before    { background:var(--amarillo); }
.pet-card.reunido::before    { background:var(--azul); }
.pet-img { width:100%; aspect-ratio:1/1; background:#F3EDE4; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
.pet-img img { width:100%; height:100%; object-fit:cover; }
.emoji { font-size:52px; }
.badge { position:absolute; top:8px; right:8px; font-size:9px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:3px 8px; border-radius:20px; }
.badge-perdido { background:var(--rojo); color:#fff; }
.badge-encontrado { background:var(--verde); color:#fff; }
.badge-urgente { background:var(--amarillo); color:#000; }
.badge-reunido { background:var(--azul); color:#fff; }
.pet-body { padding:10px 12px 12px 16px; }
.pet-name { font-family:'Syne',sans-serif; font-size:15px; font-weight:700; margin-bottom:2px; }
.pet-meta { font-size:11px; color:var(--gris-txt); margin-bottom:4px; }
.pet-zona { font-size:11px; color:var(--azul); font-weight:600; margin-bottom:8px; }
.pet-actions { display:flex; gap:6px; }
.btn-xs { flex:1; padding:7px 6px; border-radius:7px; font-size:11px; font-weight:700; text-align:center; text-decoration:none; }
.bx-wa { background:#25D366; color:#fff; }
.bx-ver { background:var(--gris-bg); color:var(--marron); border:1px solid var(--border); }
</style>
'@
Write-Host "OK PetCard.astro" -ForegroundColor Green

Set-Content -Path "src/pages/index.astro" -Encoding UTF8 -Value @'
---
import Base from '../layouts/Base.astro'
import Ribbon from '../components/Ribbon.astro'
import PetCard from '../components/PetCard.astro'
import { supabase } from '../lib/supabase'

const { data: mascotas } = await supabase
  .from('mascotas').select('*')
  .in('status', ['perdido','encontrado','urgente'])
  .order('created_at', { ascending: false }).limit(12)

const { count: perdidos }    = await supabase.from('mascotas').select('*',{count:'exact',head:true}).eq('status','perdido')
const { count: encontrados } = await supabase.from('mascotas').select('*',{count:'exact',head:true}).eq('status','encontrado')
const { count: reunidos }    = await supabase.from('mascotas').select('*',{count:'exact',head:true}).eq('status','reunido')
---
<Base>
  <Ribbon />
  <section class="hero">
    <img src="/logo.png" alt="Protege Colitas" class="logo-img" onerror="this.style.display='none'" />
    <p class="eyebrow">Emergencia Nacional - Terremoto Venezuela</p>
    <h1 class="headline">Cada colita<br />tiene <em>familia.</em></h1>
    <p class="sub">Reporta mascotas <strong>perdidas o encontradas</strong> durante el terremoto.</p>
    <div class="counters">
      <div class="counter"><span class="num red">{perdidos??0}</span><span class="label">Perdidos</span></div>
      <div class="counter"><span class="num blue">{encontrados??0}</span><span class="label">Encontrados</span></div>
      <div class="counter"><span class="num green">{reunidos??0}</span><span class="label">Reunidos</span></div>
    </div>
    <div class="ctas">
      <a href="/reportar?tipo=perdido" class="cta cta-danger">Perdi a mi mascota</a>
      <a href="/reportar?tipo=encontrado" class="cta cta-outline">Encontre una mascota</a>
    </div>
  </section>
  <main class="main">
    <div class="sec-head">
      <h2 class="sec-title">Ultimos Reportes</h2>
      <a href="/mascotas" class="ver-todos">Ver todos</a>
    </div>
    <div class="pet-grid">
      {mascotas?.map(m => (
        <PetCard id={m.id} nombre={m.nombre} especie={m.especie} descripcion={m.descripcion} zona={m.zona} status={m.status} foto_url={m.foto_url} whatsapp={m.whatsapp} />
      ))}
    </div>
  </main>
  <a href="https://wa.me/584242042786" class="wa-pill" target="_blank">WhatsApp 04242042786</a>
  <a href="/reportar" class="fab">🐾</a>
  <footer class="footer">
    <strong>Protege Colitas</strong> - protegecolitas.org<br />
    <span>#MascotasPerdidasVenezuela #TerremotoVE</span>
  </footer>
</Base>
<style>
.hero { padding:36px 20px 40px; text-align:center; background:var(--blanco); border-bottom:3px solid var(--amarillo); }
.logo-img { width:100px; height:100px; object-fit:contain; margin-bottom:16px; }
.eyebrow { font-size:11px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--rojo); margin-bottom:14px; }
.headline { font-family:'Syne',sans-serif; font-size:clamp(34px,9vw,52px); font-weight:800; line-height:1.0; color:var(--marron); margin-bottom:10px; }
.headline em { font-style:normal; color:var(--amarillo); }
.sub { font-size:14px; color:var(--gris-txt); margin-bottom:28px; max-width:320px; margin-left:auto; margin-right:auto; }
.counters { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border); border:1px solid var(--border); border-radius:16px; overflow:hidden; margin-bottom:24px; }
.counter { background:var(--blanco); padding:18px 8px; display:flex; flex-direction:column; align-items:center; gap:4px; }
.num { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; line-height:1; }
.num.red{color:var(--rojo);} .num.blue{color:var(--azul);} .num.green{color:var(--verde);}
.label { font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--gris-txt); }
.ctas { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
.cta { padding:14px 10px; border-radius:12px; font-weight:700; font-size:13px; text-decoration:none; text-align:center; transition:transform .12s; }
.cta-danger  { background:var(--rojo);   color:#fff; }
.cta-outline { background:var(--marron); color:#fff; }
.main { padding:20px 16px 100px; }
.sec-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.sec-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:var(--marron); }
.ver-todos { font-size:13px; font-weight:700; color:var(--azul); text-decoration:none; }
.pet-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
@media(min-width:480px){.pet-grid{grid-template-columns:repeat(3,1fr);}}
.wa-pill { position:fixed; bottom:30px; right:90px; background:#25D366; color:#fff; font-size:12px; font-weight:700; padding:10px 16px; border-radius:30px; text-decoration:none; z-index:500; }
.fab { position:fixed; bottom:24px; right:20px; width:58px; height:58px; background:var(--rojo); border-radius:50%; font-size:26px; text-decoration:none; display:flex; align-items:center; justify-content:center; z-index:500; }
.footer { background:var(--marron); color:rgba(255,255,255,.7); text-align:center; padding:24px 16px; font-size:12px; }
.footer strong { color:var(--amarillo); font-family:'Syne',sans-serif; font-size:15px; }
</style>
'@
Write-Host "OK index.astro" -ForegroundColor Green

Set-Content -Path "astro.config.mjs" -Encoding UTF8 -Value @'
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' })
})
'@
Write-Host "OK astro.config.mjs" -ForegroundColor Green

Write-Host ""
Write-Host "LISTO. Pasos siguientes:" -ForegroundColor Yellow
Write-Host "1. Edita .env con tus keys de Supabase" -ForegroundColor Cyan
Write-Host "2. Copia logo.png a public/logo.png" -ForegroundColor Cyan
Write-Host "3. Ejecuta: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "SCHEMA SQL - pega esto en Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "
create table mascotas (
  id uuid default gen_random_uuid() primary key,
  nombre text, especie text not null, descripcion text,
  zona text not null, status text not null default 'perdido',
  foto_url text, whatsapp text, created_at timestamptz default now()
);
create table necesidades (
  id uuid default gen_random_uuid() primary key,
  item text not null, cantidad_requerida int not null,
  cantidad_recibida int default 0, prioridad text default 'urgente',
  updated_at timestamptz default now()
);
create table vets (
  id uuid default gen_random_uuid() primary key,
  nombre text not null, zona text not null,
  servicios text, horario text, whatsapp text,
  created_at timestamptz default now()
);
create table feed (
  id uuid default gen_random_uuid() primary key,
  titulo text not null, cuerpo text not null,
  tipo text default 'info', published_at timestamptz default now()
);
alter table mascotas    enable row level security;
alter table necesidades enable row level security;
alter table vets        enable row level security;
alter table feed        enable row level security;
create policy pub_read on mascotas    for select using (true);
create policy pub_read on necesidades for select using (true);
create policy pub_read on vets        for select using (true);
create policy pub_read on feed        for select using (true);
" -ForegroundColor Gray