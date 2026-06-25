import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

export default async function PaymentsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL!,
    process.env.MASTER_SUPABASE_SERVICE_KEY!
  )
  const { data: clients } = await supabase
    .from('master_clients')
    .select('*')
    .order('next_renewal', { ascending: true })

  const totalMonthly = clients?.reduce((sum, c) => sum + (c.monthly_retainer || 0), 0) || 0
  const overdue = clients?.filter(c => c.payment_status === 'overdue').length || 0
  const due = clients?.filter(c => c.payment_status === 'due').length || 0

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-2">Payments & Renewals</h1>
        <p className="text-zinc-500 text-sm mb-8">Track all client billing</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-5">
            <div className="text-[#25D366] text-2xl font-bold font-mono">₹{totalMonthly.toLocaleString()}</div>
            <div className="text-zinc-500 text-xs font-mono mt-1">Monthly Recurring</div>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-5">
            <div className="text-yellow-400 text-2xl font-bold font-mono">{due}</div>
            <div className="text-zinc-500 text-xs font-mono mt-1">Payments Due</div>
          </div>
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-5">
            <div className="text-red-400 text-2xl font-bold font-mono">{overdue}</div>
            <div className="text-zinc-500 text-xs font-mono mt-1">Overdue</div>
          </div>
        </div>

        <div className="bg-[#111] border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-mono uppercase">
                <th className="text-left p-4">Client</th>
                <th className="text-left p-4">Monthly</th>
                <th className="text-left p-4">Billing Day</th>
                <th className="text-left p-4">Next Renewal</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map(client => (
                <tr key={client.id} className="border-b border-zinc-900 hover:bg-zinc-900/30">
                  <td className="p-4">
                    <div className="font-medium text-sm">{client.business_name}</div>
                    <div className="text-zinc-600 text-xs">{client.login_email}</div>
                  </td>
                  <td className="p-4 font-mono text-sm text-[#25D366]">₹{client.monthly_retainer}</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">{client.billing_day}th</td>
                  <td className="p-4 font-mono text-sm text-zinc-400">{client.next_renewal || '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${
                      client.payment_status === 'paid' ? 'bg-green-900 text-green-400' :
                      client.payment_status === 'due' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-red-900 text-red-400'
                    }`}>{client.payment_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}