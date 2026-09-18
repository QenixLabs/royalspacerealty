'use client'
import { useRef, useState } from 'react'
import { Star, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

export type Img = { public_id: string; secure_url: string; cover?: boolean }

export function ImageUploader({ slug, images, onChange }: { slug: string; images: Img[]; onChange: (v: Img[]) => void }) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const maxed = images.length >= 10

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    try {
      const sign = await (await fetch('/api/admin/sign-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: slug }) })).json()
      const next = [...images]
      for (const f of Array.from(files).slice(0, 10 - images.length)) {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('api_key', sign.apiKey)
        fd.append('timestamp', String(sign.timestamp))
        fd.append('folder', sign.folder)
        fd.append('signature', sign.signature)
        const up = await (await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: fd })).json()
        next.push({ public_id: up.public_id, secure_url: up.secure_url, cover: next.length === 0 })
      }
      onChange(next)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={busy || maxed}
          onClick={() => inputRef.current?.click()}
          aria-label="Upload property images"
        >
          <Upload aria-hidden="true" />
          {busy ? 'Uploading…' : 'Upload images'}
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {busy ? 'Uploading…' : `${images.length}/10 images`}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
          aria-label="Upload property images"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.public_id} className="group relative overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')}
              alt=""
              width={200}
              height={130}
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 top-0 flex justify-end gap-1 bg-gradient-to-b from-black/40 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onChange(images.map((x, j) => ({ ...x, cover: j === i })))}
                aria-label="Set cover"
                aria-pressed={!!img.cover}
                className={cn('bg-white/80 hover:bg-white', img.cover && 'text-amber-500 hover:text-amber-600')}
              >
                <Star aria-hidden="true" fill={img.cover ? 'currentColor' : 'none'} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                aria-label="Remove image"
                className="bg-white/80 hover:bg-white"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
            {img.cover && (
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
