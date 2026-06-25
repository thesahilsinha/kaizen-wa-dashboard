'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default function CampaignsPage() {
  const [session, setSession] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', message_template: '', target_tags: '', delay_seconds: '10', daily_limit: '300' })

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) fetchCampaigns(s)
  }, [])

  async function getSupabase(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(s.supabaseUrl, s.supabaseAnonKey)
  }

  async function fetchCampaigns(s: any) {
    const supabase = await getSupabase(s)
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
    setCampaigns(data || []); setLoading(false)
  }

  async function createCampaign() {
    const supabase = await getSupabase(session)
    await supabase.from('campaigns').insert({
      name: form.name,
      message_template: form.message_template,
      target_tags: form.target_tags ? form.target_tags.split(',').map(t => t.trim()) : null,
      delay_seconds: parseInt(form.delay_seconds),
      daily_limit: parseInt(form.daily_limit),
      status: 'draft'
    })
    setAdding(false); setForm({ name: '', message_template: '', target_tags: '', delay_seconds: '10', daily_limit: '300' })
    fetchCampaigns(session)
  }

  async function runCampaign(campaignId: string) {
    if (!session) return
    await fetch('/api/engine/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: session.clientId, campaignId })
    })
    fetchCampaigns(session)
  }

  if (!session) return null
  const input = "bg-[#0a0a0a] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#25D366] w-full"

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-zinc-500 text-sm mt-1">Bulk WhatsApp messaging</p>
          </div>
          <button onClick={() => setAdding(true)} className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-4 py-2 rounded-lg text-sm">
            + New Campaign
          </button>
        </div>

        {adding && (
          <div className="bg-[#111] border border-[#25D366] rounded-xl p-5 mb-6">
            <h3 className="font-semibold mb-4 text-[#25D366]">New Campaign</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Campaign Name</label><input className={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="June Offer"/></div>
              <div><label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Target Tags (comma separated)</label><input className={input} value={form.target_tags} onChange={e => setForm(f => ({ ...f, target_tags: e.target.value }))} placeholder="lead, customer (blank = all)"/></div>
              <div><label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Delay Between Messages (sec)</label><input type="number" className={input} value={form.delay_seconds} onChange={e => setForm(f => ({ ...f, delay_seconds: e.target.value }))}/></div>
              <div><label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Daily Limit</label><input type="number" className={input} value={form.daily_limit} onChange={e => setForm(f => ({ ...f, daily_limit: e.target.value }))}/></div>
            </div>
            <div className="mb-4">
              <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Message (use {"{{name}}"} for contact name)</label>
              <textarea className={input + ' h-24 resize-none'} value={form.message_template} onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} placeholder="Hi {{name}}, check out our latest offer!"/>
            </div>
            <div className="flex gap-3">
              <button onClick={createCampaign} className="bg-[#25D366] text-black font-bold px-4 py-2 rounded-lg text-sm">Create</button>
              <button onClick={() => setAdding(false)} className="text-zinc-400 text-sm px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {loading && <div className="text-zinc-600 text-sm text-center p-8">Loading...</div>}
          {campaigns.map(c => (
            <div key={c.id} className="bg-[#111] border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-zinc-500 text-xs font-mono mt-1 max-w-md truncate">{c.message_template}</div>
                <div className="text-zinc-600 text-xs mt-1">Delay: {c.delay_seconds}s · Limit: {c.daily_limit}/day · Sent: {c.sent_count}</div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                  c.status === 'running' ? 'bg-yellow-900 text-yellow-400 animate-pulse' :
                  c.status === 'done' ? 'bg-green-900 text-green-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>{c.status}</span>
                {c.status === 'draft' && (
                  <button onClick={() => runCampaign(c.id)} className="text-xs bg-[#25D366] text-black font-bold px-3 py-1.5 rounded-lg">
                    ▶ Run
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}