'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default function ConversationsPage() {
  const [session, setSession] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) fetchMessages(s)
  }, [])

  async function fetchMessages(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(s.supabaseUrl, s.supabaseAnonKey)
    const { data } = await supabase.from('messages_log').select('*').order('sent_at', { ascending: false }).limit(100)
    setMessages(data || []); setLoading(false)
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">Conversations</h1>
        <p className="text-zinc-500 text-sm mb-6">Last 100 messages</p>

        <div className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono uppercase">
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Direction</th>
                <th className="text-left p-4">Message</th>
                <th className="text-left p-4">Source</th>
                <th className="text-left p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-8 text-center text-zinc-600">Loading...</td></tr>}
              {messages.map(msg => (
                <tr key={msg.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 text-sm">
                  <td className="p-4 font-mono text-zinc-400">{msg.contact_phone}</td>
                  <td className="p-4">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${msg.direction === 'inbound' ? 'bg-blue-900 text-blue-400' : 'bg-green-900 text-green-400'}`}>
                      {msg.direction}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-300 max-w-xs truncate">{msg.content}</td>
                  <td className="p-4 text-zinc-600 text-xs font-mono">{msg.source}</td>
                  <td className="p-4 text-zinc-600 text-xs font-mono">{new Date(msg.sent_at).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {!loading && messages.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-600">No messages yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}