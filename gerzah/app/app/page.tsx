export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingCard from '@/components/ListingCard'
import HeroSearch from '@/components/HeroSearch'
import { DISTRICTS, PROPERTY_TYPE_LABELS } from '@/lib/utils'
import { Listing } from '@/lib/types'

async function getFeaturedListings(): Promise<Listing[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('listings')
    .select('*, profiles(full_name, phone, avatar_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)
  return (data as Listing[]) || []
}

async function getStats() {
  const supabase = await createClient()
  const [listingsRes, profilesRes] = await Promise.all([
    supabase.from('listings').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('profiles').select('id', { count: 'exact' }),
  ])
  return {
    listings: listingsRes.count || 0,
    users: profilesRes.count || 0,
    districts: DISTRICTS.length,
  }
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedListings(), getStats()])

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'linear-gradient(135deg, #1A1A2E 0%, #2D1B3D 40%, #C8102E 100%)',
          }}
        />
        {/* Mongolian pattern overlay */}
        <div
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #F5A623 0, #F5A623 1px, transparent 0, transparent 50%)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            Монголын дугаар нэг үл хөдлөх хөрөнгийн платформ
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 text-balance">
            Монгол дахь таны{' '}
            <span className="text-accent">хамгийн сайн</span>{' '}
            гэрийг ол
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Орон сууц, байшин, газар — Улаанбаатарын бүх дүүргийн зарыг нэг дороос хайж олоорой.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/listings?type=rent"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-primary rounded-card font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              <span className="text-2xl">🏠</span>
              <div className="text-left">
                <div>Түрээслэх</div>
                <div className="text-xs font-normal text-gray-500">Орон сууц болон байшин</div>
              </div>
            </Link>
            <Link
              href="/listings?type=sale"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-secondary rounded-card font-bold text-lg hover:bg-accent-400 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              <span className="text-2xl">🔑</span>
              <div className="text-left">
                <div>Худалдах / Авах</div>
                <div className="text-xs font-normal text-secondary/60">Үл хөдлөх хөрөнгө</div>
              </div>
            </Link>
          </div>

          {/* Search bar — client component */}
          <HeroSearch />
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 840 0 720 0C600 0 240 60 0 20L0 60Z" fill="#F8F6F1"/>
          </svg>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            {[
              { value: stats.listings.toLocaleString(), label: 'Нийт зар' },
              { value: `${stats.districts}`, label: 'Дүүрэг' },
              { value: stats.users.toLocaleString(), label: 'Бүртгэлтэй хэрэглэгч' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-primary">{s.value}+</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category grid ────────────────────────────────────────── */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-secondary mb-2">Ангиллаар хайх</h2>
          <p className="text-gray-500 mb-6">Таны хэрэгцээнд тохирсон үл хөдлөх хөрөнгийг олоорой</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'apartment', icon: '🏢', count: '4,000+', color: 'from-blue-50 to-blue-100 border-blue-200', text: 'text-blue-700' },
              { type: 'house',     icon: '🏡', count: '1,200+', color: 'from-green-50 to-green-100 border-green-200', text: 'text-green-700' },
              { type: 'land',      icon: '🌿', count: '800+',   color: 'from-amber-50 to-amber-100 border-amber-200', text: 'text-amber-700' },
              { type: 'office',    icon: '🏦', count: '400+',   color: 'from-purple-50 to-purple-100 border-purple-200', text: 'text-purple-700' },
            ].map((cat) => (
              <Link
                key={cat.type}
                href={`/listings?property_type=${cat.type}`}
                className={`group p-5 rounded-card border bg-gradient-to-br ${cat.color} hover:shadow-card transition-all hover:-translate-y-0.5`}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <div className={`font-bold text-base ${cat.text}`}>
                  {PROPERTY_TYPE_LABELS[cat.type as keyof typeof PROPERTY_TYPE_LABELS]}
                </div>
                <div className="text-gray-500 text-sm mt-0.5">{cat.count} зар</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-secondary mb-1">Сүүлийн зарууд</h2>
              <p className="text-gray-500 text-sm">Шинэхэн нэмэгдсэн үл хөдлөх хөрөнгүүд</p>
            </div>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              Бүгдийг харах
              <span>→</span>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🏠</div>
              <p>Зар байхгүй байна. Эхний зараа оруулаарай!</p>
              <Link href="/post" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-input font-semibold text-sm hover:bg-primary-600 transition-colors">
                Зар нэмэх
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Districts section ────────────────────────────────────── */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-secondary mb-2">Дүүргээр хайх</h2>
          <p className="text-gray-500 mb-6">Улаанбаатарын 8 дүүргийн аль нэгд хайлтаа эхлүүлээрэй</p>
          <div className="flex flex-wrap gap-3">
            {DISTRICTS.map((district) => (
              <Link
                key={district}
                href={`/listings?district=${district}`}
                className="group px-5 py-3 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-primary hover:text-primary hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
              >
                <span className="mr-1.5">📍</span>
                {district}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="py-16 bg-secondary ornamental-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Зараа оруулж, хурдан хугацаанд зар!
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Манай платформд зараа оруулбал мянга мянган хэрэглэгч таны зарыг харна.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/post"
              className="px-8 py-3.5 bg-primary text-white rounded-card font-bold text-lg hover:bg-primary-600 transition-colors shadow-warm"
            >
              Зар оруулах — Үнэгүй
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white/10 text-white border border-white/20 rounded-card font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Бүртгүүлэх
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
