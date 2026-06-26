'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'
import Link from 'next/link'

export default function AdminPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!, process.env.NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY!)
      .from('master_clients').select('*').order('onboarded_at', { ascending: false })
      .then(({ data }) => { setClients(data || []); setLoading(false) })
  }, [])

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 10 }

  return (
    <div style={pg}>
      <AdminSidebar />
      <main style={main} className="md:!pt-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>All Clients</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{clients.length} total clients</p>
          </div>
          <Link href="/admin/add-client" style={{ background: '#25D366', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            + Add Client
          </Link>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 14 }}>Loading...</div>}

        {clients.map(client => (
          <div key={client.id} style={card}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{client.business_name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, fontFamily: 'monospace' }}>{client.login_email}</div>
                {client.notes && <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 3 }}>{client.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>₹{client.monthly_retainer}/mo</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Setup: ₹{client.setup_fee}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                    background: client.payment_status === 'paid' ? '#dcfce7' : client.payment_status === 'due' ? '#fef9c3' : '#fee2e2',
                    color: client.payment_status === 'paid' ? '#15803d' : client.payment_status === 'due' ? '#a16207' : '#dc2626'
                  }}>{client.payment_status}</span>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{client.next_renewal ? `Renews ${client.next_renewal}` : '—'}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: client.is_active ? '#22c55e' : '#71717a', flexShrink: 0 }} />
              </div>
            </div>
          </div>
        ))}

        {!loading && clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)', fontSize: 14 }}>
            No clients yet. <Link href="/admin/add-client" style={{ color: '#16a34a', fontWeight: 600 }}>Add your first client →</Link>
          </div>
        )}
      </main>
    </div>
  )
}