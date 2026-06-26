'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'
import dynamic from 'next/dynamic'

const QRModal = dynamic(() => import('@/components/QRModal'), { ssr: false })

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  return raw ? JSON.parse(decodeURIComponent(raw)) : null
}

export default function ConnectPage() {
  const [session, setSession] = useState<any>(null)
  const [waStatus, setWaStatus] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) fetchStatus(s)
  }, [])

  async function fetchStatus(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    const { data } = await createClient(s.supabaseUrl, s.supabaseAnonKey)
      .from('wa_sessions').select('*').eq('session_id', s.clientId).single()
    setWaStatus(data); setLoading(false)
  }

  if (!session) return null
  const isConnected = waStatus?.status === 'connected'

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-0">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>WhatsApp Connection</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Connect your number to start automating</p>
          </div>

          {loading && <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: 40 }}>Checking connection...</div>}

          {!loading && isConnected && !showQR && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#15803d', marginBottom: 4 }}>Connected</div>
              <div style={{ fontSize: 13, color: '#16a34a', fontFamily: 'monospace' }}>{waStatus?.wa_number}</div>
              <div style={{ fontSize: 12, color: '#4ade80', marginTop: 4 }}>
                Last seen: {waStatus?.last_seen ? new Date(waStatus.last_seen).toLocaleString('en-IN') : 'Unknown'}
              </div>
              <button onClick={() => { setShowQR(true); setWaStatus(null) }} style={{ marginTop: 20, background: 'none', border: 'none', color: '#6b7280', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
                Reconnect with different number
              </button>
            </div>
          )}

          {!loading && !isConnected && !showQR && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Not Connected</div>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Scan a QR code with WhatsApp to connect your number. You only need to do this once.
              </p>
              <button onClick={() => setShowQR(true)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Connect WhatsApp
              </button>
            </div>
          )}

          {showQR && (
            <QRModal clientId={session.clientId} onConnected={() => { setShowQR(false); fetchStatus(session) }} />
          )}
        </div>
      </main>
    </div>
  )
}