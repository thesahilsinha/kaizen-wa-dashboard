'use client'
import { useState, useEffect } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

const sections = [
  {
    icon: '📱',
    title: 'Connecting WhatsApp',
    color: 'text-green-400',
    steps: [
      { title: 'Go to WA Connect', desc: 'Click "WA Connect" in the sidebar. This is where you link your WhatsApp number to the platform.' },
      { title: 'Click Connect WhatsApp', desc: 'A QR code will appear within a few seconds. Keep this page open.' },
      { title: 'Open WhatsApp on your phone', desc: 'Go to Settings → Linked Devices → Link a Device. Point your camera at the QR code.' },
      { title: 'Done — session is saved', desc: 'You only need to scan once. Even if the server restarts, your session reconnects automatically. You\'ll see a green "Connected" status on your dashboard.' },
    ],
    warning: 'Use a dedicated WhatsApp number for this — not your personal one. New numbers should start slow (50 messages/day) and increase weekly to avoid bans.'
  },
  {
    icon: '👥',
    title: 'Managing Contacts',
    color: 'text-blue-400',
    steps: [
      { title: 'Prepare your CSV file', desc: 'Create a spreadsheet with columns: name, phone, tags. Save as CSV.' },
      { title: 'Phone number format', desc: 'Always include country code WITHOUT + sign. For India: 919876543210 (91 + 10 digit number). Wrong: 9876543210 or +919876543210.' },
      { title: 'Tags format', desc: 'Separate multiple tags with pipe symbol: lead|vip or customer|premium. Tags let you target specific groups in campaigns.' },
      { title: 'Import via CSV', desc: 'Go to Contacts → Import CSV → select your file. Duplicates are handled automatically by phone number.' },
    ],
    example: 'name,phone,tags\nRahul Sharma,919876543210,lead|interested\nPriya Singh,919123456789,customer\nMohit Kumar,918765432109,vip|customer'
  },
  {
    icon: '🤖',
    title: 'Setting Up Chatbot',
    color: 'text-purple-400',
    steps: [
      { title: 'Go to Chatbot page', desc: 'Click Chatbot in sidebar. You\'ll see your existing rules listed by priority.' },
      { title: 'Add a keyword rule', desc: 'Click "+ Add Rule". Set type to Keyword, enter your trigger word (e.g. "price"), choose match type (Contains is most flexible), write your reply.' },
      { title: 'Use / for multiple keywords', desc: 'In the keyword field, separate words with /. Example: "price / cost / rate" — any of these words in a message will trigger the same reply.' },
      { title: 'Set priority', desc: 'Lower number = checked first. Set your most specific rules to priority 1-5, general ones to 10-20, and keep Default Fallback at 999.' },
      { title: 'Default Fallback', desc: 'Always keep one Default rule active. This replies when nothing else matches. Something like "Thanks for reaching out! We\'ll get back to you soon."' },
      { title: 'Toggle rules on/off', desc: 'Click the ON/OFF button on any rule to disable it temporarily without deleting it.' },
    ],
    example: 'IF contains "price / cost / rate"\n→ "Our plans start at ₹999/month. Reply DEMO to book a free call!"\n\nIF contains "demo / call / meeting"\n→ "Book your free demo here: calendly.com/yourlink"\n\nIF contains "hi / hello / hey / hii"\n→ "Welcome to XYZ! 👋 Reply:\\n1 for Pricing\\n2 for Demo\\n3 for Support"\n\nDEFAULT\n→ "Thanks for messaging! Our team will respond within 2 hours. 🙏"'
  },
  {
    icon: '📣',
    title: 'Running Campaigns',
    color: 'text-yellow-400',
    steps: [
      { title: 'Go to Campaigns', desc: 'Click Campaigns in sidebar. Click "+ New Campaign".' },
      { title: 'Write your message', desc: 'Use {{name}} to personalize — it gets replaced with each contact\'s name automatically. Keep messages conversational, not promotional-sounding.' },
      { title: 'Set target tags', desc: 'Leave blank to send to ALL contacts. Or enter tags like "lead" to only send to contacts tagged as leads.' },
      { title: 'Set delay', desc: 'Minimum 8 seconds between messages. Recommended: 10-15 seconds. Never set below 5 — high risk of ban.' },
      { title: 'Set daily limit', desc: 'Maximum 300/day for established numbers. New numbers: start at 50/day. Increase by 50 each week.' },
      { title: 'Click Run', desc: 'Campaign starts immediately. You can track progress (sent count) in the campaigns list. Status changes from draft → running → done.' },
    ],
    example: 'Hi {{name}}! 👋\n\nWe\'re running a special offer this week — 20% off on all our plans.\n\nInterested? Reply YES and we\'ll send you the details!\n\n– Team XYZ'
  },
  {
    icon: '💬',
    title: 'Conversations Inbox',
    color: 'text-cyan-400',
    steps: [
      { title: 'View all messages', desc: 'Conversations shows every inbound and outbound message in real time — chatbot replies, campaign messages, and anything sent manually.' },
      { title: 'Inbound vs Outbound', desc: 'Blue badge = message received from customer. Green badge = message sent by your chatbot or campaign.' },
      { title: 'Source column', desc: '"chatbot" means auto-replied by bot. "campaign" means sent as part of a bulk campaign. This helps you understand how customers are engaging.' },
    ],
    warning: 'Conversations shows last 100 messages. For full history, check your Supabase database directly.'
  },
  {
    icon: '⚠️',
    title: 'Anti-Ban Best Practices',
    color: 'text-red-400',
    steps: [
      { title: 'Never blast messages', desc: 'Always use delays. WhatsApp detects human-like behavior. 8-15 second delays between messages looks natural.' },
      { title: 'Daily limits by number age', desc: 'New number (week 1): 50/day. Week 2: 100/day. Week 3: 150/day. Month 2+: up to 300/day.' },
      { title: 'Message quality matters', desc: 'Avoid words like "FREE", "OFFER", "CLICK HERE", "WIN". Write like a real person, not a promotional SMS.' },
      { title: 'Only message warm contacts', desc: 'People who know your business are less likely to report you. Cold outreach to unknown numbers = high ban risk.' },
      { title: 'If number gets banned', desc: 'Don\'t panic. Get a new SIM, warm it up for 1 week with normal usage, then reconnect via WA Connect. Your contacts and campaigns are all saved.' },
    ],
    warning: 'WhatsApp bans are based on user reports and behavioral patterns — not just volume. Quality messages to the right people rarely get banned.'
  },
]

