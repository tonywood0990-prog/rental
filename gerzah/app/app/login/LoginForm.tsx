'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const redirect = searchParams.get('redirect') || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Имэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.')
    } else {
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-card shadow-card overflow-hidden ornamental-border">
          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-warm">
                  <span className="text-white font-bold text-2xl">Г</span>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-secondary">Нэвтрэх</h1>
              <p className="text-gray-400 text-sm mt-1">GerZah (Гэр Зах) дансруу нэвтрэнэ үү</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Имэйл хаяг</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanii@imeil.mn"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700">Нууц үг</label>
                  <Link href="#" className="text-xs text-primary hover:underline">Нууц үг мартсан уу?</Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-input font-bold text-sm hover:bg-primary-600 transition-colors shadow-warm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Нэвтэрч байна...
                  </>
                ) : (
                  'Нэвтрэх'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Бүртгэл байхгүй юу?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">
                  Бүртгүүлэх
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Нэвтэрснээр та манай{' '}
              <Link href="#" className="text-primary hover:underline">үйлчилгээний нөхцөл</Link>ийг зөвшөөрч байна.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <Link href="/" className="hover:text-primary transition-colors">← Нүүр хуудас руу буцах</Link>
        </p>
      </div>
    </div>
  )
}
