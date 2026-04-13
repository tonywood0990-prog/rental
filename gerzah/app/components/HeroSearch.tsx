'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DISTRICTS } from '@/lib/utils'

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (district) params.set('district', district)
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Гэр хайх... (жишээ нь: Баянзүрх, 2 өрөө)"
          className="flex-1 px-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="px-4 py-3 bg-white rounded-xl text-gray-700 focus:outline-none text-sm min-w-[140px]"
        >
          <option value="">Бүх дүүрэг</option>
          {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 transition-colors whitespace-nowrap"
        >
          Хайх
        </button>
      </div>
    </div>
  )
}