export default function GuidePage() {
  const [session, setSession] = useState<any>(null)
  const [open, setOpen] = useState<number | null>(0)

  useEffect(() => { setSession(getSession()) }, [])
  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">📖 User Guide</h1>
          <p className="text-zinc-500 text-sm mt-1">Complete guide for Kaizen WA 360 — everything you need to know</p>
        </div>

        <div className="space-y-3">
          {sections.map((section, i) => (
            <div key={i} className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <div className={`font-bold ${section.color}`}>{section.title}</div>
                    <div className="text-zinc-600 text-xs mt-0.5">{section.steps.length} steps</div>
                  </div>
                </div>
                <span className="text-zinc-500 text-lg">{open === i ? '▲' : '▼'}</span>
              </button>

              {open === i && (
                <div className="border-t border-zinc-800">
                  {/* Steps */}
                  <div className="p-5 space-y-4">
                    {section.steps.map((step, j) => (
                      <div key={j} className="flex gap-4">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${section.color} border-current bg-transparent`}>
                          {j + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white mb-0.5">{step.title}</div>
                          <div className="text-zinc-400 text-sm leading-relaxed">{step.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Example */}
                  {section.example && (
                    <div className="mx-5 mb-5">
                      <div className="text-zinc-500 text-xs font-mono uppercase tracking-wider mb-2">Example</div>
                      <pre className="bg-[#0a0a0a] border border-zinc-800 rounded-lg p-4 text-zinc-300 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                        {section.example}
                      </pre>
                    </div>
                  )}

                  {/* Warning */}
                  {section.warning && (
                    <div className="mx-5 mb-5 bg-yellow-950 border border-yellow-800 rounded-lg p-4 flex gap-3">
                      <span className="text-yellow-500 flex-shrink-0">⚠️</span>
                      <p className="text-yellow-200 text-sm leading-relaxed">{section.warning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick reference */}
        <div className="mt-8 bg-[#111] border border-zinc-800 rounded-xl p-6">
          <h2 className="font-bold mb-4 text-[#25D366]">⚡ Quick Reference</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Max messages/day', value: '300 (established number)' },
              { label: 'Min delay between messages', value: '8 seconds' },
              { label: 'Phone number format', value: '91XXXXXXXXXX (no + sign)' },
              { label: 'CSV columns', value: 'name, phone, tags' },
              { label: 'Multiple keywords', value: 'Use / separator: "hi / hello"' },
              { label: 'Personalization variable', value: '{{name}} in message template' },
              { label: 'Default fallback priority', value: '999 (always last)' },
              { label: 'Session expiry', value: 'Never — auto reconnects' },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="text-zinc-500 text-xs font-mono uppercase">{item.label}</div>
                <div className="text-white text-sm font-mono">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}