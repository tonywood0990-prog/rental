'use client'

import { useEffect, useRef, useState } from 'react'
import { Map, Marker, Overlay } from 'pigeon-maps'
import { osm } from 'pigeon-maps/providers'
import Link from 'next/link'
import { Listing } from '@/lib/types'
import { formatPrice, TYPE_LABELS, UB_CENTER, UB_ZOOM } from '@/lib/utils'

// ─── Responsive map wrapper ────────────────────────────────────────────────
// pigeon-maps needs explicit pixel width/height — we measure the container

function ResponsiveMap({ children, ...props }: React.ComponentProps<typeof Map>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDims({ width: Math.round(width), height: Math.round(height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {dims.height > 0 && (
        <Map
          provider={osm}
          width={dims.width}
          height={dims.height}
          {...props}
        >
          {children}
        </Map>
      )}
    </div>
  )
}

// ─── Pin components ────────────────────────────────────────────────────────

function RentPin({ active }: { active?: boolean }) {
  const size = active ? 36 : 28
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50% 50% 50% 0',
      background: '#2563EB',
      transform: 'rotate(-45deg)',
      border: '2px solid white',
      boxShadow: active ? '0 4px 12px rgba(37,99,235,0.5)' : '0 2px 6px rgba(0,0,0,0.25)',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }} />
  )
}

function SalePin({ active }: { active?: boolean }) {
  const size = active ? 36 : 28
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50% 50% 50% 0',
      background: '#16A34A',
      transform: 'rotate(-45deg)',
      border: '2px solid white',
      boxShadow: active ? '0 4px 12px rgba(22,163,74,0.5)' : '0 2px 6px rgba(0,0,0,0.25)',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }} />
  )
}

function RedPin() {
  return (
    <div style={{
      width: 36, height: 36,
      borderRadius: '50% 50% 50% 0',
      background: '#C8102E',
      transform: 'rotate(-45deg)',
      border: '3px solid white',
      boxShadow: '0 4px 12px rgba(200,16,46,0.4)',
    }} />
  )
}

// ─── Listing popup ─────────────────────────────────────────────────────────

function ListingPopup({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const isRent = listing.listing_type === 'rent'
  return (
    <div style={{
      background: 'white', borderRadius: 10,
      boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      padding: '12px 14px', minWidth: 180, position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 6, right: 8,
        background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF',
      }}>×</button>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: isRent ? '#2563EB' : '#16A34A' }}>
        {TYPE_LABELS[listing.listing_type]}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 6 }}>
        {listing.title}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#C8102E', marginBottom: 10 }}>
        {formatPrice(listing.price, listing.price_period)}
      </div>
      <Link href={`/listings/${listing.id}`} style={{
        display: 'block', textAlign: 'center',
        background: '#C8102E', color: 'white',
        borderRadius: 6, padding: '6px 12px',
        fontSize: 12, fontWeight: 600, textDecoration: 'none',
      }}>
        Дэлгэрэнгүй
      </Link>
    </div>
  )
}

// ─── Multi-listing map (browse page) ──────────────────────────────────────

interface MultiMapProps {
  listings: Listing[]
  activeId: string | null
  onPinClick: (id: string) => void
}

export function MultiListingMap({ listings, activeId, onPinClick }: MultiMapProps) {
  const [popupId, setPopupId] = useState<string | null>(null)
  const withCoords = listings.filter((l) => l.lat && l.lng)
  const popupListing = withCoords.find((l) => l.id === popupId)

  return (
    <ResponsiveMap center={UB_CENTER} zoom={UB_ZOOM}>
      {withCoords.map((listing) => {
        const isActive = listing.id === activeId
        const anchor: [number, number] = [listing.lat!, listing.lng!]
        return (
          <Overlay key={listing.id} anchor={anchor} offset={[14, 28]}>
            <div onClick={() => { onPinClick(listing.id); setPopupId(listing.id) }}>
              {listing.listing_type === 'rent'
                ? <RentPin active={isActive} />
                : <SalePin active={isActive} />}
            </div>
          </Overlay>
        )
      })}
      {popupListing?.lat && popupListing?.lng && (
        <Overlay anchor={[popupListing.lat, popupListing.lng]} offset={[-90, 140]}>
          <ListingPopup listing={popupListing} onClose={() => setPopupId(null)} />
        </Overlay>
      )}
    </ResponsiveMap>
  )
}

// ─── Single listing map (detail page) ─────────────────────────────────────

export function SingleListingMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  return (
    <ResponsiveMap center={[lat, lng]} zoom={15} mouseEvents={false} touchEvents={false}>
      <Overlay anchor={[lat, lng]} offset={[18, 36]}>
        <RedPin />
      </Overlay>
    </ResponsiveMap>
  )
}

// ─── Click-to-place map (post listing form) ────────────────────────────────

export function PlacePinMap({ lat, lng, onPlace }: { lat: number | null; lng: number | null; onPlace: (lat: number, lng: number) => void }) {
  return (
    <ResponsiveMap
      center={UB_CENTER}
      zoom={UB_ZOOM}
      onClick={({ latLng }: { latLng: [number, number] }) => onPlace(latLng[0], latLng[1])}
    >
      {lat !== null && lng !== null && (
        <Overlay anchor={[lat, lng]} offset={[18, 36]}>
          <RedPin />
        </Overlay>
      )}
    </ResponsiveMap>
  )
}
