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

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 min-w-0 p-5 md:p-8 pt-16 md:pt-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>Welcome back, {session.businessName}</p>
        </div>

        {/* WA Status Banner */}
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-4 ${
          isConnected
            ? 'border-green-200 dark:border-green-900'
            : 'border-amber-200 dark:border-amber-900'
        }`} style={{ background: isConnected ? 'var(--green-bg)' : undefined, backgroundColor: !isConnected ? 'var(--surface2)' : undefined }}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${isConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
            {isConnected ? '📱' : '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm" style={{ color: 'var(--text)' }}>
              {isConnected ? 'WhatsApp connected' : 'WhatsApp not connected'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {isConnected ? `Active · ${waSession?.wa_number}` : 'Go to WA Connect to link your number'}
            </div>
          </div>
          {!isConnected && (
            <Link href="/dashboard/connect" className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: 'var(--green)' }}>
              Connect
            </Link>
          )}
          {isConnected && (
            <div className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--green)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Live
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          {[
            { label: 'Contacts', value: contacts || 0, href: '/dashboard/contacts', color: 'var(--text)' },
            { label: 'Active campaigns', value: campaigns || 0, href: '/dashboard/campaigns', color: '#16a34a' },
            { label: 'Messages sent', value: messages || 0, href: '/dashboard/conversations', color: '#2563eb' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} className="card card-hover p-4 md:p-5 block transition-all">
              <div className="text-2xl md:text-3xl font-bold font-mono mb-1" style={{ color: stat.color }}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Quick actions</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Add contacts', href: '/dashboard/contacts', icon: '👥' },
              { label: 'New campaign', href: '/dashboard/campaigns', icon: '📣' },
              { label: 'Edit chatbot', href: '/dashboard/chatbot', icon: '🤖' },
              { label: 'View messages', href: '/dashboard/conversations', icon: '💬' },
            ].map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 p-3 rounded-lg text-sm transition-all hover:scale-[1.01]"
                style={{ background: 'var(--surface2)', color: 'var(--text)' }}
              >
                <span>{action.icon}</span>
                <span className="font-medium text-xs">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}