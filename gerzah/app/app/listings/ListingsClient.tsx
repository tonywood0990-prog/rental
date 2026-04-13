'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/lib/types'
import ListingCard from '@/components/ListingCard'
import FilterBar from '@/components/FilterBar'
import { MultiMapWrapper } from '@/components/MapWrapper'

const PAGE_SIZE = 12

export default function ListingsClient() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'split' | 'grid'>('split')
  const [page, setPage] = useState(1)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const type = searchParams.get('type') || ''
    const propertyType = searchParams.get('property_type') || ''
    const districts = searchParams.getAll('district')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const bedrooms = searchParams.get('bedrooms')
    const query = searchParams.get('q') || ''
    const pageNum = parseInt(searchParams.get('page') || '1')
    setPage(pageNum)

    let q = supabase
      .from('listings')
      .select('*, profiles(full_name, phone, avatar_url)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE - 1)

    if (type) q = q.eq('listing_type', type)
    if (propertyType) q = q.eq('property_type', propertyType)
    if (districts.length > 0) q = q.in('district', districts)
    if (minPrice) q = q.gte('price', parseInt(minPrice))
    if (maxPrice) q = q.lte('price', parseInt(maxPrice))
    if (bedrooms) {
      if (bedrooms === '4') q = q.gte('bedrooms', 4)
      else q = q.eq('bedrooms', parseInt(bedrooms))
    }
    if (query) q = q.ilike('title', `%${query}%`)

    const { data, count } = await q
    setListings((data as Listing[]) || [])
    setTotal(count || 0)
    setLoading(false)
  }, [searchParams])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handlePinClick = (id: string) => {
    setActiveId(id)
    const el = document.getElementById(`card-${id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex flex-col h-screen pt-16">
      <FilterBar />

      {/* View toggle + count */}
      <div className="bg-background border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? (
            <span className="animate-pulse">Хайж байна...</span>
          ) : (
            <>
              <span className="font-bold text-secondary">{total.toLocaleString()}</span>
              {' '}зар олдлоо
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Газрын зурагтай
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Жагсаалт
          </button>
        </div>
      </div>

      {/* Main content */}
      {viewMode === 'split' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Map - 60% */}
          <div className="hidden md:block w-3/5 sticky top-0 p-3">
            <div className="h-full rounded-card overflow-hidden border border-gray-200 shadow-card">
              <MultiMapWrapper
                listings={listings}
                activeId={activeId}
                onPinClick={handlePinClick}
              />
            </div>
          </div>

          {/* List - 40% */}
          <div className="w-full md:w-2/5 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <LoadingSkeleton />
            ) : listings.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {listings.map((listing) => (
                  <div key={listing.id} id={`card-${listing.id}`}>
                    <ListingCard
                      listing={listing}
                      isActive={listing.id === activeId}
                      onHover={setActiveId}
                      compact
                    />
                  </div>
                ))}
                <Pagination page={page} total={totalPages} />
              </>
            )}
          </div>
        </div>
      ) : (
        /* Grid view */
        <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
          {loading ? (
            <LoadingSkeleton grid />
          ) : listings.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination page={page} total={totalPages} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton({ grid }: { grid?: boolean }) {
  return (
    <div className={grid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-4'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-card overflow-hidden shadow-card animate-pulse">
          <div className="h-44 bg-gray-200" />
          <div className="p-4 space-y-2.5">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🏠</div>
      <h3 className="text-lg font-bold text-secondary mb-2">Зар олдсонгүй</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Таны хайлтын шүүлтүүрт тохирох зар байхгүй байна. Шүүлтүүрийг өөрчилж үзнэ үү.
      </p>
    </div>
  )
}

function Pagination({ page, total }: { page: number; total: number }) {
  const searchParams = useSearchParams()
  if (total <= 1) return null

  const makeHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    return `/listings?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {page > 1 && (
        <a href={makeHref(page - 1)} className="px-3 py-2 rounded-input border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors">← Өмнөх</a>
      )}
      {Array.from({ length: Math.min(total, 5) }, (_, i) => {
        const p = Math.max(1, page - 2) + i
        if (p > total) return null
        return (
          <a
            key={p}
            href={makeHref(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-input text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary text-white'
                : 'border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            {p}
          </a>
        )
      })}
      {page < total && (
        <a href={makeHref(page + 1)} className="px-3 py-2 rounded-input border border-gray-200 text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors">Дараах →</a>
      )}
    </div>
  )
}
