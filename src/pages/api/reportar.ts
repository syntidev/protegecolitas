import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../lib/supabase'

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
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user?.email) return false

  const { data } = await supabaseAdmin
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

function parseBase64(raw: string): { buffer: Buffer; ext: string; contentType: string } | null {
  let b64 = raw
  let contentType = 'image/jpeg'
  let ext = 'jpg'

  // Acepta data URLs: data:image/jpeg;base64,...
  const match = raw.match(/^data:(image\/[a-z]+);base64,(.+)$/i)
  if (match) {
    contentType = match[1].toLowerCase()
    b64 = match[2]
    if (contentType === 'image/png') ext = 'png'
    else if (contentType === 'image/webp') ext = 'webp'
    else if (contentType === 'image/gif') ext = 'gif'
    else ext = 'jpg'
  }

  try {
    const buffer = Buffer.from(b64, 'base64')
    if (buffer.length === 0) return null
    return { buffer, ext, contentType }
  } catch {
    return null
  }
}

async function uploadFoto(mascotaId: string, index: number, raw: string): Promise<string | null> {
  const parsed = parseBase64(raw)
  if (!parsed) return null

  const { buffer, ext, contentType } = parsed
  const filename = `${mascotaId}/foto_${index}.${ext}`

  const { error } = await supabaseAdmin.storage
    .from('mascotas')
    .upload(filename, buffer, { contentType, upsert: true })

  if (error) return null

  const { data } = supabaseAdmin.storage.from('mascotas').getPublicUrl(filename)
  return data.publicUrl ?? null
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

  const { nombre, especie, descripcion, color, tamanio, zona, whatsapp, tipo, foto1, foto2, foto3, latitud, longitud } = body

  if (!especie || !ESPECIES.includes(especie as typeof ESPECIES[number])) {
    return json({ error: `Especie inválida. Valores permitidos: ${ESPECIES.join(', ')}` }, 400)
  }

  if (!zona || zona.trim().length < 5) {
    return json({ error: 'Zona debe tener mínimo 5 caracteres' }, 400)
  }

  if (!whatsapp || !WS_REGEX.test(whatsapp)) {
    return json({ error: 'WhatsApp venezolano requerido. Formato: 04XX-XXXXXXX (11 dígitos)' }, 400)
  }

  const { data, error } = await supabaseAdmin
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
      status: 'pendiente',
      latitud: latitud ? parseFloat(latitud) : null,
      longitud: longitud ? parseFloat(longitud) : null,
    })
    .select('id')
    .single()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!isModerador) rateMap.set(clientAddress, Date.now())

  // Upload fotos en paralelo
  const fotoUrls = await Promise.all(
    [foto1, foto2, foto3].map((f, i) => f ? uploadFoto(data.id, i + 1, f) : Promise.resolve(null))
  )

  const updatePayload: Record<string, string> = {}
  if (fotoUrls[0]) updatePayload.foto_url   = fotoUrls[0]
  if (fotoUrls[1]) updatePayload.foto_url_2 = fotoUrls[1]
  if (fotoUrls[2]) updatePayload.foto_url_3 = fotoUrls[2]

  if (Object.keys(updatePayload).length > 0) {
    await supabaseAdmin.from('mascotas').update(updatePayload).eq('id', data.id)
  }

  return json({ id: data.id, message: 'Reporte recibido. Será revisado por un moderador pronto.' })
}
