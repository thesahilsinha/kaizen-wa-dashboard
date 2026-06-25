import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!,
    process.env.MASTER_SUPABASE_SERVICE_KEY!
  )

  const { data: clients } = await supabase
    .from('master_clients')
    .select('*')
    .order('onboarded_at', { ascending: false })

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">All Clients</h1>
            <p className="text-zinc-500 text-sm mt-1">{clients?.length || 0} total clients</p>
          </div>
          <Link
            href="/admin/add-client"
            className="bg-[#25D366] hover:bg-[#1fb855] text-black font-bold px-4 py-2 rounded-lg text-sm transition-all"
          >
            + Add Client
          </Link>
        </div>

        <div className="grid gap-3">
          {clients?.map(client => (
            <div key={client.id} className="bg-[#111] border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="font-semibold">{client.business_name}</div>
                <div className="text-zinc-500 text-sm font-mono mt-1">{client.login_email}</div>
                {client.notes && <div className="text-zinc-600 text-xs mt-1">{client.notes}</div>}
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-[#25D366] font-bold font-mono">₹{client.monthly_retainer}/mo</div>
                  <div className="text-zinc-600 text-xs">Setup: ₹{client.setup_fee}</div>
                </div>
                <div>
                  <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                    client.payment_status === 'paid' ? 'bg-green-900 text-green-400' :
                    client.payment_status === 'due' ? 'bg-yellow-900 text-yellow-400' :
                    'bg-red-900 text-red-400'
                  }`}>
                    {client.payment_status}
                  </span>
                  <div className="text-zinc-600 text-xs mt-1">
                    {client.next_renewal ? `Renews ${client.next_renewal}` : 'No renewal set'}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${client.is_active ? 'bg-[#25D366]' : 'bg-zinc-600'}`} />
              </div>
            </div>
          ))}
          {(!clients || clients.length === 0) && (
            <div className="text-center py-16 text-zinc-600">
              No clients yet. <Link href="/admin/add-client" className="text-[#25D366]">Add your first client →</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}