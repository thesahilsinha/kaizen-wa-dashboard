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
    if (err || !data.user) { setError('Invalid email or password'); setLoading(false); return }
    const { data: client } = await masterSupabase
      .from('master_clients')
      .select('id, business_name, supabase_url, supabase_anon_key')
      .eq('login_email', email)
      .eq('is_active', true)
      .single()
    if (!client) { setError('Account not found or inactive'); setLoading(false); return }
    const session = JSON.stringify({
      role: 'client', clientId: client.id, businessName: client.business_name,
      supabaseUrl: client.supabase_url, supabaseAnonKey: client.supabase_anon_key
    })
    document.cookie = `ka_session=${encodeURIComponent(session)}; path=/; max-age=86400`
    router.push('/dashboard')
  }

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' } as React.CSSProperties,
    wrap: { width: '100%', maxWidth: 380 } as React.CSSProperties,
    card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 } as React.CSSProperties,
    input: { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', display: 'block' } as React.CSSProperties,
    btn: { width: '100%', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    optionCard: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 8, textAlign: 'left' as const },
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 22, margin: '0 auto 14px' }}>W</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Kaizen WA 360</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>WhatsApp Automation Platform</p>
        </div>

        {mode === 'select' && (
          <div>
            <button style={s.optionCard} onClick={() => setMode('admin')}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👑</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Admin access</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Kaizen ASC internal</div>
              </div>
            </button>
            <button style={s.optionCard} onClick={() => setMode('client')}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📱</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Client login</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Access your dashboard</div>
              </div>
            </button>
          </div>
        )}

        {mode === 'admin' && (
          <div style={s.card}>
            <button onClick={() => setMode('select')} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Back</button>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Admin PIN</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Enter your 8-digit PIN</p>
            <input type="password" placeholder="••••••••" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} style={{ ...s.input, textAlign: 'center', fontSize: 20, letterSpacing: 8, marginBottom: 12 }} />
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleAdminLogin} disabled={loading} style={s.btn}>{loading ? 'Verifying...' : 'Enter'}</button>
          </div>
        )}

        {mode === 'client' && (
          <div style={s.card}>
            <button onClick={() => setMode('select')} style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}>← Back</button>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Client login</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>Enter your credentials</p>
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={{ ...s.input, marginBottom: 10 }} />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleClientLogin()} style={{ ...s.input, marginBottom: 12 }} />
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button onClick={handleClientLogin} disabled={loading} style={s.btn}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted2)', marginTop: 24 }}>Powered by Kaizen ASC</p>
      </div>
    </div>
  )
}