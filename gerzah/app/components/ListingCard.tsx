import Link from 'next/link'
import Image from 'next/image'
import { Listing } from '@/lib/types'
import { formatPrice, PROPERTY_TYPE_LABELS, TYPE_LABELS, getListingImage } from '@/lib/utils'

interface Props {
  listing: Listing
  isActive?: boolean
  onHover?: (id: string | null) => void
  compact?: boolean
}

export default function ListingCard({ listing, isActive, onHover, compact }: Props) {
  const image = getListingImage(listing.images)
  const isRent = listing.listing_type === 'rent'

  return (
    <Link
      href={`/listings/${listing.id}`}
      className={`group block bg-white rounded-card overflow-hidden transition-all duration-200 ${
        isActive ? 'listing-card-active' : 'border border-gray-100 hover:shadow-card-hover hover:-translate-y-0.5'
      } shadow-card`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
        <Image
          src={image}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Type badge */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md ${
              isRent ? 'price-badge-rent' : 'price-badge-sale'
            }`}
          >
            {TYPE_LABELS[listing.listing_type]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-black/40 backdrop-blur-sm">
            {PROPERTY_TYPE_LABELS[listing.property_type]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className={`font-extrabold text-primary mb-1 ${compact ? 'text-lg' : 'text-xl'}`}>
          {formatPrice(listing.price, listing.price_period)}
        </div>

        {/* Title */}
        <h3 className={`font-semibold text-secondary line-clamp-2 mb-2 leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
          {listing.title}
        </h3>

        {/* District */}
        {listing.district && (
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{listing.district}</span>
            {listing.address && <span className="truncate text-gray-400">, {listing.address}</span>}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-gray-500 text-xs border-t border-gray-50 pt-2.5">
          {listing.bedrooms !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{listing.bedrooms} өр</span>
            </div>
          )}
          {listing.bathrooms !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{listing.bathrooms} угаалга</span>
            </div>
          )}
          {listing.area_sqm !== null && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span>{listing.area_sqm} м²</span>
            </div>
          )}
          {listing.floor !== null && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-medium">
                {listing.floor}/{listing.total_floors} давхар
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
