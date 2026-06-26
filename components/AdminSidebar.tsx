'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'

const links = [
  { href: '/admin', label: 'All Clients', icon: '◎' },
  { href: '/admin/add-client', label: 'Add Client', icon: '⊕' },
  { href: '/admin/payments', label: 'Payments', icon: '◈' },
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

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center text-black text-xs font-bold">K</div>
          <div>
            <div className="text-white text-sm font-semibold">Kaizen WA 360</div>
            <div className="text-white/30 text-[11px]">Super Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-widest text-white/20 uppercase">Admin</div>
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all ${
                active
                  ? 'bg-[#25D366]/10 text-[#25D366] font-medium'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="text-base w-4 text-center">{link.icon}</span>
              <span>{link.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25D366]" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/5 space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:text-white/80 hover:bg-white/5 transition-all w-full"
        >
          <span className="text-base w-4 text-center">{dark ? '○' : '●'}</span>
          <span>{dark ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
        >
          <span className="text-base w-4 text-center">→</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#0f172a] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#25D366] flex items-center justify-center text-black text-xs font-bold">K</div>
          <span className="text-white text-sm font-semibold">Kaizen WA 360</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white/50 hover:text-white p-1">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 bottom-0 w-56 bg-[#0f172a] pt-14 z-50" onClick={e => e.stopPropagation()}>
            <NavContent />
          </div>
        </div>
      )}

      <div className="hidden md:flex w-56 min-h-screen bg-[#0f172a] flex-col fixed left-0 top-0 bottom-0 z-30">
        <NavContent />
      </div>

      <div className="hidden md:block w-56 flex-shrink-0" />
      <div className="md:hidden h-14 flex-shrink-0" />
    </>
  )
}