'use client'
import { useState } from 'react'
import { X, Star } from 'lucide-react'

export type Img = { public_id: string; secure_url: string; cover?: boolean }

export function ImageUploader({ slug, images, onChange }: { slug: string; images: Img[]; onChange: (v: Img[]) => void }) {
  const [busy, setBusy] = useState(false)
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
    }
  }
  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files)} aria-label="Upload property images" />
      {busy && <p aria-live="polite">Uploading…</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10, marginTop: 10 }}>
        {images.map((img, i) => (
          <div key={img.public_id} style={{ position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_400/')} alt="" width={200} height={130} style={{ width: '100%', height: 90, objectFit: 'cover' }} loading="lazy" />
            <button type="button" onClick={() => onChange(images.map((x, j) => ({ ...x, cover: j === i })))} aria-label="Set cover"><Star size={14} /></button>
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} aria-label="Remove image"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
