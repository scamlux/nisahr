import { ImageResponse } from 'next/og';

export const alt = 'CareerOS — Your AI Career Operating System';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: '#1e1e1c',
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(217,119,87,0.25), transparent 45%), radial-gradient(circle at 85% 80%, rgba(230,150,110,0.18), transparent 45%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: '#f5f5f0',
            lineHeight: 1,
          }}
        >
          Career
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #d97757, #e6966e)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            OS
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 44,
            fontWeight: 500,
            color: '#b8b5ac',
          }}
        >
          Your AI Career Operating System
        </div>
      </div>
    ),
    { ...size },
  );
}
