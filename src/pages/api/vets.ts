import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../lib/supabase'

const WA_RE = /^04[0-9]{2}[0-9]{7}$/

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo de solicitud inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
  const zona   = typeof body.zona   === 'string' ? body.zona.trim()   : ''
  const whatsapp = typeof body.whatsapp === 'string' ? body.whatsapp.trim() : ''
  const servicios = typeof body.servicios === 'string' ? body.servicios.trim() || null : null
  const horario   = typeof body.horario   === 'string' ? body.horario.trim()   || null : null

  if (!nombre) {
    return new Response(JSON.stringify({ error: 'El nombre es requerido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }
  if (zona.length < 5) {
    return new Response(JSON.stringify({ error: 'La zona debe tener mínimo 5 caracteres' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }
  if (!WA_RE.test(whatsapp)) {
    return new Response(JSON.stringify({ error: 'WhatsApp venezolano requerido: 04XX + 7 dígitos' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    })
  }

  const { data, error } = await supabaseAdmin
    .from('vets')
    .insert({ nombre, zona, whatsapp, servicios, horario, gratuito: true })
    .select('id')
    .single()

  if (error) {
    console.error('[api/vets]', error)
    return new Response(JSON.stringify({ error: 'Error al guardar. Intenta de nuevo.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  return new Response(JSON.stringify({ id: data.id, message: 'Registro recibido. Lo revisamos pronto.' }), {
    status: 201, headers: { 'Content-Type': 'application/json' }
  })
}
