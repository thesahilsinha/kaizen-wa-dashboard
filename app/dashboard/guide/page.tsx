'use client'
import { useState, useEffect } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

const sections = [
  { icon: '📱', title: 'Getting Started', content: 'Welcome to Kaizen WA 360! Start by connecting your WhatsApp number. Go to WA Connect in the sidebar, click "Connect WhatsApp" and scan the QR code with your phone. You only need to do this once — your session is saved.' },
  { icon: '👥', title: 'Contacts', content: 'Import contacts via CSV file. Format: name, phone (with country code like 919876543210), tags (pipe separated like lead|vip). Go to Contacts → Import CSV. Use tags to filter contacts for specific campaigns.' },
  { icon: '🤖', title: 'Chatbot', content: 'Set up automatic replies for incoming messages. Go to Chatbot → Add Rule. Choose a keyword (e.g. "price"), match type (contains/exact), and set your reply message. Add a Default Fallback rule for messages that match nothing. Rules are checked by priority — lower number = checked first.' },
  { icon: '📣', title: 'Campaigns', content: 'Send bulk messages to your contacts. Go to Campaigns → New Campaign. Write your message using {{name}} for personalization. Set delay between messages (minimum 8 seconds recommended) and daily limit (max 300/day). Select Run when ready.' },
  { icon: '💬', title: 'Conversations', content: 'View all incoming and outgoing messages in the Conversations tab. Messages are logged in real time — both chatbot replies and campaign messages appear here with full history.' },
  { icon: '⚠️', title: 'Best Practices', content: 'To avoid WhatsApp bans: never send more than 300 messages/day, keep delays at 8-15 seconds, avoid spammy content, only message people who know your business, warm up new numbers slowly (start with 50/day, increase weekly).' },
]

export default function GuidePage() {
  const [session, setSession] = useState<any>(null)
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => { setSession(getSession()) }, [])
  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">📖 User Guide</h1>
          <p className="text-zinc-500 text-sm mt-1">Complete guide for Kaizen WA 360 — click any section to expand</p>
        </div>

        <div className="space-y-2">
          {sections.map((s, i) => (
            <div key={i} className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <span className="font-semibold">{s.title}</span>
                </div>
                <span className="text-zinc-500 text-sm">{open === i ? '▲' : '▼'}</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800 pt-4">
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}