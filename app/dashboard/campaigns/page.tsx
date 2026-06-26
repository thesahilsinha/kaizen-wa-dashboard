'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  return raw ? JSON.parse(decodeURIComponent(raw)) : null
}

export default function CampaignsPage() {
  const [session, setSession] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', message_template: '', target_tags: '', delay_seconds: '10', daily_limit: '300' })

  useEffect(() => { const s = getSession(); setSession(s); if (s) fetchCampaigns(s) }, [])

  async function getSupabase(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(s.supabaseUrl, s.supabaseAnonKey)
  }

  async function fetchCampaigns(s: any) {
    const sb = await getSupabase(s)
    const { data } = await sb.from('campaigns').select('*').order('created_at', { ascending: false })
    setCampaigns(data || []); setLoading(false)
  }

  async function createCampaign() {
    const sb = await getSupabase(session)
    await sb.from('campaigns').insert({
      name: form.name, message_template: form.message_template,
      target_tags: form.target_tags ? form.target_tags.split(',').map(t => t.trim()) : null,
      delay_seconds: parseInt(form.delay_seconds), daily_limit: parseInt(form.daily_limit), status: 'draft'
    })
    setAdding(false); setForm({ name: '', message_template: '', target_tags: '', delay_seconds: '10', daily_limit: '300' })
    fetchCampaigns(session)
  }

  async function runCampaign(campaignId: string) {
    await fetch('/api/engine/campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: session.clientId, campaignId }) })
    fetchCampaigns(session)
  }

  if (!session) return null

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 10 }
  const inp: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', display: 'block' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Campaigns</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Bulk WhatsApp messaging</p>
          </div>
          <button onClick={() => setAdding(true)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + New Campaign
          </button>
        </div>

        {adding && (
          <div style={{ ...card, border: '1px solid #25D366', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#25D366', marginBottom: 14 }}>New Campaign</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={lbl}>Campaign Name</label><input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="June Offer" /></div>
              <div><label style={lbl}>Target Tags (comma separated)</label><input style={inp} value={form.target_tags} onChange={e => setForm(f => ({ ...f, target_tags: e.target.value }))} placeholder="lead, customer (blank = all)" /></div>
              <div><label style={lbl}>Delay Between Messages (sec)</label><input type="number" style={inp} value={form.delay_seconds} onChange={e => setForm(f => ({ ...f, delay_seconds: e.target.value }))} /></div>
              <div><label style={lbl}>Daily Limit</label><input type="number" style={inp} value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))} /></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Message (use {'{{name}}'} for contact name)</label>
              <textarea style={{ ...inp, height: 90, resize: 'none' }} value={form.message_template} onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} placeholder={`Hi {{name}}, check out our latest offer!`} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={createCampaign} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create</button>
              <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>Loading...</div>}

        {campaigns.map(c => (
          <div key={c.id} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{c.message_template}</div>
                <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 4 }}>Delay: {c.delay_seconds}s · Limit: {c.daily_limit}/day · Sent: {c.sent_count}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                  background: c.status === 'running' ? '#fef9c3' : c.status === 'done' ? '#dcfce7' : 'var(--surface2)',
                  color: c.status === 'running' ? '#a16207' : c.status === 'done' ? '#15803d' : 'var(--muted)'
                }}>{c.status}</span>
                {c.status === 'draft' && (
                  <button onClick={() => runCampaign(c.id)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    ▶ Run
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}