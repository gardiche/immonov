'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Home, Search, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/types/database'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) { setRole(null); return }
    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setRole(data.role as UserRole)
      })
    return () => { cancelled = true }
  }, [user?.id])

  async function handleSignOut() {
    await supabase.auth.signOut()
    document.cookie.split(';').forEach((c) => {
      if (c.trim().startsWith('sb-')) {
        document.cookie = c.replace(/=.*/, '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/')
      }
    })
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sb-')) localStorage.removeItem(k)
    })
    window.location.replace('/')
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur border-b border-[color:var(--border)]">
      <div className="container-immo h-full flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <Image src="/images/logo.png" alt="IMMONOV" height={56} width={160} className="h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/annonces" className="text-sm font-medium text-gray-600 hover:text-[#1B2A4A] transition-colors">
            Annonces
          </Link>
          <Link href="/estimation" className="text-sm font-medium text-gray-600 hover:text-[#1B2A4A] transition-colors">
            Estimer
          </Link>
          <Link href="/vendre" className="text-sm font-medium text-gray-600 hover:text-[#1B2A4A] transition-colors">
            Vendre
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-[#1B2A4A] hover:text-[#141F38] transition-colors"
              >
                Mon espace
                <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-[color:var(--border)] shadow-lg py-1 z-50"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <Link href="/mon-espace" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Home className="h-4 w-4 text-[#4A6FD4]" />
                    Vue d'ensemble
                  </Link>
                  <Link href="/dashboard/vendeur" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Home className="h-4 w-4 text-[#4A6FD4]" />
                    Espace vendeur
                  </Link>
                  <Link href="/dashboard/acheteur" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                    <Search className="h-4 w-4 text-[#4A6FD4]" />
                    Espace acheteur
                  </Link>
                  {role === 'admin' && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors" onClick={() => setMenuOpen(false)}>
                      <Settings className="h-4 w-4 text-[#4A6FD4]" />
                      Administration
                    </Link>
                  )}
                  <hr className="my-1 border-[color:var(--border)]" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/connexion" className="text-sm font-medium text-gray-600 hover:text-[#1B2A4A] transition-colors">
                Connexion
              </Link>
              <Link href="/auth/inscription" className="btn-primary text-sm px-5 py-2">
                Commencer
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
