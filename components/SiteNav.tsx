"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteNav() {
  const pathname = usePathname()
  const isAlbumsActive = pathname === '/' || pathname.startsWith('/albums')

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand">
        <span className="nav-brand-name">
          Sticker<span style={{ color: 'var(--teal)' }}>Hub</span>
        </span>
      </Link>

      <div className="nav-divider" />

      <div className="nav-links">
        <Link href="/" className={`nav-link ${isAlbumsActive ? 'active' : ''}`}>
          Mis Álbumes
        </Link>
      </div>
    </nav>
  )
}
