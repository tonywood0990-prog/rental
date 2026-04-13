import { Suspense } from 'react'
import ListingsClient from './ListingsClient'

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen pt-16 items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm text-gray-500">Ачааллаж байна...</span>
      </div>
    }>
      <ListingsClient />
    </Suspense>
  )
}
