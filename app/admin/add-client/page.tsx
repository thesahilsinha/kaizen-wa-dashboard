'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AddClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '', login_email: '', supabase_url: '',
    supabase_anon_key: '', supabase_service_key: '', domain: '',
    setup_fee: '', monthly_retainer: '', billing_day: '1',
    next_renewal: '', payment_status: 'paid', notes: ''
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    setLoading(true); setError('')
    const res = await fetch('/api/admin/add-client', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    router.push('/admin')
  }

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px', maxWidth: 720 }
  const section: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }
  const label: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)', marginBottom: 6 }
  const input: React.CSSProperties = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', display: 'block' }
  const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }

  return (
    <div style={pg}>
      <AdminSidebar />
      <main style={main} className="md:!pt-8">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Add New Client</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Pricing is fully flexible — set per client</p>
        </div>

        <div style={section}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 14 }}>Business Info</div>
          <div style={grid2}>
            <div><label style={label}>Business Name</label><input style={input} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="ABC Traders" /></div>
            <div><label style={label}>Login Email</label><input style={input} value={form.login_email} onChange={e => set('login_email', e.target.value)} placeholder="client@gmail.com" /></div>
            <div><label style={label}>Domain (optional)</label><input style={input} value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="client.com" /></div>
          </div>
        </div>

        <div style={section}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 14 }}>Supabase Keys</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={label}>Supabase URL</label><input style={input} value={form.supabase_url} onChange={e => set('supabase_url', e.target.value)} placeholder="https://xxx.supabase.co" /></div>
            <div><label style={label}>Anon Key</label><input style={input} value={form.supabase_anon_key} onChange={e => set('supabase_anon_key', e.target.value)} placeholder="eyJh..." /></div>
            <div><label style={label}>Service Role Key</label><input style={input} value={form.supabase_service_key} onChange={e => set('supabase_service_key', e.target.value)} placeholder="eyJh..." /></div>
          </div>
        </div>

        <div style={section}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 14 }}>Billing</div>
          <div style={grid2}>
            <div><label style={label}>Setup Fee (₹)</label><input type="number" style={input} value={form.setup_fee} onChange={e => set('setup_fee', e.target.value)} placeholder="20000" /></div>
            <div><label style={label}>Monthly Retainer (₹)</label><input type="number" style={input} value={form.monthly_retainer} onChange={e => set('monthly_retainer', e.target.value)} placeholder="3000" /></div>
            <div><label style={label}>Billing Day</label><input type="number" style={input} value={form.billing_day} onChange={e => set('billing_day', e.target.value)} placeholder="5" /></div>
            <div><label style={label}>Next Renewal</label><input type="date" style={input} value={form.next_renewal} onChange={e => set('next_renewal', e.target.value)} /></div>
            <div>
              <label style={label}>Payment Status</label>
              <select style={input} value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option value="paid">Paid</option>
                <option value="due">Due</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={label}>Notes</label>
            <textarea style={{ ...input, height: 72, resize: 'none' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="3 month deal, custom domain included..." />
          </div>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Adding Client...' : 'Add Client'}
        </button>
      </main>
    </div>
  )
}