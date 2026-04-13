'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { PlacePinWrapper } from '@/components/MapWrapper'
import { DISTRICTS, PROPERTY_TYPE_LABELS, TYPE_LABELS } from '@/lib/utils'
import { ListingType, PropertyType } from '@/lib/types'

interface FormData {
  // Step 1
  listing_type: ListingType
  property_type: PropertyType
  title: string
  description: string
  // Step 2
  price: string
  price_period: 'month' | 'total'
  bedrooms: string
  bathrooms: string
  area_sqm: string
  floor: string
  total_floors: string
  district: string
  address: string
  // Step 3
  lat: number | null
  lng: number | null
  images: File[]
}

const INITIAL: FormData = {
  listing_type: 'rent',
  property_type: 'apartment',
  title: '',
  description: '',
  price: '',
  price_period: 'month',
  bedrooms: '',
  bathrooms: '',
  area_sqm: '',
  floor: '',
  total_floors: '',
  district: '',
  address: '',
  lat: null,
  lng: null,
  images: [],
}

export default function PostPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [uploading, setUploading] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const set = (key: keyof FormData, value: any) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const validateStep1 = () => {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = 'Гарчиг оруулна уу'
    if (form.title.trim().length < 10) e.title = 'Гарчиг хамгийн багадаа 10 тэмдэгт байх ёстой'
    if (!form.description.trim()) e.description = 'Тайлбар оруулна уу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e: typeof errors = {}
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = 'Зөв үнэ оруулна уу'
    if (!form.district) e.district = 'Дүүрэг сонгоно уу'
    if (!form.area_sqm || isNaN(Number(form.area_sqm))) e.area_sqm = 'Талбайн хэмжээ оруулна уу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e: typeof errors = {}
    if (!form.lat || !form.lng) e.lat = 'Газрын зураг дээр байршлаа тэмдэглэнэ үү'
    if (form.images.length === 0) e.images = 'Хамгийн багадаа 1 зураг оруулна уу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep((s) => s + 1)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const combined = [...form.images, ...files].slice(0, 8)
    set('images', combined)
    const urls = combined.map((f) => URL.createObjectURL(f))
    setPreviewUrls(urls)
  }

  const removeImage = (i: number) => {
    const imgs = form.images.filter((_, idx) => idx !== i)
    set('images', imgs)
    setPreviewUrls(imgs.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    if (!validateStep3()) return

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Upload images
      const imageUrls: string[] = []
      for (const file of form.images) {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage
          .from('listing-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from('listing-images').getPublicUrl(path)
          imageUrls.push(publicUrl)
        }
      }

      // Insert listing
      const { data, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          listing_type: form.listing_type,
          property_type: form.property_type,
          price: parseInt(form.price),
          price_period: form.price_period,
          bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
          bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
          area_sqm: form.area_sqm ? parseInt(form.area_sqm) : null,
          floor: form.floor ? parseInt(form.floor) : null,
          total_floors: form.total_floors ? parseInt(form.total_floors) : null,
          district: form.district,
          address: form.address.trim() || null,
          lat: form.lat,
          lng: form.lng,
          images: imageUrls,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      router.push(`/listings/${data.id}`)
    } catch (err: any) {
      alert('Алдаа гарлаа: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-secondary mb-2">Шинэ зар нэмэх</h1>
          <p className="text-gray-500">Таны зарыг мянга мянган хэрэглэгч харах болно</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[
            { n: 1, label: 'Үндсэн мэдээлэл' },
            { n: 2, label: 'Дэлгэрэнгүй' },
            { n: 3, label: 'Байршил & Зураг' },
          ].map(({ n, label }, i) => (
            <div key={n} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > n ? 'bg-green-500 text-white' : step === n ? 'bg-primary text-white shadow-warm' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > n ? '✓' : n}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === n ? 'text-primary' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-16 h-0.5 mx-1 mb-5 transition-colors ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-card shadow-card p-6 md:p-8">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-secondary">Үндсэн мэдээлэл</h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Зарын төрөл</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['rent', 'sale'] as ListingType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { set('listing_type', t); set('price_period', t === 'rent' ? 'month' : 'total') }}
                        className={`py-2.5 rounded-input text-sm font-semibold border-2 transition-all ${
                          form.listing_type === t
                            ? 'border-primary bg-red-50 text-primary'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Үл хөдлөх хөрөнгийн төрөл</label>
                  <select
                    value={form.property_type}
                    onChange={(e) => set('property_type', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Гарчиг <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Жишээ нь: Баянзүрх дүүрэгт 2 өрөө орон сууц түрээслэнэ"
                  className={`w-full px-4 py-3 border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                <p className="mt-1 text-xs text-gray-400">{form.title.length}/100 тэмдэгт</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Дэлгэрэнгүй тайлбар <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Орон сууцны онцлог, тохижилт, давуу тал зэргийг дэлгэрэнгүй бичнэ үү..."
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-secondary">Дэлгэрэнгүй мэдээлэл</h2>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Үнэ (төгрөгөөр) <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-3 text-gray-400 font-medium">₮</span>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder={form.listing_type === 'rent' ? '800,000' : '200,000,000'}
                      className={`w-full pl-7 pr-4 py-3 border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.price ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
                    />
                  </div>
                  {form.listing_type === 'rent' && (
                    <select
                      value={form.price_period}
                      onChange={(e) => set('price_period', e.target.value)}
                      className="px-3 py-3 border border-gray-200 rounded-input text-sm focus:outline-none bg-gray-50"
                    >
                      <option value="month">/ сар</option>
                      <option value="total">Нийт</option>
                    </select>
                  )}
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                {form.price && (
                  <p className="mt-1 text-xs text-green-600 font-medium">
                    ₮{parseInt(form.price || '0').toLocaleString('en-US')}
                    {form.listing_type === 'rent' && form.price_period === 'month' ? '/сар' : ''}
                  </p>
                )}
              </div>

              {/* Rooms */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Өрөөний тоо</label>
                  <input
                    type="number" min="0" max="20"
                    value={form.bedrooms}
                    onChange={(e) => set('bedrooms', e.target.value)}
                    placeholder="2"
                    className="w-full px-3 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Угаалгын өрөо</label>
                  <input
                    type="number" min="0" max="10"
                    value={form.bathrooms}
                    onChange={(e) => set('bathrooms', e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Талбай (м²) <span className="text-red-400">*</span></label>
                  <input
                    type="number" min="1"
                    value={form.area_sqm}
                    onChange={(e) => set('area_sqm', e.target.value)}
                    placeholder="52"
                    className={`w-full px-3 py-3 border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.area_sqm ? 'border-red-400' : 'border-gray-200 focus:border-primary'}`}
                  />
                  {errors.area_sqm && <p className="mt-1 text-xs text-red-500">{errors.area_sqm}</p>}
                </div>
              </div>

              {/* Floor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Давхар</label>
                  <input
                    type="number" min="1"
                    value={form.floor}
                    onChange={(e) => set('floor', e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Нийт давхар</label>
                  <input
                    type="number" min="1"
                    value={form.total_floors}
                    onChange={(e) => set('total_floors', e.target.value)}
                    placeholder="12"
                    className="w-full px-3 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* District */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Дүүрэг <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DISTRICTS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => set('district', d)}
                      className={`py-2.5 px-3 rounded-input text-sm font-medium border-2 transition-all text-left ${
                        form.district === d
                          ? 'border-primary bg-red-50 text-primary'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      📍 {d}
                    </button>
                  ))}
                </div>
                {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Хаяг</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Жишээ нь: 23-р хороо, Сансарын гудамж"
                  className="w-full px-4 py-3 border border-gray-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-secondary">Байршил & Зураг</h2>

              {/* Map */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Байршлаа газрын зураг дээр тэмдэглэнэ үү <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">Газрын зураг дээр дарж байршлаа тогтооно уу</p>
                <div className="h-72 rounded-card overflow-hidden border-2 border-dashed border-gray-200">
                  <PlacePinWrapper
                    lat={form.lat}
                    lng={form.lng}
                    onPlace={(lat, lng) => { set('lat', lat); set('lng', lng) }}
                  />
                </div>
                {form.lat && form.lng && (
                  <p className="mt-1.5 text-xs text-green-600 font-medium">
                    ✓ Байршил тогтоогдлоо: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                  </p>
                )}
                {errors.lat && <p className="mt-1 text-xs text-red-500">{errors.lat}</p>}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Зураг оруулах <span className="text-red-400">*</span>
                  <span className="font-normal text-gray-400 ml-2">({form.images.length}/8)</span>
                </label>

                {/* Upload area */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={form.images.length >= 8}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-card text-center hover:border-primary hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-3xl mb-2">📸</div>
                  <div className="text-sm font-medium text-gray-600">Зураг оруулахын тулд дарна уу</div>
                  <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — хамгийн ихдээ 8 зураг</div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}

                {/* Preview grid */}
                {previewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image src={url} alt={`Зураг ${i + 1}`} fill className="object-cover" sizes="100px" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                            Үндсэн
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 border border-gray-200 rounded-input text-sm font-medium text-gray-600 hover:border-gray-300 transition-colors"
              >
                ← Өмнөх
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary text-white rounded-input text-sm font-semibold hover:bg-primary-600 transition-colors shadow-warm"
              >
                Дараах →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploading}
                className="px-6 py-2.5 bg-primary text-white rounded-input text-sm font-semibold hover:bg-primary-600 transition-colors shadow-warm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Нийтлэж байна...
                  </>
                ) : (
                  '✓ Зар нийтлэх'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
