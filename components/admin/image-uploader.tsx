'use client'
import { useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, Star, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

export type Img = { public_id: string; secure_url: string; cover?: boolean }

function SortableImageCard({
  img,
  index,
  total,
  onSetCover,
  onRemove,
}: {
  img: Img
  index: number
  total: number
  onSetCover: () => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.public_id,
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative overflow-hidden rounded-lg border',
        isDragging && 'z-10 opacity-80 shadow-lg',
      )}
      aria-roledescription="sortable image"
      aria-label={`Image ${index + 1} of ${total}`}
    >
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
          onClick={onSetCover}
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
          aria-label="Drag to reorder"
          className="cursor-grab bg-white/80 hover:bg-white active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
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
  )
}

export function ImageUploader({ slug, images, onChange }: { slug: string; images: Img[]; onChange: (v: Img[]) => void }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const maxed = images.length >= 10

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function upload(files: FileList | File[] | null) {
    if (!files?.length) return
    const batch = Array.from(files).slice(0, 10 - images.length)
    if (!batch.length) return
    setBusy(true)
    setTotal(batch.length)
    setProgress(0)
    try {
      const sign = await (await fetch('/api/admin/sign-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: slug }) })).json()
      const next = [...images]
      for (const f of batch) {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('api_key', sign.apiKey)
        fd.append('timestamp', String(sign.timestamp))
        fd.append('folder', sign.folder)
        fd.append('signature', sign.signature)
        try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: 'POST', body: fd })
          if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`)
          const up = await res.json()
          next.push({ public_id: up.public_id, secure_url: up.secure_url, cover: next.length === 0 })
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Cloudinary upload failed')
        }
        setProgress((p) => p + 1)
      }
      onChange(next)
    } finally {
      setBusy(false)
      setTotal(0)
      setProgress(0)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const from = images.findIndex((x) => x.public_id === active.id)
    const to = images.findIndex((x) => x.public_id === over.id)
    if (from < 0 || to < 0) return
    onChange(arrayMove(images, from, to))
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={busy || maxed ? -1 : 0}
        aria-disabled={busy || maxed}
        aria-label="Upload property images"
        onClick={() => !busy && !maxed && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !busy && !maxed) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          if (busy || maxed) return
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (busy || maxed) return
          upload(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-purple-700 bg-purple-50/50' : 'border-muted-foreground/30 hover:border-muted-foreground/60',
          (busy || maxed) && 'pointer-events-none opacity-50',
        )}
      >
        {busy ? <Loader2 aria-hidden="true" className="animate-spin" /> : <Upload aria-hidden="true" />}
        <span className="text-sm font-medium">
          {busy ? `Uploading ${progress}/${total}…` : 'Drag & drop images here or click to browse'}
        </span>
        {!busy && <span className="text-xs text-muted-foreground">{images.length}/10 images</span>}
      </div>
      <span className="sr-only" aria-live="polite">
        {busy ? `Uploading ${total} images` : ''}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={busy || maxed}
        onChange={(e) => upload(e.target.files)}
        aria-label="Upload property images"
      />
      <span className="sr-only" aria-live="polite">
        Image moved
      </span>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={images.map((x) => x.public_id)}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img, i) => (
              <SortableImageCard
                key={img.public_id}
                img={img}
                index={i}
                total={images.length}
                onSetCover={() => onChange(images.map((x, j) => ({ ...x, cover: j === i })))}
                onRemove={() => onChange(images.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
