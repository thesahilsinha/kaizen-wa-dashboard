'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/admin', label: 'All Clients', icon: '👑' },
  { href: '/admin/add-client', label: 'Add Client', icon: '➕' },
  { href: '/admin/payments', label: 'Payments', icon: '💰' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function logout() {
    document.cookie = 'ka_session=; path=/; max-age=0'
    router.push('/login')
  }

  const NavLinks = () => (
    <>
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-all border-l-2 ${
            pathname === link.href
              ? 'text-[#25D366] bg-[#25D36610] border-[#25D366]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-transparent'
          }`}
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </>
  )

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0d0d0d] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-[#25D366] font-bold font-mono text-sm">Kaizen WA 360</div>
          <div className="text-zinc-500 text-xs">Super Admin</div>
        </div>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white text-xl">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div className="w-52 h-full bg-[#0d0d0d] border-r border-zinc-800 pt-16" onClick={e => e.stopPropagation()}>
            <nav className="py-2"><NavLinks /></nav>
            <button onClick={logout} className="mx-4 mt-4 text-xs text-zinc-600 hover:text-red-400">→ Logout</button>
          </div>
        </div>
      )}

      <div className="hidden md:flex w-52 min-h-screen bg-[#0d0d0d] border-r border-zinc-800 flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="text-[#25D366] font-bold font-mono text-sm">Kaizen WA 360</div>
          <div className="text-zinc-500 text-xs font-mono mt-1">Super Admin</div>
        </div>
        <nav className="flex-1 py-2"><NavLinks /></nav>
        <button onClick={logout} className="m-4 text-xs text-zinc-600 hover:text-red-400 text-left">→ Logout</button>
      </div>

      <div className="md:hidden h-14 w-full" />
    </>
  )
}