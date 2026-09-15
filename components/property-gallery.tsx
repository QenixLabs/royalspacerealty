'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type PropertyGalleryProps = {
  images: string[]
  alt: string
}

export function PropertyGallery({ images, alt }: PropertyGalleryProps) {
  const [active, setActive] = useState(0)
  const count = images.length

  const prev = useCallback(() => setActive((i) => (i - 1 + count) % count), [count])
  const next = useCallback(() => setActive((i) => (i + 1) % count), [count])

  useEffect(() => {
    if (count <= 1) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, prev, next])

  if (count === 0) return null

  return (
    <div className="rs-gallery">
      <div className="rs-gallery-main">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} — photo ${i + 1} of ${count}`}
            className={i === active ? 'is-active' : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        {count > 1 && (
          <>
            <button
              type="button"
              className="rs-gallery-nav is-prev"
              onClick={prev}
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="rs-gallery-nav is-next"
              onClick={next}
              aria-label="Next photo"
            >
              <ChevronRight size={20} />
            </button>
            <span className="rs-gallery-count">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="rs-gallery-thumbs" role="tablist" aria-label="Photo thumbnails">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1}`}
              className={i === active ? 'is-active' : ''}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertyGallery
