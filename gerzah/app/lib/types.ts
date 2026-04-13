export type ListingType = 'rent' | 'sale'
export type PropertyType = 'apartment' | 'house' | 'land' | 'office'
export type PricePeriod = 'month' | 'total'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description: string | null
  listing_type: ListingType
  property_type: PropertyType
  price: number
  price_period: PricePeriod
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  floor: number | null
  total_floors: number | null
  district: string | null
  address: string | null
  lat: number | null
  lng: number | null
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface SearchFilters {
  query?: string
  listing_type?: ListingType | ''
  property_type?: PropertyType | ''
  district?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
}
