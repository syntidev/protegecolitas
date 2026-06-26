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

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const authHeader = request.headers.get('Authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  const isModerador = token ? await validateModerador(token) : false

  if (!isModerador && isRateLimited(clientAddress)) {
    return json({ error: 'Demasiados reportes. Espera 5 minutos antes de volver a reportar.' }, 429)
  }

  let fd: FormData
  try {
    fd = await request.formData()
  } catch {
    return json({ error: 'Datos inválidos' }, 400)
  }

  const nombre    = fd.get('nombre')?.toString().trim() || null
  const especie   = fd.get('especie')?.toString().trim() || ''
  const descripcion = fd.get('descripcion')?.toString().trim() || null
  const color     = fd.get('color')?.toString().trim() || null
  const tamanio   = fd.get('tamanio')?.toString().trim() || null
  const zona      = fd.get('zona')?.toString().trim() || ''
  const whatsapp  = fd.get('whatsapp')?.toString().trim() || ''
  const tipo      = fd.get('tipo')?.toString().trim() || null
  const latitudRaw  = fd.get('latitud')?.toString()
  const longitudRaw = fd.get('longitud')?.toString()

  if (!especie || !ESPECIES.includes(especie as typeof ESPECIES[number])) {
    return json({ error: `Especie inválida. Valores permitidos: ${ESPECIES.join(', ')}` }, 400)
  }

  if (!zona || zona.length < 5) {
    return json({ error: 'Zona debe tener mínimo 5 caracteres' }, 400)
  }

  if (!whatsapp || !WS_REGEX.test(whatsapp)) {
    return json({ error: 'WhatsApp venezolano requerido. Formato: 04XX-XXXXXXX (11 dígitos)' }, 400)
  }

  const { data, error } = await supabaseAdmin
    .from('mascotas')
    .insert({
      nombre,
      especie,
      descripcion,
      color,
      tamanio,
      zona,
      whatsapp,
      tipo,
      status: 'pendiente',
      latitud: latitudRaw ? parseFloat(latitudRaw) : null,
      longitud: longitudRaw ? parseFloat(longitudRaw) : null,
    })
    .select('id')
    .single()

  if (error) {
    return json({ error: error.message }, 500)
  }

  if (!isModerador) rateMap.set(clientAddress, Date.now())

  // Upload fotos a Supabase Storage (binario directo desde FormData)
  const fotoUrls: (string | null)[] = []
  for (let i = 1; i <= 3; i++) {
    const entry = fd.get(`foto${i}`)
    if (!entry || typeof entry === 'string') { fotoUrls.push(null); continue }
    const file = entry as File
    if (file.size === 0) { fotoUrls.push(null); continue }
    const path = `${data.id}/foto_${i}.jpg`
    const { error: uploadError } = await supabaseAdmin.storage
      .from('mascotas')
      .upload(path, await file.arrayBuffer(), { contentType: 'image/jpeg', upsert: true })
    if (uploadError) { fotoUrls.push(null); continue }
    const { data: urlData } = supabaseAdmin.storage.from('mascotas').getPublicUrl(path)
    fotoUrls.push(urlData.publicUrl ?? null)
  }

  const updatePayload: Record<string, string> = {}
  if (fotoUrls[0]) updatePayload.foto_url   = fotoUrls[0]
  if (fotoUrls[1]) updatePayload.foto_url_2 = fotoUrls[1]
  if (fotoUrls[2]) updatePayload.foto_url_3 = fotoUrls[2]

  if (Object.keys(updatePayload).length > 0) {
    await supabaseAdmin.from('mascotas').update(updatePayload).eq('id', data.id)
  }

  return json({ id: data.id, message: 'Reporte recibido. Será revisado por un moderador pronto.' })
}
