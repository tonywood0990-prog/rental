'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { Listing } from '@/lib/types'
import { formatPrice, TYPE_LABELS, UB_CENTER, UB_ZOOM } from '@/lib/utils'

// Properly removes the Leaflet instance on unmount so re-mounting works
function MapCleanup() {
  const map = useMap()
  useEffect(() => {
    return () => {
      map.remove()
    }
  }, [map])
  return null
}

// Fix default Leaflet marker icons
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

function createColoredPin(color: string, isActive: boolean) {
  const size = isActive ? 44 : 36
  const shadow = isActive ? '0 4px 12px rgba(0,0,0,0.35)' : '0 2px 6px rgba(0,0,0,0.25)'
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50% 50% 50% 0;
      background:${color};
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:${shadow};
      transition:all 0.2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    className: '',
  })
}

function createSinglePin() {
  return L.divIcon({
    html: `<div style="
      width:40px;height:40px;
      border-radius:50% 50% 50% 0;
      background:#C8102E;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 4px 12px rgba(200,16,46,0.4);
    "></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -44],
    className: '',
  })
}

// Auto-center map component
function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true })
  }, [lat, lng, map])
  return null
}

// Click to place pin component
function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  const map = useMap()
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => {
      onPlace(e.latlng.lat, e.latlng.lng)
    }
    map.on('click', handler)
    return () => { map.off('click', handler) }
  }, [map, onPlace])
  return null
}

// ─── Multi-listing map (browse page) ───────────────────────────────────────

interface MultiMapProps {
  listings: Listing[]
  activeId: string | null
  onPinClick: (id: string) => void
}

export function MultiListingMap({ listings, activeId, onPinClick }: MultiMapProps) {
  useEffect(() => { fixLeafletIcons() }, [])

  const withCoords = listings.filter((l) => l.lat && l.lng)

  return (
    <MapContainer
      center={UB_CENTER}
      zoom={UB_ZOOM}
      className="w-full h-full"
      scrollWheelZoom
    >
      <MapCleanup />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((listing) => {
        const isRent = listing.listing_type === 'rent'
        const color = isRent ? '#2563EB' : '#16A34A'
        const isActive = listing.id === activeId
        return (
          <Marker
            key={listing.id}
            position={[listing.lat!, listing.lng!]}
            icon={createColoredPin(color, isActive)}
            eventHandlers={{ click: () => onPinClick(listing.id) }}
            zIndexOffset={isActive ? 1000 : 0}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className={`text-xs font-bold mb-1 ${isRent ? 'text-blue-600' : 'text-green-600'}`}>
                  {TYPE_LABELS[listing.listing_type]}
                </div>
                <div className="font-bold text-sm text-gray-900 leading-tight mb-1">
                  {listing.title}
                </div>
                <div className="text-primary font-extrabold text-base mb-2">
                  {formatPrice(listing.price, listing.price_period)}
                </div>
                <Link
                  href={`/listings/${listing.id}`}
                  className="block text-center bg-primary text-white text-xs font-semibold py-1.5 px-3 rounded-md hover:bg-primary-600 transition-colors"
                >
                  Дэлгэрэнгүй
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

// ─── Single listing map (detail page) ──────────────────────────────────────

interface SingleMapProps {
  lat: number
  lng: number
  title: string
}

export function SingleListingMap({ lat, lng, title }: SingleMapProps) {
  useEffect(() => { fixLeafletIcons() }, [])

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="w-full h-full"
      scrollWheelZoom={false}
    >
      <MapCleanup />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={createSinglePin()}>
        <Popup>
          <div className="font-semibold text-sm text-gray-800">{title}</div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

// ─── Pin placement map (post listing form) ─────────────────────────────────

interface PlacePinMapProps {
  lat: number | null
  lng: number | null
  onPlace: (lat: number, lng: number) => void
}

export function PlacePinMap({ lat, lng, onPlace }: PlacePinMapProps) {
  useEffect(() => { fixLeafletIcons() }, [])

  return (
    <MapContainer
      center={UB_CENTER}
      zoom={UB_ZOOM}
      className="w-full h-full cursor-crosshair"
      scrollWheelZoom
    >
      <MapCleanup />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onPlace={onPlace} />
      {lat !== null && lng !== null && (
        <>
          <Marker position={[lat, lng]} icon={createSinglePin()}>
            <Popup>
              <div className="text-sm font-medium">Байршил тогтоогдлоо</div>
              <div className="text-xs text-gray-500 mt-0.5">{lat.toFixed(6)}, {lng.toFixed(6)}</div>
            </Popup>
          </Marker>
          <MapCenter lat={lat} lng={lng} />
        </>
      )}
    </MapContainer>
  )
}
