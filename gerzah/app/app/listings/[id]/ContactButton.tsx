'use client'

import { useState } from 'react'

interface Props {
  phone?: string
}

export default function ContactButton({ phone }: Props) {
  const [revealed, setRevealed] = useState(false)

  if (!phone) {
    return (
      <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-input text-sm text-center font-medium">
        Утасны дугаар байхгүй
      </div>
    )
  }

  const maskedPhone = phone.slice(0, 4) + '****'

  return revealed ? (
    <a
      href={`tel:${phone}`}
      className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-input font-semibold transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      {phone}
    </a>
  ) : (
    <button
      onClick={() => setRevealed(true)}
      className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary-600 text-white rounded-input font-semibold transition-colors"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      Утас харах — {maskedPhone}
    </button>
  )
}
