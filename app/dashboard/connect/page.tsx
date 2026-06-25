'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'
import dynamic from 'next/dynamic'

const QRModal = dynamic(() => import('@/components/QRModal'), { ssr: false })

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default function ConnectPage() {
  const [session, setSession] = useState<any>(null)
  const [waStatus, setWaStatus] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) fetchStatus(s)
  }, [])

  async function fetchStatus(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(s.supabaseUrl, s.supabaseAnonKey)
    const { data } = await supabase.from('wa_sessions').select('*').eq('session_id', s.clientId).single()
    setWaStatus(data); setLoading(false)
  }

  if (!session) return null
  const isConnected = waStatus?.status === 'connected'

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2 text-center">WhatsApp Connection</h1>
          <p className="text-zinc-500 text-sm mb-8 text-center">Connect your WhatsApp number to start automating</p>

          {!loading && isConnected && (
            <div className="bg-green-950 border border-green-800 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="font-bold text-lg text-green-400">Connected</div>
              <div className="text-zinc-400 text-sm mt-2 font-mono">{waStatus?.wa_number}</div>
              <div className="text-zinc-600 text-xs mt-1">Last seen: {waStatus?.last_seen ? new Date(waStatus.last_seen).toLocaleString('en-IN') : 'Unknown'}</div>
              <button
                onClick={() => { setShowQR(true); setWaStatus(null) }}
                className="mt-6 text-xs text-zinc-500 hover:text-red-400 transition-all"
              >
                Reconnect with different number
              </button>
            </div>
          )}

          {!loading && !isConnected && !showQR && (
            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">📱</div>
              <div className="font-bold text-lg mb-2">Not Connected</div>
              <p className="text-zinc-500 text-sm mb-6">Scan a QR code with WhatsApp to connect your number. You only need to do this once.</p>
              <button
                onClick={() => setShowQR(true)}
                className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-6 py-3 rounded-xl transition-all"
              >
                Connect WhatsApp
              </button>
            </div>
          )}

          {showQR && (
            <QRModal
              clientId={session.clientId}
              onConnected={() => { setShowQR(false); fetchStatus(session) }}
            />
          )}

          {loading && (
            <div className="text-center text-zinc-600 py-16">Checking connection status...</div>
          )}
        </div>
      </main>
    </div>
  )
}