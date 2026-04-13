import { ListingType, PropertyType, PricePeriod } from './types'

export function formatMNT(amount: number): string {
  return '₮' + amount.toLocaleString('en-US')
}

export const DISTRICTS = [
  'Баянзүрх',
  'Сүхбаатар',
  'Чингэлтэй',
  'Хан-Уул',
  'Баянгол',
  'Налайх',
  'Багануур',
  'Сонгинохайрхан',
] as const

export const TYPE_LABELS: Record<ListingType, string> = {
  rent: 'Түрээс',
  sale: 'Худалдаа',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Орон сууц',
  house: 'Байшин',
  land: 'Газар',
  office: 'Оффис',
}

export const PRICE_PERIOD_LABELS: Record<PricePeriod, string> = {
  month: '/сар',
  total: '',
}

export function formatPrice(price: number, period: PricePeriod): string {
  const formatted = formatMNT(price)
  if (period === 'month') return `${formatted}/сар`
  return formatted
}

export function getListingImage(images: string[], index = 0): string {
  if (images && images.length > index) return images[index]
  return `https://picsum.photos/800/600?random=99`
}

export const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  apartment: '🏢',
  house: '🏠',
  land: '🌿',
  office: '🏦',
}

// Ulaanbaatar center coordinates
export const UB_CENTER: [number, number] = [47.8864, 106.9057]
export const UB_ZOOM = 12
