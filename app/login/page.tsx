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
    if (pin !== '27082003') {
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-black font-bold text-xl mx-auto mb-4">W</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Kaizen WA 360</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>WhatsApp Automation Platform</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('admin')}
              className="w-full card card-hover p-4 text-left transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--surface2)' }}>👑</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Admin access</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Kaizen ASC internal</div>
              </div>
            </button>
            <button
              onClick={() => setMode('client')}
              className="w-full card card-hover p-4 text-left transition-all flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'var(--surface2)' }}>📱</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Client login</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Access your dashboard</div>
              </div>
            </button>
          </div>
        )}

        {mode === 'admin' && (
          <div className="card p-6">
            <button onClick={() => setMode('select')} className="text-xs mb-5 flex items-center gap-1" style={{ color: 'var(--muted)' }}>← Back</button>
            <h2 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Enter PIN</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Admin access only</p>
            <input
              type="password"
              placeholder="••••••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              className="mb-3 text-center text-2xl tracking-widest font-mono"
            />
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button
              onClick={handleAdminLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: 'var(--green)' }}
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </div>
        )}

        {mode === 'client' && (
          <div className="card p-6">
            <button onClick={() => setMode('select')} className="text-xs mb-5 flex items-center gap-1" style={{ color: 'var(--muted)' }}>← Back</button>
            <h2 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Client login</h2>
            <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Enter your credentials</p>
            <div className="space-y-3 mb-4">
              <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} />
            </div>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <button
              onClick={handleClientLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50 transition-all"
              style={{ background: 'var(--green)' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted2)' }}>Powered by Kaizen ASC</p>
      </div>
    </div>
  )
}