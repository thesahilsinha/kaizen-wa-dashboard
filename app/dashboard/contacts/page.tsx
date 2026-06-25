'use client'
import { useEffect, useState, useRef } from 'react'
import ClientSidebar from '@/components/ClientSidebar'

function getSession() {
  const raw = document.cookie.split('; ').find(r => r.startsWith('ka_session='))?.split('=')[1]
  if (!raw) return null
  return JSON.parse(decodeURIComponent(raw))
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    if (s) fetchContacts(s)
  }, [])

  async function fetchContacts(s: any) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(s.supabaseUrl, s.supabaseAnonKey)
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

  async function importCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    const text = await file.text()
    const lines = text.split('\n').slice(1).filter(Boolean)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(session.supabaseUrl, session.supabaseAnonKey)
    const rows = lines.map(line => {
      const [name, phone, tags] = line.split(',').map(s => s.trim())
      return { name, phone, tags: tags ? tags.split('|') : [] }
    })
    await supabase.from('contacts').upsert(rows, { onConflict: 'phone' })
    fetchContacts(session)
  }

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <ClientSidebar businessName={session.businessName} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-zinc-500 text-sm mt-1">{contacts.length} contacts</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-[#111] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#25D366] w-48"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-4 py-2 rounded-lg text-sm"
            >
              Import CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={importCSV} />
          </div>
        </div>

        <div className="text-zinc-600 text-xs font-mono mb-3">CSV format: name, phone (with country code), tags (pipe separated)</div>

        <div className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono uppercase">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Tags</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={4} className="p-8 text-center text-zinc-600">Loading...</td></tr>}
              {!loading && filtered.map(contact => (
                <tr key={contact.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 text-sm">
                  <td className="p-4 font-medium">{contact.name}</td>
                  <td className="p-4 font-mono text-zinc-400">{contact.phone}</td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {contact.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${contact.opted_out ? 'bg-red-900 text-red-400' : 'bg-green-900 text-green-400'}`}>
                      {contact.opted_out ? 'opted out' : 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-600">No contacts yet. Import a CSV to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}