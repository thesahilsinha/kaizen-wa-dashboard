'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const Ctx = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('ka_theme')
    const isDark = saved === 'dark'
    setDark(isDark)
    document.body.className = isDark ? 'dark-mode' : 'light-mode'
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.body.className = next ? 'dark-mode' : 'light-mode'
    localStorage.setItem('ka_theme', next ? 'dark' : 'light')
  }

  if (!mounted) return <div className="light-mode" style={{ minHeight: '100vh' }}>{children}</div>

  return (
    <Ctx.Provider value={{ dark, toggle }}>
      <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
        {children}
      </div>
    </Ctx.Provider>
  )
}

export const useTheme = () => useContext(Ctx)