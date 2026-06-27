import { defineMiddleware } from 'astro:middleware'
import { supabaseAdmin } from './lib/supabase'
import { createHmac } from 'crypto'

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_') ||
    /\.(js|css|png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|map)$/.test(pathname)
  ) {
    return next()
  }

  try {
    const ua       = context.request.headers.get('user-agent') ?? ''
    const referrer = context.request.headers.get('referer')    ?? null

    // Real client IP (Cloudflare → X-Forwarded-For → fallback)
    const rawIp =
      context.request.headers.get('cf-connecting-ip') ??
      context.request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      context.clientAddress ??
      ''

    const ip_hash = createHmac('sha256', 'protegecolitas2026').update(rawIp).digest('hex').slice(0, 16)

    const isMobile = /mobile|android|iphone|ipad/i.test(ua)
    const isTablet = /ipad|tablet/i.test(ua)
    const dispositivo = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    let os = 'Otro'
    if      (/windows/i.test(ua))                              os = 'Windows'
    else if (/mac os x/i.test(ua) && !/iphone|ipad/i.test(ua)) os = 'Mac'
    else if (/iphone/i.test(ua))                               os = 'iOS'
    else if (/ipad/i.test(ua))                                 os = 'iPadOS'
    else if (/android/i.test(ua))                              os = 'Android'
    else if (/linux/i.test(ua))                                os = 'Linux'

    let browser = 'Otro'
    if      (/edg\//i.test(ua))                               browser = 'Edge'
    else if (/chrome/i.test(ua) && !/chromium/i.test(ua))    browser = 'Chrome'
    else if (/firefox/i.test(ua))                             browser = 'Firefox'
    else if (/safari/i.test(ua) && !/chrome/i.test(ua))      browser = 'Safari'
    else if (/samsung/i.test(ua))                             browser = 'Samsung'

    const utm_source   = context.url.searchParams.get('utm_source')   ?? null
    const utm_campaign = context.url.searchParams.get('utm_campaign') ?? null

    // Fire-and-forget — never block the response
    supabaseAdmin.from('visitas').insert({
      pagina:      pathname,
      referrer:    referrer ? referrer.slice(0, 500) : null,
      user_agent:  ua.slice(0, 300),
      dispositivo,
      os,
      browser,
      ip_hash,
      utm_source,
      utm_campaign,
    }).then(() => {}).catch(() => {})

  } catch {
    // Analytics errors must never surface to users
  }

  return next()
})
