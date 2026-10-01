'use client';

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it cannot rely on our stylesheet, fonts or theme.
 */
export default function GlobalError({ retry }: { error: Error; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'Georgia, serif',
          background: '#f5f0e6',
          color: '#1c1a16',
        }}
      >
        <title>Something went wrong | Dispatch</title>
        <main style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 32, margin: 0 }}>Dispatch could not load</h1>
          <p style={{ color: '#5c564b' }}>Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              border: 0,
              borderRadius: 999,
              background: '#b93a0a',
              color: '#fffcf5',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
