import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '기름값 헌터 - 내 주변 최저가 주유소 검색'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #1e293b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>⛽</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            background: 'linear-gradient(to right, #f43f5e, #f59e0b)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          기름값 헌터
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 16 }}>
          내 주변 최저가 주유소를 실시간으로 비교하세요
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
            fontSize: 20,
            color: '#64748b',
          }}
        >
          <span>⛽ 휘발유</span>
          <span>🚛 경유</span>
          <span>💎 고급유</span>
          <span>💨 LPG</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
