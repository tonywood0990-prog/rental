'use client'

// Pigeon Maps is pure React — no dynamic import / ssr:false needed
import { MultiListingMap, SingleListingMap, PlacePinMap } from './MapClient'
import { Listing } from '@/lib/types'

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
