'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { DISTRICTS, PROPERTY_TYPE_LABELS, TYPE_LABELS } from '@/lib/utils'
import { ListingType, PropertyType } from '@/lib/types'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentType = searchParams.get('type') || ''
  const currentPropertyType = searchParams.get('property_type') || ''
  const currentDistricts = searchParams.getAll('district')
  const currentMinPrice = searchParams.get('min_price') || ''
  const currentMaxPrice = searchParams.get('max_price') || ''
  const currentBedrooms = searchParams.get('bedrooms') || ''
  const currentQuery = searchParams.get('q') || ''

  const updateParam = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key)
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else if (value !== null && value !== '') {
          params.set(key, value)
        }
      })
      router.push(`/listings?${params.toString()}`)
    },
    [searchParams, router]
  )

  const toggleDistrict = (d: string) => {
    const next = currentDistricts.includes(d)
      ? currentDistricts.filter((x) => x !== d)
      : [...currentDistricts, d]
    updateParam({ district: next })
  }

  const activeFilterCount = [
    currentType,
    currentPropertyType,
    currentDistricts.length > 0 ? 'x' : '',
    currentMinPrice,
    currentMaxPrice,
    currentBedrooms,
  ].filter(Boolean).length

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Quick filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <input
              type="text"
              placeholder="Хайх..."
              defaultValue={currentQuery}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateParam({ q: (e.target as HTMLInputElement).value })
                }
              }}
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Listing type */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['', 'rent', 'sale'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateParam({ type: t })}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentType === t
                    ? 'bg-white text-primary shadow-sm font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t === '' ? 'Бүгд' : TYPE_LABELS[t as ListingType]}
              </button>
            ))}
          </div>

          {/* Property type */}
          <select
            value={currentPropertyType}
            onChange={(e) => updateParam({ property_type: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-gray-700"
          >
            <option value="">Төрөл (бүгд)</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* More filters button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-input text-sm font-medium border transition-all ${
              isOpen || activeFilterCount > 0
                ? 'border-primary text-primary bg-red-50'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Шүүлтүүр
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => router.push('/listings')}
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              Арилгах
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Districts */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Дүүрэг</div>
              <div className="grid grid-cols-2 gap-1">
                {DISTRICTS.map((d) => (
                  <label key={d} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentDistricts.includes(d)}
                      onChange={() => toggleDistrict(d)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">{d}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Үнийн хэмжээ (₮)</div>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Доод үнэ"
                  defaultValue={currentMinPrice}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onBlur={(e) => updateParam({ min_price: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Дээд үнэ"
                  defaultValue={currentMaxPrice}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary/20"
                  onBlur={(e) => updateParam({ max_price: e.target.value })}
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Өрөөний тоо</div>
              <div className="flex gap-2 flex-wrap">
                {['', '1', '2', '3', '4'].map((b) => (
                  <button
                    key={b}
                    onClick={() => updateParam({ bedrooms: b })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      currentBedrooms === b
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {b === '' ? 'Бүгд' : b === '4' ? '4+' : `${b} өр`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
