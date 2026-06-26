import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const ADMIN_PASS = process.env.ADMIN_PASSWORD ?? ''

function sign(s: string): string {
  return createHmac('sha256', ADMIN_PASS).update(s).digest('hex')
}

function validSession(raw: string): boolean {
  try {
    const parts = decodeURIComponent(raw).split('|')
    if (parts.length !== 3) return false
    const [email, exp, sig] = parts
    if (Date.now() > Number(exp)) return false
    const expected = sign(`${email}|${exp}`)
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch { return false }
}

function getCookie(header: string, name: string): string | null {
  return header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))?.[1] ?? null
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const POST: APIRoute = async ({ request }) => {
  const cookies = request.headers.get('cookie') ?? ''
  const ck = getCookie(cookies, 'admin_session')
  if (!ck || !validSession(ck)) return json({ ok: false, error: 'No autorizado' }, 401)

  const db = createClient(
    process.env.PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY ?? '',
    { auth: { persistSession: false } }
  )

  let fd: FormData
  try { fd = await request.formData() }
  catch { return json({ ok: false, error: 'Datos inválidos' }, 400) }

  const titulo = fd.get('titulo')?.toString().trim() ?? ''
  if (!titulo) return json({ ok: false, error: 'El título es requerido' }, 400)

  const { error } = await db.from('banners').insert({
    titulo,
    descripcion: fd.get('descripcion')?.toString().trim() || null,
    link:        fd.get('link')?.toString().trim() || null,
    imagen_url:  fd.get('imagen_url')?.toString().trim() || null,
    activo:      fd.get('activo') === 'true',
  })

  return json({ ok: !error, error: error?.message ?? null })
}
