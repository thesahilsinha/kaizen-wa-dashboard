'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  return raw ? JSON.parse(decodeURIComponent(raw)) : null
}

export default function ConversationsPage() {
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) {
      import('@supabase/supabase-js').then(({ createClient }) => {
        createClient(s.supabaseUrl, s.supabaseAnonKey)
          .from('messages_log').select('*').order('sent_at', { ascending: false }).limit(100)
          .then(({ data }) => { setMessages(data || []); setLoading(false) })
      })
    }
  }, [])

  if (!session) return null

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-8">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Conversations</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Last 100 messages</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Phone', 'Direction', 'Message', 'Source', 'Time'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading...</td></tr>}
              {messages.map(msg => (
                <tr key={msg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)' }}>{msg.contact_phone}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
                      background: msg.direction === 'inbound' ? '#eff6ff' : '#f0fdf4',
                      color: msg.direction === 'inbound' ? '#2563eb' : '#15803d'
                    }}>{msg.direction}</span>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.content}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--muted2)', fontFamily: 'monospace' }}>{msg.source}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--muted2)' }}>{new Date(msg.sent_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {!loading && messages.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No messages yet</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}