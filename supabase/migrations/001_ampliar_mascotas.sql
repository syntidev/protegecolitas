-- ============================================================
-- Migración 001 — Ampliar mascotas + tablas de moderación
-- Protege Colitas | Junio 2026
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Ampliar tabla mascotas
alter table mascotas add column if not exists color text;
alter table mascotas add column if not exists tamanio text;
alter table mascotas add column if not exists foto_url_2 text;
alter table mascotas add column if not exists foto_url_3 text;
alter table mascotas add column if not exists descripcion_adicional text;
alter table mascotas add column if not exists moderado_por text;
alter table mascotas add column if not exists moderado_at timestamptz;
alter table mascotas add column if not exists tipo text; -- perdido / encontrado

-- 2. Tabla de auditoría de moderación
create table if not exists reportes_log (
  id uuid default gen_random_uuid() primary key,
  mascota_id uuid references mascotas(id),
  accion text not null,
  usuario text,
  nota text,
  created_at timestamptz default now()
);

-- 3. Tabla de moderadores
create table if not exists moderadores (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  email text not null unique,
  rol text default 'moderador',
  activo boolean default true
);

-- 4. Habilitar RLS
alter table mascotas enable row level security;
alter table vets enable row level security;
alter table reportes_log enable row level security;
alter table moderadores enable row level security;

-- 5. Políticas — idempotentes (drop + create)
drop policy if exists "public insert mascotas" on mascotas;
create policy "public insert mascotas" on mascotas
  for insert with check (true);

drop policy if exists "public select mascotas publicadas" on mascotas;
create policy "public select mascotas publicadas" on mascotas
  for select using (status = 'publicado');

drop policy if exists "public insert vets" on vets;
create policy "public insert vets" on vets
  for insert with check (true);

drop policy if exists "public select vets" on vets;
create policy "public select vets" on vets
  for select using (true);

-- Moderadores: solo usuarios autenticados pueden consultar (para validación JWT en API)
drop policy if exists "authenticated read moderadores" on moderadores;
create policy "authenticated read moderadores" on moderadores
  for select to authenticated using (true);

-- 6. Verificación — debe devolver las columnas nuevas
select column_name, data_type
from information_schema.columns
where table_name = 'mascotas'
order by ordinal_position;
