import type { APIRoute } from 'astro'
import { supabaseAdmin } from '../../lib/supabase'

const PAGE_SIZE = 20

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams
  const especie = params.get('especie')
  const zona = params.get('zona')
  const q = params.get('q')
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabaseAdmin
    .from('mascotas')
    .select('id, nombre, especie, descripcion, color, tamanio, zona, tipo, status, foto_url, foto_url_2, foto_url_3, whatsapp, created_at')
    .eq('status', 'publicado')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (especie) {
    query = query.eq('especie', especie)
  }

  if (zona) {
    query = query.ilike('zona', `%${zona}%`)
  }

  if (q) {
    // Eliminar metacaracteres de PostgREST antes de interpolar en el filtro OR
    const safe = q.replace(/[,()\.:*\\]/g, ' ').trim().slice(0, 100)
    const term = `%${safe}%`
    query = query.or(
      `nombre.ilike.${term},descripcion.ilike.${term},color.ilike.${term},zona.ilike.${term}`
    )
  }

  const { data, error } = await query

  if (error) {
    return json({ error: error.message }, 500)
  }

  return json({ mascotas: data ?? [], page, pageSize: PAGE_SIZE })
}
