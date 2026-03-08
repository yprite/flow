import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background:
            'radial-gradient(circle at top left, rgba(251,146,60,0.35), transparent 30%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.3), transparent 25%), linear-gradient(180deg, #020617 0%, #111827 55%, #1f2937 100%)',
          color: '#fff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 28,
            color: '#fcd34d',
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '9999px',
              background: '#fb7185',
              boxShadow: '0 0 32px rgba(251,113,133,0.65)',
            }}
          />
          Find the cheapest station near you
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.05,
            }}
          >
            <div>Gas Price Hunter</div>
            <div>Skip the expensive station.</div>
          </div>
          <div style={{ maxWidth: 900, fontSize: 34, color: '#cbd5e1', lineHeight: 1.45 }}>
            Compare nearby gas prices, national averages, and map links in one place.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 28,
            color: '#e2e8f0',
          }}
        >
          <div>Gasoline · Diesel · LPG · Premium</div>
          <div style={{ color: '#86efac' }}>Sort by price, distance, and brand</div>
        </div>
      </div>
    ),
    size,
  )
}
