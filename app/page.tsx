"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Sticker { id: number; isOwned: boolean; isDuplicate: boolean }
interface Album   { id: number; title: string; coverImage?: string | null; stickers: Sticker[] }

const BANNER_COLORS = [
  'linear-gradient(90deg,#B5EAD7,#5CBFB9)',
  'linear-gradient(90deg,#FFDAC1,#FF8C69)',
  'linear-gradient(90deg,#C7CEEA,#8B8FCC)',
  'linear-gradient(90deg,#FFF1A8,#D4B800)',
]
export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [releaseDate, setReleaseDate] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle]   = useState('')

  const fetchAlbums = async () => {
    const res = await fetch('/api/albums')
    setAlbums(await res.json())
  }

  useEffect(() => { fetchAlbums() }, [])

  const createAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const formData = new FormData()
    formData.append('title', title.trim())
    if (releaseDate) formData.append('releaseDate', releaseDate)
    if (coverFile) formData.append('coverImage', coverFile)

    await fetch('/api/albums', {
      method: 'POST',
      body: formData,
    })

    setTitle('')
    setCoverFile(null)
    setReleaseDate('')
    setIsModalOpen(false)
    fetchAlbums()
  }
  const totalAlbums = albums.length
  const totalStickers = albums.reduce((acc, a) => acc + a.stickers.length, 0)
  const totalOwned = albums.reduce((acc, a) => acc + a.stickers.filter(s => s.isOwned).length, 0)
  const totalMissing = totalStickers - totalOwned
  const totalDuplicates = albums.reduce((acc, a) => acc + a.stickers.reduce((sum, s) => sum + (s.duplicateCount || 0), 0), 0)
  const globalPct = totalStickers > 0 ? Math.round((totalOwned / totalStickers) * 100) : 0

  return (
    <div className="home-wrap">

      <div style={{ background: '#FFF', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem', border: '1.5px solid #E8E8E8', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Resumen Global</h2>
          <div style={{ fontWeight: 800, color: 'var(--teal)', fontSize: '1.2rem' }}>{globalPct}% Completado</div>
        </div>
        
        <div className="progress-track" style={{ marginBottom: '1.5rem', height: '8px', background: '#F0F0F0' }}>
          <div className="progress-fill" style={{ width: `${globalPct}%`, background: 'linear-gradient(90deg, var(--mint), var(--teal))' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 600 }}>Álbumes</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>{totalAlbums}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 600 }}>Total Láminas</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>{totalStickers}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 600 }}>Obtenidas</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)' }}>{totalOwned}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 600 }}>Faltantes</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#999' }}>{totalMissing}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-2)', fontWeight: 600 }}>Repetidas</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>{totalDuplicates}</span>
          </div>
        </div>
      </div>


      <button onClick={() => setIsModalOpen(true)} className="home-btn" style={{ marginBottom: '2rem' }}>
        + Crear álbum
      </button>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--ink)' }}>Nuevo Álbum</h2>
            <form onSubmit={createAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre del álbum *</label>
                <input className="home-input" style={{ width: '100%' }} value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Portada del Álbum (opcional)</label>
                <input type="file" accept="image/*" className="home-input file-input" style={{ width: '100%', padding: '0.4rem', color: '#555', fontSize: '0.85rem' }} onChange={e => setCoverFile(e.target.files?.[0] || null)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Fecha de Lanzamiento (opcional)</label>
                <input type="date" className="home-input" style={{ width: '100%' }} value={releaseDate} onChange={e => setReleaseDate(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="home-btn" style={{ background: '#EEE', color: '#555', flex: 1 }}>Cancelar</button>
                <button type="submit" className="home-btn" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="album-grid">
        {albums.map((a, i) => {
          const owned = a.stickers.filter(s => s.isOwned).length
          const dups  = a.stickers.filter(s => s.isDuplicate).length
          const pct   = a.stickers.length > 0 ? Math.round((owned / a.stickers.length) * 100) : 0
          return (
            <Link key={a.id} href={`/albums/${a.id}`} className="album-card-new">
              <div 
                className="album-card-banner" 
                style={{ 
                  background: a.coverImage ? `url(${a.coverImage}) center/cover no-repeat` : BANNER_COLORS[i % BANNER_COLORS.length],
                  height: a.coverImage ? '120px' : '8px'
                }} 
              />
              <div className="album-card-content">
                <div className="album-card-name">{a.title}</div>
                <div className="album-card-count">{a.stickers.length} láminas registradas</div>
                {a.stickers.length > 0 && (
                  <>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: BANNER_COLORS[i % BANNER_COLORS.length] }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#AAA', marginTop: '0.25rem' }}>{pct}% completado</div>
                  </>
                )}
              </div>
              <div className="album-card-footer-new">
                <span className="chip green">✓ {owned}</span>
                {dups > 0 && <span className="chip orange">2× {dups}</span>}
              </div>
            </Link>
          )
        })}

        {albums.length === 0 && (
          <div className="home-empty">
            <strong>Sin álbumes</strong>
            Crea tu primer álbum para comenzar tu colección.
          </div>
        )}
      </div>
    </div>
  )
}
