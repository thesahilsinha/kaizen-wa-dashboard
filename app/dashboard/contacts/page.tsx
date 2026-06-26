'use client'
import { useEffect, useState, useRef } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  return raw ? JSON.parse(decodeURIComponent(raw)) : null
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const s = getSession(); setSession(s); if (s) fetchContacts(s) }, [])

  async function fetchContacts(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    const { data } = await createClient(s.supabaseUrl, s.supabaseAnonKey).from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data || []); setLoading(false)
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !session) return
    const text = await file.text()
    const lines = text.split('\n').slice(1).filter(Boolean)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(session.supabaseUrl, session.supabaseAnonKey)
    const rows = lines.map(line => { const [name, phone, tags] = line.split(',').map(s => s.trim()); return { name, phone, tags: tags ? tags.split('|') : [] } })
    await supabase.from('contacts').upsert(rows, { onConflict: 'phone' })
    fetchContacts(session)
  }

  const filtered = contacts.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
  if (!session) return null

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-8">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Contacts</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{contacts.length} contacts</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', width: 180 }} />
            <button onClick={() => fileRef.current?.click()} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={importCSV} />
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 12 }}>CSV format: name, phone (with country code e.g. 919876543210), tags (pipe separated)</p>

        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                {['Name', 'Phone', 'Tags', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading...</td></tr>}
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{c.name}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, fontFamily: 'monospace', color: 'var(--muted)' }}>{c.phone}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {c.tags?.map((t: string) => (
                        <span key={t} style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 100, border: '1px solid var(--border)' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: c.opted_out ? '#fee2e2' : '#dcfce7', color: c.opted_out ? '#dc2626' : '#15803d' }}>
                      {c.opted_out ? 'opted out' : 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No contacts. Import a CSV to get started.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}