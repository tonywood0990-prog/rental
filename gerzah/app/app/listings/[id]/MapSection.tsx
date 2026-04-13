'use client'

import { SingleMapWrapper } from '@/components/MapWrapper'

interface Props {
  lat: number
  lng: number
  title: string
}

export default function MapSection({ lat, lng, title }: Props) {
  return <SingleMapWrapper lat={lat} lng={lng} title={title} />
}
