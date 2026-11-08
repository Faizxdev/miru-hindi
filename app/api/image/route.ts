import { NextRequest, NextResponse } from 'next/server';
import { BASE } from '@/server/scraper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const src = searchParams.get('src') || '';
  if (!src) return NextResponse.json({ error: true, message: 'Missing src' }, { status: 400 });
  try {
    if (/^data:/i.test(src)) {
      const match = src.match(/^data:([^;]+);base64,(.*)$/i);
      if (match) {
        const mime = match[1] || 'image/png';
        const b64 = match[2] || '';
        return new NextResponse(Buffer.from(b64, 'base64'), { status: 200, headers: { 'Content-Type': mime, 'Cache-Control': 'public, max-age=86400' } });
      }
      return NextResponse.redirect(src, { status: 302 });
    }

    // Attach BASE to relative paths from the scraper
    const targetUrl = src.startsWith('/') ? `${BASE}${src}` : src;

    if (!/^https?:\/\//i.test(targetUrl)) return NextResponse.json({ error: true, message: 'Invalid src' }, { status: 400 });
    const origin = BASE;
    const axios = (await import('axios')).default;
    const resp = await axios.get<ArrayBuffer>(targetUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Referer: origin + '/',
        Origin: origin,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      timeout: 20000,
    });
    const ct = (resp.headers['content-type'] as string) || 'image/jpeg';
    return new NextResponse(Buffer.from(resp.data), { status: 200, headers: { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' } });
  } catch (e: any) {
    try { return NextResponse.redirect(src, { status: 302 }); } catch { }
    return NextResponse.json({ error: true, message: 'Image proxy failed' }, { status: 502 });
  }
}


