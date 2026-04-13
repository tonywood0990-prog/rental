import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-secondary text-white mt-16">
      {/* Ornamental top bar */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">Г</span>
              </div>
              <div>
                <div className="font-extrabold text-lg">GerZah</div>
                <div className="text-xs text-gray-400">Гэр Зах</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Монгол дахь таны хамгийн сайн гэрийг олоход туслах платформ.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4 text-accent">Үйлчилгээ</h3>
            <ul className="space-y-2.5">
              <li><Link href="/listings?type=rent" className="text-gray-400 text-sm hover:text-white transition-colors">Түрээслэх</Link></li>
              <li><Link href="/listings?type=sale" className="text-gray-400 text-sm hover:text-white transition-colors">Худалдах/Авах</Link></li>
              <li><Link href="/post" className="text-gray-400 text-sm hover:text-white transition-colors">Зар оруулах</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-accent">Дүүргүүд</h3>
            <ul className="space-y-2.5">
              {['Баянзүрх', 'Сүхбаатар', 'Чингэлтэй', 'Хан-Уул'].map((d) => (
                <li key={d}>
                  <Link href={`/listings?district=${d}`} className="text-gray-400 text-sm hover:text-white transition-colors">{d}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-4 text-accent">Холбоо барих</h3>
            <ul className="space-y-2.5">
              <li className="text-gray-400 text-sm">Улаанбаатар, Монгол</li>
              <li className="text-gray-400 text-sm">info@gerzah.mn</li>
              <li><Link href="/register" className="text-gray-400 text-sm hover:text-white transition-colors">Бүртгүүлэх</Link></li>
              <li><Link href="/login" className="text-gray-400 text-sm hover:text-white transition-colors">Нэвтрэх</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2025 GerZah (Гэр Зах). Бүх эрх хуулиар хамгаалагдсан.
          </p>
          <p className="text-gray-600 text-xs">
            Монгол Улсын үл хөдлөх хөрөнгийн зах зээл
          </p>
        </div>
      </div>
    </footer>
  )
}
