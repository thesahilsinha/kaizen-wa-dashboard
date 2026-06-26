'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  return raw ? JSON.parse(decodeURIComponent(raw)) : null
}

const emptyRule = { type: 'keyword', trigger_keyword: '', match_type: 'contains', reply: '', priority: 10, is_active: true }

export default function ChatbotPage() {
  const [session, setSession] = useState<any>(null)
  const [flows, setFlows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyRule })

  useEffect(() => { const s = getSession(); setSession(s); if (s) fetchFlows(s) }, [])

  async function getSupabase(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(s.supabaseUrl, s.supabaseAnonKey)
  }

  async function fetchFlows(s: any) {
    const sb = await getSupabase(s)
    const { data } = await sb.from('chatbot_flows').select('*').order('priority')
    setFlows(data || []); setLoading(false)
  }

  async function addRule() {
    const sb = await getSupabase(session)
    await sb.from('chatbot_flows').insert(form)
    setForm({ ...emptyRule }); setAdding(false); fetchFlows(session)
  }

  async function toggleRule(id: string, current: boolean) {
    const sb = await getSupabase(session)
    await sb.from('chatbot_flows').update({ is_active: !current }).eq('id', id)
    fetchFlows(session)
  }

  async function deleteRule(id: string) {
    const sb = await getSupabase(session)
    await sb.from('chatbot_flows').delete().eq('id', id)
    fetchFlows(session)
  }

  if (!session) return null

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }
  const inp: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', display: 'block' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Chatbot Flows</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Rules checked top to bottom. First match wins.</p>
          </div>
          <button onClick={() => setAdding(true)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Add Rule
          </button>
        </div>

        {adding && (
          <div style={{ background: 'var(--surface)', border: '1px solid #25D366', borderRadius: 12, padding: 20, marginBottom: 16, marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#25D366', marginBottom: 14 }}>New Rule</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={lbl}>Type</label>
                <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="keyword">Keyword</option>
                  <option value="default">Default Fallback</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Match Type</label>
                <select style={inp} value={form.match_type} onChange={e => setForm(f => ({ ...f, match_type: e.target.value }))}>
                  <option value="contains">Contains</option>
                  <option value="exact">Exact</option>
                  <option value="starts_with">Starts With</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Keyword (use / for multiple)</label>
                <input style={inp} value={form.trigger_keyword} onChange={e => setForm(f => ({ ...f, trigger_keyword: e.target.value }))} placeholder="price / cost / rate" />
              </div>
              <div>
                <label style={lbl}>Priority (lower = first)</label>
                <input type="number" style={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) }))} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Reply Message</label>
              <textarea style={{ ...inp, height: 80, resize: 'none' }} value={form.reply} onChange={e => setForm(f => ({ ...f, reply: e.target.value }))} placeholder="Our pricing starts at ₹999/month!" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={addRule} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save Rule</button>
              <button onClick={() => setAdding(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 13 }}>Loading...</div>}
          {flows.map(flow => (
            <div key={flow.id} style={{ ...card, opacity: flow.is_active ? 1 : 0.5 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 4 }}>
                    IF {flow.match_type}
                  </span>
                  {flow.trigger_keyword && (
                    <span style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--text)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                      {flow.trigger_keyword}
                    </span>
                  )}
                  {flow.type === 'default' && (
                    <span style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 4 }}>DEFAULT FALLBACK</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)' }}>→ {flow.reply}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'monospace' }}>p:{flow.priority}</span>
                <button onClick={() => toggleRule(flow.id, flow.is_active)} style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: flow.is_active ? '#dcfce7' : 'var(--surface2)',
                  color: flow.is_active ? '#15803d' : 'var(--muted)'
                }}>{flow.is_active ? 'ON' : 'OFF'}</button>
                <button onClick={() => deleteRule(flow.id)} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}