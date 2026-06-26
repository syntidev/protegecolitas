import type { APIRoute } from 'astro'
import 'dotenv/config'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

const PROMPT = `Analiza esta imagen de un cartel de mascota perdida o encontrada en Venezuela.
Extrae los siguientes datos y devuelve SOLO un JSON válido con estas claves (omite las que no estén claramente visibles):
- nombre: nombre de la mascota (string o null)
- especie: "Perro", "Gato", "Ave" o "Otro"
- color: color o descripción física de la mascota (string o null)
- zona: barrio, ciudad o sector donde se perdió/encontró (string o null)
- descripcion: descripción adicional extraída del cartel (string o null)
- whatsapp: número venezolano en formato 04XXXXXXXXX si aparece (string o null, sin guiones)
- tipo: "perdido" o "encontrado" según el cartel

Responde ÚNICAMENTE con el JSON, sin texto adicional ni bloques de código markdown.`

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return json({ error: 'Gemini no configurado en el servidor' }, 500)

  let base64: string, mime: string
  try {
    const body = await request.json()
    base64 = body.base64
    mime = body.mime || 'image/jpeg'
    if (!base64 || typeof base64 !== 'string') throw new Error('missing base64')
  } catch {
    return json({ error: 'Cuerpo de solicitud inválido' }, 400)
  }

  const payload = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mime, data: base64 } },
        { text: PROMPT }
      ]
    }]
  }

  let geminiRes: Response
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
  } catch {
    return json({ error: 'Error de conexión con Gemini' }, 502)
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text().catch(() => '')
    return json({ error: `Gemini error ${geminiRes.status}: ${errText.slice(0, 200)}` }, 502)
  }

  const geminiData = await geminiRes.json()
  const text: string = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim()
  try {
    const extracted = JSON.parse(cleaned)
    return json(extracted)
  } catch {
    return json({ error: 'Gemini no devolvió JSON válido', raw: text.slice(0, 300) }, 422)
  }
}
