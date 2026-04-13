'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const safeImages = images && images.length > 0
    ? images
    : ['https://picsum.photos/800/600?random=99']

  const prev = () => setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1))
  const next = () => setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1))

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative w-full h-[420px] rounded-card overflow-hidden bg-gray-100 cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={safeImages[activeIndex]}
            alt={`${title} — зураг ${activeIndex + 1}`}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          {/* Overlay controls */}
          <div className="absolute inset-0 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              ›
            </button>
          </div>
          {/* Counter */}
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-full">
            {activeIndex + 1} / {safeImages.length}
          </div>
          {/* Expand icon */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </div>
        </div>

        {/* Thumbnails */}
        {safeImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {safeImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`flex-shrink-0 relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  i === activeIndex
                    ? 'border-primary shadow-warm'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={src}
                  alt={`Дүрс ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl"
          >
            ×
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-2xl"
          >
            ‹
          </button>
          <div
            className="relative max-w-4xl w-full max-h-[80vh] aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={safeImages[activeIndex]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-2xl"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeIndex + 1} / {safeImages.length}
          </div>
        </div>
      )}
    </>
  )
}
