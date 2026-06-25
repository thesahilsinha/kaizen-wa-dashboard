import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const cookieStore = cookies()
  const raw = cookieStore.get('ka_session')?.value
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default async function DashboardPage() {
  const session = getSession()
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
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm mb-8">Welcome back, {session.businessName}</p>

        {/* WA Status */}
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${isConnected ? 'bg-green-950 border-green-800' : 'bg-zinc-900 border-zinc-700'}`}>
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#25D366] animate-pulse' : 'bg-zinc-600'}`}/>
          <div>
            <div className="font-semibold text-sm">{isConnected ? 'WhatsApp Connected' : 'WhatsApp Not Connected'}</div>
            <div className="text-xs text-zinc-400">{isConnected ? waSession?.wa_number : 'Go to WA Connect to scan QR'}</div>
          </div>
          {!isConnected && (
            <a href="/dashboard/connect" className="ml-auto text-xs bg-[#25D366] text-black font-bold px-3 py-1.5 rounded-lg">Connect Now →</a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Contacts', value: contacts || 0, color: 'text-white' },
            { label: 'Active Campaigns', value: campaigns || 0, color: 'text-[#25D366]' },
            { label: 'Messages Sent', value: messages || 0, color: 'text-blue-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#111] border border-zinc-800 rounded-xl p-5">
              <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value.toLocaleString()}</div>
              <div className="text-zinc-500 text-xs font-mono mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}