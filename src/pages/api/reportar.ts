import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Otro'] as const
const WS_REGEX = /^04[0-9]{2}[0-9]{7}$/
const RATE_LIMIT_MS = 5 * 60 * 1000

const rateMap = new Map<string, number>()

function isRateLimited(ip: string): boolean {
  const last = rateMap.get(ip)
  if (!last) return false
  return Date.now() - last < RATE_LIMIT_MS
}

async function validateModerador(token: string): Promise<boolean> {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user?.email) return false

  // Crear cliente con token del usuario para que RLS aplique (authenticated policy)
  const userClient = createClient(
    process.env.PUBLIC_SUPABASE_URL!,
    process.env.PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )

  const { data } = await userClient
    .from('moderadores')
    .select('id')
    .eq('email', user.email)
    .eq('activo', true)
    .maybeSingle()

  return !!data
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  const isModerador = token ? await validateModerador(token) : false

  if (!isModerador && isRateLimited(clientAddress)) {
    return json({ error: 'Demasiados reportes. Espera 5 minutos antes de volver a reportar.' }, 429)
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Cuerpo de solicitud inválido' }, 400)
  }

  const { nombre, especie, descripcion, color, tamanio, zona, whatsapp, tipo } = body

  if (!especie || !ESPECIES.includes(especie as typeof ESPECIES[number])) {
    return json({ error: `Especie inválida. Valores permitidos: ${ESPECIES.join(', ')}` }, 400)
  }

  if (!zona || zona.trim().length < 5) {
    return json({ error: 'Zona debe tener mínimo 5 caracteres' }, 400)
  }

  if (!whatsapp || !WS_REGEX.test(whatsapp)) {
    return json({ error: 'WhatsApp venezolano requerido. Formato: 04XX-XXXXXXX (11 dígitos)' }, 400)
  }

  const { data, error } = await supabase
    .from('mascotas')
    .insert({
      nombre: nombre?.trim() || null,
      especie,
      descripcion: descripcion?.trim() || null,
      color: color?.trim() || null,
      tamanio: tamanio?.trim() || null,
      zona: zona.trim(),
      whatsapp,
      tipo: tipo?.trim() || null,
      status: 'pendiente'
    })
    .select('id')
    .single()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!isModerador) rateMap.set(clientAddress, Date.now())

  return json({ id: data.id, message: 'Reporte recibido. Será revisado por un moderador pronto.' })
}
