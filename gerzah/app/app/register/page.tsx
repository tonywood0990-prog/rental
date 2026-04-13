'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна')
      return
    }
    if (password.length < 8) {
      setError('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('Энэ имэйл хаяг аль хэдийн бүртгэлтэй байна')
      } else {
        setError('Бүртгэлд алдаа гарлаа. Дахин оролдоно уу.')
      }
      setLoading(false)
      return
    }

    if (data.user) {
      // Insert profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone || null,
      })

      if (data.session) {
        // Auto-logged in (email confirm disabled)
        router.push('/post')
        router.refresh()
      } else {
        setSuccess(true)
      }
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-card shadow-card p-10">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-extrabold text-secondary mb-3">Имэйлээ шалгана уу</h2>
            <p className="text-gray-500 mb-6">
              <strong>{email}</strong> хаягт баталгаажуулах имэйл илгээлээ.
              Имэйлийн холбоос дарж бүртгэлээ баталгаажуулна уу.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-primary text-white rounded-input font-semibold hover:bg-primary-600 transition-colors"
            >
              Нэвтрэх хуудас руу очих
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-card shadow-card overflow-hidden ornamental-border">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-warm">
                  <span className="text-white font-bold text-2xl">Г</span>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-secondary">Бүртгүүлэх</h1>
              <p className="text-gray-400 text-sm mt-1">GerZah-д бүртгүүлж, зараа нийтлээрэй</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Овог нэр <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Жишээ нь: Монгол Баатар"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Утасны дугаар</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+976 99001122"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Имэйл хаяг <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tanii@imeil.mn"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Нууц үг <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Хамгийн багадаа 8 тэмдэгт"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Нууц үг давтах <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Нууц үгийг давтан оруулна уу"
                  className={`w-full px-4 py-3 border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-primary'
                  }`}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">Нууц үг таарахгүй байна</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white rounded-input font-bold text-sm hover:bg-primary-600 transition-colors shadow-warm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Бүртгүүлж байна...
                  </>
                ) : (
                  'Бүртгүүлэх — Үнэгүй'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Бүртгэлтэй юу?{' '}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Нэвтрэх
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Бүртгүүлснээр та манай{' '}
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
