import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

export default async function PaymentsPage() {
  const supabase = createClient(process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!, process.env.MASTER_SUPABASE_SERVICE_KEY!)
  const { data: clients } = await supabase.from('master_clients').select('*').order('next_renewal', { ascending: true })

  const totalMonthly = clients?.reduce((s, c) => s + (c.monthly_retainer || 0), 0) || 0
  const overdue = clients?.filter(c => c.payment_status === 'overdue').length || 0
  const due = clients?.filter(c => c.payment_status === 'due').length || 0

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '72px 24px 24px' }
  const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }

  return (
    <div style={pg}>
      <AdminSidebar />
      <main style={main} className="md:!pt-8">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Payments & Renewals</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Track all client billing</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Monthly Recurring', value: `₹${totalMonthly.toLocaleString()}`, color: '#16a34a' },
            { label: 'Due', value: due, color: '#d97706' },
            { label: 'Overdue', value: overdue, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '16px 20px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'monospace', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ ...card, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Client', 'Monthly', 'Billing Day', 'Next Renewal', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients?.map(client => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{client.business_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{client.login_email}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'monospace', color: '#16a34a', fontWeight: 600 }}>₹{client.monthly_retainer}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>{client.billing_day}th</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>{client.next_renewal || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                      background: client.payment_status === 'paid' ? '#dcfce7' : client.payment_status === 'due' ? '#fef9c3' : '#fee2e2',
                      color: client.payment_status === 'paid' ? '#15803d' : client.payment_status === 'due' ? '#a16207' : '#dc2626'
                    }}>{client.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}