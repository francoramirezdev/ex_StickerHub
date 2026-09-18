import './globals.css'
import type { Metadata } from 'next'
import { SiteNav } from '@/components/SiteNav'

export const metadata: Metadata = {
  title: 'StickerHub',
  description: 'Gestión de láminas de álbumes',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Decorative background blobs */}
        <div className="blobs" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
        </div>

        <SiteNav />


        <div className="page-wrapper" style={{ minHeight: 'calc(100vh - 68px - 80px)' }}>{children}</div>

        <footer style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#888' }}>
          <p>© {new Date().getFullYear()} StickerHub. Todos los derechos reservados.</p>
          <p style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: '#AAA' }}>Desarrollado para la gestión de láminas de álbumes.</p>
        </footer>
      </body>
    </html>
  )
}
