import { NextResponse } from 'next/server'

const CACHE_TTL = 60 * 60 * 1000 // 1시간
let cache: { data: unknown; expires: number } | null = null

function decodeEntities(str: string): string {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

export async function GET() {
  if (cache && cache.expires > Date.now()) {
    return NextResponse.json(cache.data)
  }

  try {
    const query = encodeURIComponent(
      '국제유가 OR 원유 OR 유가 상승 OR 이란 미국 석유 OR OPEC',
    )
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`
    const res = await fetch(rssUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GasFinder/1.0)',
      },
    })
    const xml = await res.text()

    const items: {
      title: string
      link: string
      date: string
      source: string
    }[] = []

    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const block = match[1]

      const rawTitle =
        block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ''
      const link =
        block.match(/<link\s*\/?>\s*([\s\S]*?)(?=\s*<)/)?.[1]?.trim() ||
        block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ||
        ''
      const pubDate =
        block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || ''
      const source =
        block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.trim() || ''

      let title = decodeEntities(rawTitle)
      const decodedSource = decodeEntities(source)

      // Google News appends " - SourceName" to titles
      if (decodedSource && title.endsWith(` - ${decodedSource}`)) {
        title = title.slice(0, -decodedSource.length - 3)
      }

      if (title) {
        items.push({
          title,
          link,
          date: pubDate,
          source: decodedSource,
        })
      }
    }

    cache = { data: items, expires: Date.now() + CACHE_TTL }
    return NextResponse.json(items)
  } catch {
    // 뉴스 못 가져와도 서비스는 동작해야 함
    return NextResponse.json([])
  }
}
