'use client'
import { useEffect, useState } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

const emptyRule = { type: 'keyword', trigger_keyword: '', match_type: 'contains', reply: '', priority: 10, is_active: true }

export default function ChatbotPage() {
  const [session, setSession] = useState<any>(null)
  const [flows, setFlows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ ...emptyRule })

  useEffect(() => {
    const s = getSession(); setSession(s)
    if (s) fetchFlows(s)
  }, [])

  async function getSupabase(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(s.supabaseUrl, s.supabaseAnonKey)
  }

  async function fetchFlows(s: any) {
    const supabase = await getSupabase(s)
    const { data } = await supabase.from('chatbot_flows').select('*').order('priority')
    setFlows(data || []); setLoading(false)
  }

  async function addRule() {
    const supabase = await getSupabase(session)
    await supabase.from('chatbot_flows').insert(form)
    setForm({ ...emptyRule }); setAdding(false)
    fetchFlows(session)
  }

  async function toggleRule(id: string, current: boolean) {
    const supabase = await getSupabase(session)
    await supabase.from('chatbot_flows').update({ is_active: !current }).eq('id', id)
    fetchFlows(session)
  }

  async function deleteRule(id: string) {
    const supabase = await getSupabase(session)
    await supabase.from('chatbot_flows').delete().eq('id', id)
    fetchFlows(session)
  }

  if (!session) return null

  const input = "bg-[#0a0a0a] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#25D366]"

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Chatbot Flows</h1>
            <p className="text-zinc-500 text-sm mt-1">Rules are checked top to bottom. First match wins.</p>
          </div>
          <button onClick={() => setAdding(true)} className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-4 py-2 rounded-lg text-sm">
            + Add Rule
          </button>
        </div>

        {adding && (
          <div className="bg-[#111] border border-[#25D366] rounded-xl p-5 mb-4">
            <h3 className="font-semibold mb-4 text-[#25D366]">New Rule</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Type</label>
                <select className={input + ' w-full'} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="keyword">Keyword</option>
                  <option value="default">Default Fallback</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Match Type</label>
                <select className={input + ' w-full'} value={form.match_type} onChange={e => setForm(f => ({ ...f, match_type: e.target.value }))}>
                  <option value="contains">Contains</option>
                  <option value="exact">Exact</option>
                  <option value="starts_with">Starts With</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Keyword (use / for multiple)</label>
                <input className={input + ' w-full'} value={form.trigger_keyword} onChange={e => setForm(f => ({ ...f, trigger_keyword: e.target.value }))} placeholder="price / cost / rate"/>
              </div>
              <div>
                <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Priority (lower = first)</label>
                <input type="number" className={input + ' w-full'} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: parseInt(e.target.value) }))}/>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-zinc-500 text-xs font-mono uppercase block mb-1">Reply Message</label>
              <textarea className={input + ' w-full h-20 resize-none'} value={form.reply} onChange={e => setForm(f => ({ ...f, reply: e.target.value }))} placeholder="Our pricing starts at ₹999/month!"/>
            </div>
            <div className="flex gap-3">
              <button onClick={addRule} className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-4 py-2 rounded-lg text-sm">Save Rule</button>
              <button onClick={() => setAdding(false)} className="text-zinc-400 hover:text-white text-sm px-4 py-2">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {loading && <div className="text-zinc-600 text-sm p-8 text-center">Loading...</div>}
          {flows.map(flow => (
            <div key={flow.id} className={`bg-[#111] border rounded-xl p-4 flex items-center gap-4 ${flow.is_active ? 'border-zinc-800' : 'border-zinc-900 opacity-50'}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-blue-400">IF {flow.match_type}</span>
                  {flow.trigger_keyword && <span className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded font-mono">{flow.trigger_keyword}</span>}
                  {flow.type === 'default' && <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded font-mono">DEFAULT FALLBACK</span>}
                </div>
                <div className="text-sm text-zinc-300">→ {flow.reply}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-600">p:{flow.priority}</span>
                <button onClick={() => toggleRule(flow.id, flow.is_active)} className={`text-xs px-2 py-1 rounded font-mono ${flow.is_active ? 'bg-green-900 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {flow.is_active ? 'ON' : 'OFF'}
                </button>
                <button onClick={() => deleteRule(flow.id)} className="text-xs text-zinc-600 hover:text-red-400">✕</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}