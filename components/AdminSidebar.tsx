'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'

const links = [
  { href: '/admin', label: 'All Clients', icon: '👥' },
  { href: '/admin/add-client', label: 'Add Client', icon: '➕' },
  { href: '/admin/payments', label: 'Payments', icon: '💰' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { dark, toggle } = useTheme()

  function logout() {
    document.cookie = 'ka_session=; path=/; max-age=0'
    router.push('/login')
  }

  const NavLinks = () => (
    <>
      {links.map(link => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: active ? 600 : 400,
              color: active ? '#25D366' : 'rgba(255,255,255,0.5)',
              background: active ? 'rgba(37,211,102,0.08)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              marginBottom: '2px',
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
            {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#25D366', display: 'inline-block' }} />}
          </Link>
        )
      })}
    </>
  )

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 14 }}>K</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Kaizen WA 360</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Super Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px' }}>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 8px' }}>Admin</div>
        <NavLinks />
      </nav>

      {/* Bottom */}
      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={toggle}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginBottom: 2 }}
        >
          <span>{dark ? '☀️' : '🌙'}</span>
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}
        >
          <span>→</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 56, background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }} className="md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700, fontSize: 12 }}>K</div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Kaizen WA 360</span>
        </div>
        <button onClick={() => setOpen(!open)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, background: '#0f172a', paddingTop: 56, zIndex: 50 }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block" style={{ width: 220, minHeight: '100vh', background: '#0f172a', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 30 }}>
        <SidebarContent />
      </div>
      <div className="hidden md:block" style={{ width: 220, flexShrink: 0 }} />
      <div className="md:hidden" style={{ height: 56, flexShrink: 0 }} />
    </>
  )
}