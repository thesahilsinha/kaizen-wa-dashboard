'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AddClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '', login_email: '', supabase_url: '',
    supabase_anon_key: '', supabase_service_key: '', domain: '',
    setup_fee: '', monthly_retainer: '', billing_day: '1',
    next_renewal: '', payment_status: 'paid', notes: ''
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/add-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    router.push('/admin')
  }

  const input = "w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#25D366]"
  const label = "block text-zinc-500 text-xs font-mono uppercase tracking-wider mb-1"

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-2">Add New Client</h1>
        <p className="text-zinc-500 text-sm mb-8">Fill in client details. Pricing is fully flexible.</p>

        <div className="space-y-6">
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-[#25D366]">Business Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={label}>Business Name</label><input className={input} value={form.business_name} onChange={e => set('business_name', e.target.value)} placeholder="ABC Traders"/></div>
              <div><label className={label}>Login Email (Gmail)</label><input className={input} value={form.login_email} onChange={e => set('login_email', e.target.value)} placeholder="client@gmail.com"/></div>
              <div><label className={label}>Domain (optional)</label><input className={input} value={form.domain} onChange={e => set('domain', e.target.value)} placeholder="client.com"/></div>
            </div>
          </div>

          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-[#25D366]">Supabase Keys</h2>
            <div className="grid grid-cols-1 gap-4">
              <div><label className={label}>Supabase URL</label><input className={input} value={form.supabase_url} onChange={e => set('supabase_url', e.target.value)} placeholder="https://xxx.supabase.co"/></div>
              <div><label className={label}>Anon Key</label><input className={input} value={form.supabase_anon_key} onChange={e => set('supabase_anon_key', e.target.value)} placeholder="eyJh..."/></div>
              <div><label className={label}>Service Role Key</label><input className={input} value={form.supabase_service_key} onChange={e => set('supabase_service_key', e.target.value)} placeholder="eyJh..."/></div>
            </div>
          </div>

          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 text-[#25D366]">Billing (Your negotiated terms)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={label}>Setup Fee (₹)</label><input type="number" className={input} value={form.setup_fee} onChange={e => set('setup_fee', e.target.value)} placeholder="20000"/></div>
              <div><label className={label}>Monthly Retainer (₹)</label><input type="number" className={input} value={form.monthly_retainer} onChange={e => set('monthly_retainer', e.target.value)} placeholder="3000"/></div>
              <div><label className={label}>Billing Day of Month</label><input type="number" className={input} value={form.billing_day} onChange={e => set('billing_day', e.target.value)} placeholder="5"/></div>
              <div><label className={label}>Next Renewal Date</label><input type="date" className={input} value={form.next_renewal} onChange={e => set('next_renewal', e.target.value)}/></div>
              <div>
                <label className={label}>Payment Status</label>
                <select className={input} value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                  <option value="paid">Paid</option>
                  <option value="due">Due</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="mt-4"><label className={label}>Negotiation Notes</label><textarea className={input + ' h-20 resize-none'} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="3 month deal, custom domain included..."/></div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#25D366] hover:bg-[#1fb855] text-black font-bold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Adding Client...' : 'Add Client'}
          </button>
        </div>
      </main>
    </div>
  )
}