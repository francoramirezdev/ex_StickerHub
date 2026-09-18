"use client"
import { useEffect, useState, use } from 'react'
import Link from 'next/link'

interface Sticker { id: number; number: string; isOwned: boolean; isDuplicate: boolean; duplicateCount: number; image?: string | null; stickerType?: string | null }
interface Album   { id: number; title: string; coverImage?: string | null; stickers: Sticker[] }

type Filter = 'all' | 'owned' | 'missing' | 'duplicate'

const SIDEBAR_COLORS = ['#5CBFB9', '#FF8C69', '#8B8FCC', '#D4B800', '#FF7B7B', '#7DCE82']

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',       label: 'Todas'      },
  { key: 'owned',     label: 'Tengo'      },
  { key: 'missing',   label: 'Faltantes'  },
  { key: 'duplicate', label: 'Duplicadas' },
]

export default function AlbumView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [album,     setAlbum]     = useState<Album | null>(null)
  const [allAlbums, setAllAlbums] = useState<Album[]>([])
  const [filter,    setFilter]    = useState<Filter>('all')
  const [num,       setNum]       = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sId, setSId] = useState<number | null>(null)
  const [sNumber, setSNumber] = useState('')
  const [sIsOwned, setSIsOwned] = useState(true)
  const [sStickerType, setSStickerType] = useState('Normal')
  const [sDupCount, setSDupCount] = useState(0)
  const [sImageFile, setSImageFile] = useState<File | null>(null)
  const [sImageUrl, setSImageUrl] = useState<string | null>(null)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkIsOwned, setBulkIsOwned] = useState(true)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showLists, setShowLists] = useState(false)

  const openModalForNew = () => {
    setSId(null)
    setSNumber('')
    setSIsOwned(true)
    setSStickerType('Normal')
    setSDupCount(0)
    setSImageFile(null)
    setSImageUrl(null)
    setIsModalOpen(true)
  }

  const openModalForEdit = (s: Sticker) => {
    setSId(s.id)
    setSNumber(s.number)
    setSIsOwned(s.isOwned)
    setSStickerType(s.stickerType || 'Normal')
    setSDupCount(s.duplicateCount || 0)
    setSImageFile(null)
    setSImageUrl(s.image || null)
    setIsModalOpen(true)
  }

  const fetchData = async () => {
    const [aRes, allRes] = await Promise.all([
      fetch(`/api/albums/${id}`),
      fetch('/api/albums'),
    ])
    const albumData: Album = await aRes.json()
    if (albumData.stickers) {
      albumData.stickers.sort((a, b) => {
        const na = parseInt(a.number), nb = parseInt(b.number)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a.number.localeCompare(b.number)
      })
    }
    setAlbum(albumData)
    setAllAlbums(await allRes.json())
  }

  useEffect(() => { fetchData() }, [id])

  const toggleSticker = async (number: string, isOwned: boolean, duplicateCount: number, currentType?: string | null) => {
    const formData = new FormData()
    formData.append('albumId', id)
    formData.append('number', number)
    formData.append('isOwned', String(isOwned))
    formData.append('duplicateCount', String(duplicateCount))
    if (currentType) formData.append('stickerType', currentType)

    await fetch('/api/stickers', { method: 'POST', body: formData })
    fetchData()
  }

  const handleAddSticker = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sNumber.trim()) return

    const formData = new FormData()
    formData.append('albumId', id)
    formData.append('number', sNumber.trim())
    formData.append('isOwned', String(sIsOwned))
    formData.append('duplicateCount', String(sDupCount))
    formData.append('stickerType', sStickerType)
    if (sImageFile) formData.append('image', sImageFile)

    const url = sId ? `/api/stickers/${sId}` : '/api/stickers'
    const method = sId ? 'PUT' : 'POST'

    await fetch(url, { method, body: formData })
    
    setIsModalOpen(false)
    fetchData()
  }

  const handleDeleteSticker = async () => {
    if (!sId || !confirm('¿Eliminar esta lámina permanentemente?')) return
    await fetch(`/api/stickers/${sId}`, { method: 'DELETE' })
    setIsModalOpen(false)
    fetchData()
  }
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault()
    const numbers = bulkText
      .split(/[\n,;]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0)

    if (numbers.length === 0) return
    setBulkLoading(true)

    await fetch('/api/stickers/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId: Number(id), numbers, isOwned: bulkIsOwned }),
    })

    setBulkText('')
    setIsBulkOpen(false)
    setBulkLoading(false)
    fetchData()
  }

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)


  if (!album) return <div className="loading">Cargando álbum…</div>

  const owned     = album.stickers.filter(s => s.isOwned).length
  const missing   = album.stickers.filter(s => !s.isOwned).length
  const duplicate = album.stickers.filter(s => s.isDuplicate).length
  const total     = album.stickers.length
  const pct       = total > 0 ? Math.round((owned / total) * 100) : 0

  const filtered = album.stickers.filter(s => {
    if (filter === 'owned')     return s.isOwned && !s.isDuplicate
    if (filter === 'missing')   return !s.isOwned
    if (filter === 'duplicate') return s.isDuplicate
    return true
  })

  return (
    <div className="collection-layout">

      {/* ── LEFT SIDEBAR ─────────────────────── */}
      <aside className="sidebar-left">
        {allAlbums.map((a, i) => {
          const o   = a.stickers.filter(s => s.isOwned).length
          const p   = a.stickers.length > 0 ? Math.round((o / a.stickers.length) * 100) : 0
          const col = SIDEBAR_COLORS[i % SIDEBAR_COLORS.length]
          return (
            <Link key={a.id} href={`/albums/${a.id}`} className={`album-progress-item${a.id === Number(id) ? ' active' : ''}`}>
              <div className="album-progress-header">
                <span className="album-progress-name">{a.title}</span>
                <span className="album-progress-pct">{p}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${p}%`, background: col }} />
              </div>
            </Link>
          )
        })}
      </aside>

      {/* ── MAIN CONTENT ─────────────────────── */}
      <main className="collection-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Link href="/" style={{ fontSize: '0.78rem', color: '#AAA', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ← Álbumes
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <h1 className="collection-title" style={{ marginBottom: 0 }}>{album.title}</h1>
          <button
            onClick={async () => {
              if (confirm('¿Eliminar este álbum? Se borrarán todas sus láminas.')) {
                await fetch(`/api/albums/${id}`, { method: 'DELETE' })
                window.location.href = '/'
              }
            }}
            style={{
              background: '#FFECEC', color: '#E63946', border: 'none', borderRadius: '8px',
              padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Eliminar
          </button>
        </div>

        <div className="filter-pills">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-pill${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="sticker-grid">
          {filtered.map((s) => {
            const state = s.isDuplicate ? 'dup' : s.isOwned ? 'owned' : 'missing'
            return (
              <div 
                key={s.id} 
                onClick={() => openModalForEdit(s)}
                className={`sticker-card-new ${state} ${(s.isOwned && s.stickerType === 'Dorada') ? 'sticker-dorada' : ''} ${(s.isOwned && s.stickerType === 'Holográfica') ? 'sticker-holo' : ''}`}
              >
                <div className="sticker-img-area">
                  {s.image ? (
                    <img src={s.image} alt={`Lámina ${s.number}`} />
                  ) : (
                    !s.isOwned && <span className="missing-plus">+</span>
                  )}
                </div>
                <div className="sticker-body">
                  <div className="sticker-num" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    #{s.number}
                    {s.stickerType === 'Dorada' && <span title="Lámina Dorada">✨</span>}
                    {s.stickerType === 'Holográfica' && <span title="Lámina Holográfica">🌟</span>}
                  </div>
                  <div className="sticker-album-lbl">{album.title}</div>
                  {s.isOwned && s.duplicateCount === 0 && (
                    <span className="status-badge owned" onClick={(e) => { e.stopPropagation(); toggleSticker(s.number, false, 0, s.stickerType); }}>
                      ✓ TENGO
                    </span>
                  )}
                  {s.isOwned && s.duplicateCount > 0 && (
                    <span className="status-badge dup" onClick={(e) => { e.stopPropagation(); toggleSticker(s.number, true, s.duplicateCount - 1, s.stickerType); }}>
                      REPETIDA ×{s.duplicateCount}
                    </span>
                  )}
                  {!s.isOwned && (
                    <span className="status-badge missing" onClick={(e) => { e.stopPropagation(); toggleSticker(s.number, true, 0, s.stickerType); }}>
                      FALTANTE
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="empty-grid">No hay láminas en esta categoría.</div>
          )}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ────────────────────── */}
      <aside className="sidebar-right">
        <div className="summary-box">
          <h2 className="summary-title">Mi Resumen</h2>

          <div className="summary-row">
            <span>Total: <strong>{owned}/{total}</strong></span>
            <strong>{pct}%</strong>
          </div>
          <div className="progress-track" style={{ marginBottom: '0.75rem' }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: '#B5EAD7' }} />
          </div>

          <div className="summary-divider" />
          <div className="summary-stat-plain">Faltantes: <strong>{missing}</strong></div>
          <div className="summary-stat-plain">Duplicadas: <strong>{duplicate}</strong></div>
        </div>

        {/* Listas faltantes / repetidas */}
        <div className="summary-box" style={{ fontSize: '0.82rem' }}>
          <button
            onClick={() => setShowLists(l => !l)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', padding: 0 }}
          >
            Ver Listados {showLists ? '▲' : '▼'}
          </button>

          {showLists && (() => {
            const faltantes = album.stickers.filter(s => !s.isOwned)
            const repetidas = album.stickers.filter(s => s.duplicateCount > 0)
            const faltantesTxt = faltantes.map(s => s.number).join(', ')
            const repetidasTxt = repetidas.map(s => `#${s.number} ×${s.duplicateCount}`).join('\n')
            return (
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#888' }}>Faltantes ({faltantes.length})</span>
                    {faltantes.length > 0 && <button onClick={() => copyToClipboard(faltantesTxt)} style={{ fontSize: '0.7rem', background: '#F4F4F2', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 600 }}>Copiar</button>}
                  </div>
                  {faltantes.length > 0
                    ? <div style={{ background: '#F8F8F8', borderRadius: '6px', padding: '0.5rem 0.6rem', color: '#666', lineHeight: 1.8, wordBreak: 'break-word' }}>{faltantesTxt}</div>
                    : <div style={{ color: '#CCC', fontStyle: 'italic' }}>Sin faltantes 🎉</div>
                  }
                </div>
                <div className="summary-divider" />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#D97706' }}>Repetidas ({repetidas.length})</span>
                    {repetidas.length > 0 && <button onClick={() => copyToClipboard(repetidasTxt)} style={{ fontSize: '0.7rem', background: '#FEF9C3', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontWeight: 600, color: '#92400E' }}>Copiar</button>}
                  </div>
                  {repetidas.length > 0
                    ? <div style={{ background: '#FFFBEB', borderRadius: '6px', padding: '0.5rem 0.6rem', color: '#92400E', lineHeight: 2, whiteSpace: 'pre-wrap' }}>{repetidasTxt}</div>
                    : <div style={{ color: '#CCC', fontStyle: 'italic' }}>Sin repetidas</div>
                  }
                </div>
              </div>
            )
          })()}
        </div>

        <button className="btn-add" onClick={openModalForNew}>+ AÑADIR NUEVA LÁMINA</button>
        <button className="btn-add" onClick={() => setIsBulkOpen(true)} style={{ background: 'var(--teal)', marginTop: '0.5rem' }}>
          + CARGA MASIVA
        </button>
      </aside>

      {/* MODAL CARGA MASIVA */}
      {isBulkOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ position: 'relative', background: '#FFF', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '460px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <button onClick={() => setIsBulkOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >✕</button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--ink)', paddingRight: '2rem' }}>Carga Masiva</h2>
            <p style={{ fontSize: '0.8rem', color: '#999', marginBottom: '1.25rem' }}>Ingresa los números separados por coma, punto y coma o salto de línea.</p>

            <form onSubmit={handleBulkImport} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Listado de Láminas</label>
                <textarea
                  className="home-input"
                  style={{ width: '100%', height: '140px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                  placeholder={'Ej:\n1, 2, 3, 15, 42\no uno por línea:\n10\n11\n12'}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Estado</label>
                <select className="home-input" style={{ width: '100%' }} value={bulkIsOwned ? 'true' : 'false'} onChange={e => setBulkIsOwned(e.target.value === 'true')}>
                  <option value="true">Tengo (Obtenidas)</option>
                  <option value="false">Me faltan (Faltantes)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsBulkOpen(false)} className="home-btn" style={{ background: '#EEE', color: '#555', flex: 1 }}>Cancelar</button>
                <button type="submit" className="home-btn" style={{ flex: 2, background: 'var(--teal)' }} disabled={bulkLoading}>
                  {bulkLoading ? 'Importando…' : 'Importar Láminas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVA LÁMINA */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
        }}>
          <div style={{ position: 'relative', background: '#FFF', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#999', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F0F0F0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              aria-label="Cerrar"
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--ink)', paddingRight: '2rem' }}>Registrar Lámina</h2>
            {sImageUrl && (
              <div style={{ width: '100%', height: '220px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', background: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
                <img src={sImageUrl} alt="Sticker" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            )}

            <form onSubmit={handleAddSticker} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Número o Código *</label>
                <input className="home-input" style={{ width: '100%' }} value={sNumber} onChange={e => setSNumber(e.target.value)} required placeholder="Ej: 42, CR7..." />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Estado</label>
                <select className="home-input" style={{ width: '100%' }} value={sIsOwned ? 'Tengo' : 'Faltante'} onChange={e => setSIsOwned(e.target.value === 'Tengo')}>
                  <option value="Tengo">Tengo (Obtenida)</option>
                  <option value="Faltante">Me falta</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo de Lámina</label>

                <select className="home-input" style={{ width: '100%' }} value={sStickerType} onChange={e => setSStickerType(e.target.value)}>
                  <option value="Normal">Normal</option>
                  <option value="Dorada">Dorada</option>
                  <option value="Holográfica">Holográfica</option>
                </select>
              </div>
              {sIsOwned && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Cantidad de Duplicadas</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button type="button" onClick={() => setSDupCount(Math.max(0, sDupCount - 1))} className="home-btn" style={{ padding: '0.4rem 1rem', background: '#EEE', color: '#333' }}>-</button>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{sDupCount}</span>
                    <button type="button" onClick={() => setSDupCount(sDupCount + 1)} className="home-btn" style={{ padding: '0.4rem 1rem', background: '#EEE', color: '#333' }}>+</button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Foto de la lámina (opcional)</label>
                <input type="file" accept="image/*" className="home-input file-input" style={{ width: '100%', padding: '0.4rem', color: '#555', fontSize: '0.85rem' }} onChange={e => setSImageFile(e.target.files?.[0] || null)} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="home-btn" style={{ flex: 1 }}>Guardar</button>
                {sId && (
                  <button type="button" onClick={handleDeleteSticker} className="home-btn" style={{ background: '#FFECEC', color: '#E63946' }}>🗑️</button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
