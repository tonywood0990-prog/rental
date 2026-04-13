'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isHome = pathname === '/'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-warm">
              <span className="text-white font-bold text-lg leading-none">Г</span>
            </div>
            <div className="flex flex-col leading-none">
              <span
                className={`font-extrabold text-lg tracking-tight transition-colors ${
                  scrolled || !isHome ? 'text-secondary' : 'text-white'
                } group-hover:text-primary`}
              >
                GerZah
              </span>
              <span
                className={`text-xs font-medium transition-colors ${
                  scrolled || !isHome ? 'text-gray-400' : 'text-white/70'
                }`}
              >
                Гэр Зах
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/listings?type=rent"
              className={`font-medium text-sm transition-colors hover:text-primary ${
                scrolled || !isHome ? 'text-gray-600' : 'text-white/90'
              }`}
            >
              Түрээслэх
            </Link>
            <Link
              href="/listings?type=sale"
              className={`font-medium text-sm transition-colors hover:text-primary ${
                scrolled || !isHome ? 'text-gray-600' : 'text-white/90'
              }`}
            >
              Худалдах/Авах
            </Link>
            <Link
              href="/listings"
              className={`font-medium text-sm transition-colors hover:text-primary ${
                scrolled || !isHome ? 'text-gray-600' : 'text-white/90'
              }`}
            >
              Бүх зар
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/post"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-input text-sm font-semibold hover:bg-primary-600 transition-colors shadow-warm"
                >
                  <span>+</span>
                  <span>Зар нэмэх</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    scrolled || !isHome ? 'text-gray-600' : 'text-white/90'
                  }`}
                >
                  Миний зар
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    scrolled || !isHome ? 'text-gray-500' : 'text-white/70'
                  }`}
                >
                  Гарах
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    scrolled || !isHome ? 'text-gray-600' : 'text-white/90'
                  }`}
                >
                  Нэвтрэх
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary text-white rounded-input text-sm font-semibold hover:bg-primary-600 transition-colors shadow-warm"
                >
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHome
                ? 'text-secondary hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 rounded-full transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''} ${scrolled || !isHome ? 'bg-secondary' : 'bg-white'}`} />
              <span className={`block h-0.5 rounded-full transition-all ${menuOpen ? 'opacity-0' : ''} ${scrolled || !isHome ? 'bg-secondary' : 'bg-white'}`} />
              <span className={`block h-0.5 rounded-full transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''} ${scrolled || !isHome ? 'bg-secondary' : 'bg-white'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/listings?type=rent" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 hover:text-primary py-2">Түрээслэх</Link>
            <Link href="/listings?type=sale" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 hover:text-primary py-2">Худалдах/Авах</Link>
            <Link href="/listings" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 hover:text-primary py-2">Бүх зар</Link>
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/post" onClick={() => setMenuOpen(false)} className="w-full text-center px-4 py-2.5 bg-primary text-white rounded-input font-semibold">+ Зар нэмэх</Link>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 hover:text-primary py-2">Миний зар</Link>
                  <button onClick={handleSignOut} className="text-left font-medium text-gray-500 hover:text-primary py-2">Гарах</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 hover:text-primary py-2">Нэвтрэх</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="w-full text-center px-4 py-2.5 bg-primary text-white rounded-input font-semibold">Бүртгүүлэх</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
