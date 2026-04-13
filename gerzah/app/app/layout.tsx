import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'GerZah | Гэр Зах — Монголын үл хөдлөх хөрөнгийн зах зээл',
  description: 'Монгол дахь таны хамгийн сайн гэрийг ол. Орон сууц, байшин, газар худалдах, түрээслэх.',
  keywords: 'үл хөдлөх хөрөнгө, орон сууц, байшин, газар, Улаанбаатар, түрээс, худалдаа',
  openGraph: {
    title: 'GerZah — Монголын гэр орны зах зээл',
    description: 'Монгол дахь таны хамгийн сайн гэрийг ол',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
