'use client'

import dynamic from 'next/dynamic'
import { Listing } from '@/lib/types'

// All map components must be dynamically imported with ssr: false
// because Leaflet directly accesses window/document

const { MultiListingMap, SingleListingMap, PlacePinMap } = {
  MultiListingMap: dynamic(
    () => import('./MapClient').then((m) => m.MultiListingMap),
    { ssr: false, loading: () => <MapLoading /> }
  ),
  SingleListingMap: dynamic(
    () => import('./MapClient').then((m) => m.SingleListingMap),
    { ssr: false, loading: () => <MapLoading /> }
  ),
  PlacePinMap: dynamic(
    () => import('./MapClient').then((m) => m.PlacePinMap),
    { ssr: false, loading: () => <MapLoading /> }
  ),
}

function MapLoading() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-card">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Газрын зураг ачааллаж байна...</span>
      </div>
    </div>
  )
}

// ─── Exports ───────────────────────────────────────────────────────────────

interface MultiMapWrapperProps {
  listings: Listing[]
  activeId: string | null
  onPinClick: (id: string) => void
}
export function MultiMapWrapper(props: MultiMapWrapperProps) {
  return <MultiListingMap {...props} />
}

interface SingleMapWrapperProps {
  lat: number
  lng: number
  title: string
}
export function SingleMapWrapper(props: SingleMapWrapperProps) {
  return <SingleListingMap {...props} />
}

interface PlacePinWrapperProps {
  lat: number | null
  lng: number | null
  onPlace: (lat: number, lng: number) => void
}
export function PlacePinWrapper(props: PlacePinWrapperProps) {
  return <PlacePinMap {...props} />
}
