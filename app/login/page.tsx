'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { masterSupabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'select' | 'admin' | 'client'>('select')
  const [pin, setPin] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdminLogin() {
    setLoading(true)
    setError('')
    if (pin !== process.env.NEXT_PUBLIC_ADMIN_PIN && pin !== '27082003') {
      setError('Invalid PIN')
      setLoading(false)
      return
    }
    const session = JSON.stringify({ role: 'superadmin' })
    document.cookie = `ka_session=${encodeURIComponent(session)}; path=/; max-age=86400`
    router.push('/admin')
  }

  async function handleClientLogin() {
    setLoading(true)
    setError('')
    const { data, error: err } = await masterSupabase.auth.signInWithPassword({ email, password })
    if (err || !data.user) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }
    // Verify client exists in master_clients
    const { data: client } = await masterSupabase
      .from('master_clients')
      .select('id, business_name, supabase_url, supabase_anon_key')
      .eq('login_email', email)
      .eq('is_active', true)
      .single()

    if (!client) {
      setError('Account not found or inactive')
      setLoading(false)
      return
    }

    const session = JSON.stringify({
      role: 'client',
      clientId: client.id,
      businessName: client.business_name,
      supabaseUrl: client.supabase_url,
      supabaseAnonKey: client.supabase_anon_key
    })
    document.cookie = `ka_session=${encodeURIComponent(session)}; path=/; max-age=86400`
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🟢</div>
          <h1 className="text-2xl font-bold font-mono">Kaizen <span className="text-[#25D366]">WA 360</span></h1>
          <p className="text-zinc-500 text-sm mt-1">WhatsApp Automation Platform</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('admin')}
              className="w-full bg-[#111] border border-zinc-800 hover:border-[#25D366] text-white rounded-xl p-4 text-left transition-all"
            >
              <div className="font-semibold">👑 Admin Login</div>
              <div className="text-zinc-500 text-sm mt-1">Kaizen ASC internal access</div>
            </button>
            <button
              onClick={() => setMode('client')}
              className="w-full bg-[#111] border border-zinc-800 hover:border-[#25D366] text-white rounded-xl p-4 text-left transition-all"
            >
              <div className="font-semibold">📱 Client Login</div>
              <div className="text-zinc-500 text-sm mt-1">Access your WhatsApp dashboard</div>
            </button>
          </div>
        )}

        {mode === 'admin' && (
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
            <button onClick={() => setMode('select')} className="text-zinc-500 text-sm mb-4 hover:text-white">← Back</button>
            <h2 className="font-bold text-lg mb-4">Admin PIN</h2>
            <input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-4 py-3 text-white font-mono text-xl tracking-widest outline-none focus:border-[#25D366] mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full bg-[#25D366] hover:bg-[#1fb855] text-black font-bold rounded-lg py-3 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </div>
        )}

        {mode === 'client' && (
          <div className="bg-[#111] border border-zinc-800 rounded-xl p-6">
            <button onClick={() => setMode('select')} className="text-zinc-500 text-sm mb-4 hover:text-white">← Back</button>
            <h2 className="font-bold text-lg mb-4">Client Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#25D366] mb-3"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleClientLogin()}
              className="w-full bg-[#0a0a0a] border border-zinc-700 rounded-lg px-4 py-3 text-white outline-none focus:border-[#25D366] mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
            <button
              onClick={handleClientLogin}
              disabled={loading}
              className="w-full bg-[#25D366] hover:bg-[#1fb855] text-black font-bold rounded-lg py-3 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}