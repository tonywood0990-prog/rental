'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/lib/types'
import { formatPrice, PROPERTY_TYPE_LABELS, TYPE_LABELS, getListingImage } from '@/lib/utils'

export default function DashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ full_name: string | null; email: string | null }>({ full_name: null, email: null })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setProfile({ full_name: user.user_metadata?.full_name || null, email: user.email || null })

    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setListings((data as Listing[]) || [])
    setLoading(false)
  }, [supabase, router])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('listings').update({ is_active: !current }).eq('id', id)
    setListings((list) => list.map((l) => l.id === id ? { ...l, is_active: !current } : l))
  }

  const deleteListing = async (id: string) => {
    await supabase.from('listings').delete().eq('id', id)
    setListings((list) => list.filter((l) => l.id !== id))
    setDeleteConfirm(null)
  }

  const activeCount = listings.filter((l) => l.is_active).length
  const inactiveCount = listings.filter((l) => !l.is_active).length

  return (
    <div className="bg-background min-h-screen pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-secondary">
              Миний хяналтын самбар
            </h1>
            {profile.full_name && (
              <p className="text-gray-500 mt-1">Сайн байна уу, <strong>{profile.full_name}</strong> 👋</p>
            )}
          </div>
          <Link
            href="/post"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-input font-semibold text-sm hover:bg-primary-600 transition-colors shadow-warm"
          >
            <span className="text-lg leading-none">+</span>
            Шинэ зар нэмэх
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Нийт зар', value: listings.length, icon: '📋', color: 'border-l-blue-400' },
            { label: 'Идэвхтэй', value: activeCount, icon: '✅', color: 'border-l-green-400' },
            { label: 'Идэвхгүй', value: inactiveCount, icon: '⏸', color: 'border-l-gray-400' },
          ].map((stat) => (
            <div key={stat.label} className={`bg-white rounded-card p-5 shadow-card border-l-4 ${stat.color}`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-extrabold text-secondary">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-card p-4 shadow-card animate-pulse flex gap-4">
                <div className="w-24 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-card shadow-card p-16 text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-secondary mb-2">Одоохондоо зар байхгүй байна</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Анхны зараа оруулаарай. Мянга мянган хэрэглэгч таны зарыг харна.
            </p>
            <Link
              href="/post"
              className="inline-block px-6 py-3 bg-primary text-white rounded-input font-semibold hover:bg-primary-600 transition-colors"
            >
              Шинэ зар нэмэх
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className={`bg-white rounded-card shadow-card overflow-hidden transition-all ${
                  !listing.is_active ? 'opacity-70' : ''
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="relative w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image
                      src={getListingImage(listing.images)}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                    {!listing.is_active && (
                      <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Идэвхгүй</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${listing.listing_type === 'rent' ? 'price-badge-rent' : 'price-badge-sale'}`}>
                            {TYPE_LABELS[listing.listing_type]}
                          </span>
                          <span className="text-xs text-gray-400">{PROPERTY_TYPE_LABELS[listing.property_type]}</span>
                        </div>
                        <h3 className="font-semibold text-secondary text-sm leading-tight truncate max-w-md">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-bold text-primary text-sm">
                            {formatPrice(listing.price, listing.price_period)}
                          </span>
                          {listing.district && (
                            <span className="text-xs text-gray-400">📍 {listing.district}</span>
                          )}
                          <span className="text-xs text-gray-300">
                            {new Date(listing.created_at).toLocaleDateString('mn-MN')}
                          </span>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        listing.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {listing.is_active ? '● Идэвхтэй' : '○ Идэвхгүй'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-50 px-4 py-2.5 flex items-center gap-2 flex-wrap bg-gray-50/50">
                  <Link
                    href={`/listings/${listing.id}`}
                    className="text-xs font-medium text-gray-600 hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white"
                  >
                    👁 Харах
                  </Link>
                  <button
                    onClick={() => toggleActive(listing.id, listing.is_active)}
                    className="text-xs font-medium text-gray-600 hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white"
                  >
                    {listing.is_active ? '⏸ Идэвхгүй болгох' : '▶ Идэвхжүүлэх'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(listing.id)}
                    className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-50 ml-auto"
                  >
                    🗑 Устгах
                  </button>
                </div>

                {/* Delete confirm */}
                {deleteConfirm === listing.id && (
                  <div className="border-t border-red-100 px-4 py-3 bg-red-50 flex items-center justify-between gap-3">
                    <p className="text-sm text-red-600 font-medium">Энэ зарыг устгахдаа итгэлтэй байна уу?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-white transition-colors"
                      >
                        Болих
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
