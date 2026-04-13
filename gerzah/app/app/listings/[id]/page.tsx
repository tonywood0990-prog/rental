export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/lib/types'
import ImageGallery from '@/components/ImageGallery'
import ListingCard from '@/components/ListingCard'
import { formatPrice, PROPERTY_TYPE_LABELS, TYPE_LABELS } from '@/lib/utils'
import ContactButton from './ContactButton'
import MapSection from './MapSection'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*, profiles(id, full_name, phone, avatar_url, created_at)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!listing) notFound()

  const l = listing as Listing & { profiles: { id: string; full_name: string; phone: string; avatar_url: string; created_at: string } }

  // Similar listings
  const { data: similar } = await supabase
    .from('listings')
    .select('*, profiles(full_name, phone)')
    .eq('is_active', true)
    .eq('district', l.district || '')
    .neq('id', l.id)
    .limit(3)

  const isRent = l.listing_type === 'rent'

  return (
    <div className="bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Нүүр</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-primary transition-colors">Зарууд</Link>
          {l.district && (
            <>
              <span>/</span>
              <Link href={`/listings?district=${l.district}`} className="hover:text-primary transition-colors">{l.district}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{l.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <ImageGallery images={l.images || []} title={l.title} />

            {/* Title + price */}
            <div className="bg-white rounded-card p-6 shadow-card ornamental-border">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${isRent ? 'price-badge-rent' : 'price-badge-sale'}`}>
                      {TYPE_LABELS[l.listing_type]}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      {PROPERTY_TYPE_LABELS[l.property_type]}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-secondary leading-tight">{l.title}</h1>
                  {l.district && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {l.district}{l.address ? `, ${l.address}` : ''}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-primary">
                    {formatPrice(l.price, l.price_period)}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">
                    {l.price_period === 'month' ? 'сар бүр' : 'нийт үнэ'}
                  </div>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-card p-6 shadow-card">
              <h2 className="text-lg font-bold text-secondary mb-4">Дэлгэрэнгүй мэдээлэл</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: '🛏', label: 'Өрөөний тоо', value: l.bedrooms ? `${l.bedrooms} өр` : null },
                  { icon: '🚿', label: 'Угаалгын өрөо', value: l.bathrooms ? `${l.bathrooms}` : null },
                  { icon: '📐', label: 'Талбай', value: l.area_sqm ? `${l.area_sqm} м²` : null },
                  { icon: '🏢', label: 'Давхар', value: l.floor && l.total_floors ? `${l.floor}/${l.total_floors}` : l.floor ? `${l.floor}-р давхар` : null },
                  { icon: '🏘', label: 'Дүүрэг', value: l.district },
                  { icon: '📋', label: 'Зарын дугаар', value: l.id.slice(0, 8).toUpperCase() },
                  { icon: '📅', label: 'Нэмэгдсэн', value: new Date(l.created_at).toLocaleDateString('mn-MN') },
                  { icon: '🔖', label: 'Хэлбэр', value: PROPERTY_TYPE_LABELS[l.property_type] },
                ].filter((item) => item.value !== null).map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                      <div className="font-semibold text-secondary text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {l.description && (
              <div className="bg-white rounded-card p-6 shadow-card">
                <h2 className="text-lg font-bold text-secondary mb-3">Тайлбар</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{l.description}</p>
              </div>
            )}

            {/* Map */}
            {l.lat && l.lng && (
              <div className="bg-white rounded-card p-6 shadow-card">
                <h2 className="text-lg font-bold text-secondary mb-4">Байршил</h2>
                <div className="h-64 rounded-xl overflow-hidden">
                  <MapSection lat={l.lat} lng={l.lng} title={l.title} />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Байршил ойролцоогоор харагдаж байна
                </p>
              </div>
            )}

            {/* Similar listings */}
            {similar && similar.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-secondary mb-4">
                  {l.district} дүүргийн ижил төстэй зарууд
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(similar as Listing[]).map((s) => (
                    <ListingCard key={s.id} listing={s} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className="bg-white rounded-card p-6 shadow-card sticky top-20">
              <div className="text-center mb-5">
                <div className="text-3xl font-extrabold text-primary mb-0.5">
                  {formatPrice(l.price, l.price_period)}
                </div>
                <div className="text-gray-400 text-sm">
                  {isRent ? 'сар бүр' : 'нийт үнэ'}
                </div>
              </div>

              {/* Lister info */}
              {l.profiles && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {l.profiles.full_name?.[0]?.toUpperCase() || 'X'}
                  </div>
                  <div>
                    <div className="font-semibold text-secondary text-sm">
                      {l.profiles.full_name || 'Нэргүй хэрэглэгч'}
                    </div>
                    <div className="text-xs text-gray-400">Зар оруулагч</div>
                  </div>
                </div>
              )}

              {/* Contact buttons */}
              <div className="space-y-3">
                <ContactButton phone={l.profiles?.phone} />
                {l.profiles?.phone && (
                  <a
                    href={`https://wa.me/${l.profiles.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-input font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" />
                    </svg>
                    WhatsApp-аар холбогдох
                  </a>
                )}
              </div>

              {/* Safety note */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠</span>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Урьдчилгаа мөнгө шилжүүлэхэд болгоомжтой байгаарай. Үл хөдлөх хөрөнгийг биечлэн үзэж, гэрээ байгуулж ажиллаарай.
                  </p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-card p-4 shadow-card">
              <div className="text-sm font-semibold text-secondary mb-3">Зарыг хуваалцах</div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 py-2 text-xs font-medium border border-gray-200 rounded-input hover:border-primary hover:text-primary transition-colors"
                >
                  🔗 Холбоос хуулах
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
