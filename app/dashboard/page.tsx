import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import ClientSidebar from '@/components/ClientSidebar'
import Link from 'next/link'

async function getSession() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('ka_session')?.value
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const supabase = createClient(session.supabaseUrl, session.supabaseAnonKey)
  const [{ count: contacts }, { count: campaigns }, { data: waSession }, { count: messages }] = await Promise.all([
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'running'),
    supabase.from('wa_sessions').select('*').eq('session_id', session.clientId).single(),
    supabase.from('messages_log').select('*', { count: 'exact', head: true })
  ])

  const isConnected = waSession?.status === 'connected'

  const pg: React.CSSProperties = { display: 'flex', minHeight: '100vh', background: 'var(--bg)' }
  const main: React.CSSProperties = { flex: 1, minWidth: 0, padding: '24px 24px 24px 24px', paddingTop: 72 }

  return (
    <div style={pg}>
      <ClientSidebar businessName={session.businessName} />
      <main style={main} className="md:!pt-8">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Welcome back, {session.businessName}</p>
        </div>

        {/* WA Status */}
        <div style={{
          background: isConnected ? '#f0fdf4' : 'var(--surface)',
          border: `1px solid ${isConnected ? '#bbf7d0' : 'var(--border)'}`,
          borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: isConnected ? '#dcfce7' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            {isConnected ? '📱' : '⚠️'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: isConnected ? '#15803d' : 'var(--text)' }}>
              {isConnected ? 'WhatsApp connected' : 'WhatsApp not connected'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {isConnected ? `Active · ${waSession?.wa_number}` : 'Scan QR code to connect your number'}
            </div>
          </div>
          {!isConnected && (
            <Link href="/dashboard/connect" style={{ background: '#25D366', color: '#fff', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
              Connect
            </Link>
          )}
          {isConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: '#16a34a', flexShrink: 0 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Contacts', value: contacts || 0, href: '/dashboard/contacts', color: 'var(--text)' },
            { label: 'Active campaigns', value: campaigns || 0, href: '/dashboard/campaigns', color: '#16a34a' },
            { label: 'Messages sent', value: messages || 0, href: '/dashboard/conversations', color: '#2563eb' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textDecoration: 'none', display: 'block', transition: 'border-color 0.15s' }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace', color: stat.color, marginBottom: 4 }}>{stat.value.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: 14 }}>Quick actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { label: 'Import contacts', href: '/dashboard/contacts', icon: '👥' },
              { label: 'New campaign', href: '/dashboard/campaigns', icon: '📣' },
              { label: 'Edit chatbot', href: '/dashboard/chatbot', icon: '🤖' },
              { label: 'View messages', href: '/dashboard/conversations', icon: '💬' },
            ].map(action => (
              <Link key={action.label} href={action.href} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}