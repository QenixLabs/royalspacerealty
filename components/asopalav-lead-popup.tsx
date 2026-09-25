'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, MessageCircle, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getPopupSchedule,
  isPopupPathEligible,
  isPopupSuppressed,
  POPUP_STORAGE_KEYS,
  shouldEnterPopupFlow,
} from '@/lib/lead-popup'

const WHATSAPP_URL = 'https://wa.link/b9joi2'
const PROJECT_SLUG = 'modirealty-asopalav-kandivali'

function readTimestamp(key: string) {
  const stored = window.localStorage.getItem(key)
  if (!stored) return undefined
  const parsed = Number(stored)
  return Number.isFinite(parsed) ? parsed : undefined
}

function writeStorage(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value)
  } catch {
    // Private browsing and strict privacy settings can disable web storage.
  }
}

export function AsopalavLeadPopup() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const selectedForSession = useRef<boolean | null>(null)
  const sessionSchedule = useRef<ReturnType<typeof getPopupSchedule> | undefined>(undefined)
  const shownThisSession = useRef(false)
  const converted = useRef(false)

  useEffect(() => {
    if (!isPopupPathEligible(pathname)) {
      setOpen(false)
      return
    }
    if (shownThisSession.current) return

    try {
      if (window.sessionStorage.getItem(POPUP_STORAGE_KEYS.sessionSeen) === 'true') {
        shownThisSession.current = true
        return
      }

      if (
        isPopupSuppressed({
          dismissedAt: readTimestamp(POPUP_STORAGE_KEYS.dismissedAt),
          submittedAt: readTimestamp(POPUP_STORAGE_KEYS.submittedAt),
        })
      ) {
        return
      }

      const storedSelection = window.sessionStorage.getItem(POPUP_STORAGE_KEYS.sessionSelected)
      if (storedSelection) {
        selectedForSession.current = storedSelection === 'true'
      } else {
        selectedForSession.current = shouldEnterPopupFlow()
        writeStorage(
          window.sessionStorage,
          POPUP_STORAGE_KEYS.sessionSelected,
          String(selectedForSession.current),
        )
      }
    } catch {
      selectedForSession.current ??= shouldEnterPopupFlow()
    }

    if (!selectedForSession.current) return

    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768
    const schedule = getPopupSchedule(sessionSchedule.current, isMobile)
    sessionSchedule.current = schedule
    const scrollThreshold = isMobile ? 0.35 : 0.3
    let dwellComplete = Date.now() >= schedule.dwellAt
    let exitReady = Date.now() >= schedule.exitAt
    let opened = false
    let lastTypingAt = 0
    let retryTimer: number | undefined

    const hasScrolledEnough = () => {
      const availableScroll = document.documentElement.scrollHeight - window.innerHeight
      return availableScroll <= 0 || window.scrollY / availableScroll >= scrollThreshold
    }

    const hasOpenDialog = () => Boolean(document.querySelector('[role="dialog"], [aria-modal="true"]'))

    const showPopup = () => {
      if (opened || shownThisSession.current) return
      const isTyping = Date.now() - lastTypingAt < 5_000
      if (isTyping || hasOpenDialog()) {
        window.clearTimeout(retryTimer)
        retryTimer = window.setTimeout(showPopup, 3_000)
        return
      }

      opened = true
      shownThisSession.current = true
      writeStorage(window.sessionStorage, POPUP_STORAGE_KEYS.sessionSeen, 'true')
      setOpen(true)
    }

    const tryEngagementTrigger = () => {
      if (dwellComplete && hasScrolledEnough()) showPopup()
    }

    const onScroll = () => tryEngagementTrigger()
    const onInput = () => {
      lastTypingAt = Date.now()
    }
    const onMouseOut = (event: MouseEvent) => {
      if (!isMobile && exitReady && event.clientY <= 0 && !event.relatedTarget) showPopup()
    }

    const dwellTimer = window.setTimeout(() => {
      dwellComplete = true
      tryEngagementTrigger()
    }, Math.max(0, schedule.dwellAt - Date.now()))
    const exitTimer = window.setTimeout(() => {
      exitReady = true
    }, Math.max(0, schedule.exitAt - Date.now()))

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('input', onInput, true)
    document.addEventListener('mouseout', onMouseOut)

    return () => {
      window.clearTimeout(dwellTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(retryTimer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [pathname])

  function markConverted() {
    converted.current = true
    shownThisSession.current = true
    writeStorage(window.localStorage, POPUP_STORAGE_KEYS.submittedAt, String(Date.now()))
    writeStorage(window.sessionStorage, POPUP_STORAGE_KEYS.sessionSeen, 'true')
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && open && !converted.current) {
      writeStorage(window.localStorage, POPUP_STORAGE_KEYS.dismissedAt, String(Date.now()))
    }
    setOpen(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          phone: `+91 ${form.get('phone')}`,
          email: form.get('email'),
          intent: 'Buy',
          propertySlug: PROJECT_SLUG,
          message: 'Interested in Modirealty Asopalav, Kandivali West.',
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not send your enquiry.')

      markConverted()
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send your enquiry. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rs-lead-popup" showCloseButton={false}>
        <button
          type="button"
          className="rs-lead-close"
          aria-label="Close enquiry form"
          onClick={() => handleOpenChange(false)}
        >
          <X aria-hidden="true" />
        </button>

        <header className="rs-lead-header">
          <DialogTitle className="rs-lead-lockup">
            <span className="rs-lead-the">The</span>
            <span className="rs-lead-developer">MODIREALTY</span>
            <span className="rs-lead-project">ASOPALAV</span>
            <span className="rs-lead-location">KANDIVALI</span>
          </DialogTitle>
          <DialogDescription className="rs-lead-description">
            Get price, floor plan &amp; exclusive offers
          </DialogDescription>
        </header>

        {submitted ? (
          <div className="rs-lead-success" aria-live="polite">
            <CheckCircle2 aria-hidden="true" />
            <h3>Enquiry received</h3>
            <p>Our property advisor will contact you shortly.</p>
            <button type="button" onClick={() => handleOpenChange(false)}>CLOSE</button>
          </div>
        ) : (
          <div className="rs-lead-body">
            <form className="rs-lead-form" onSubmit={handleSubmit}>
              <label>
                <span className="sr-only">Full name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  minLength={2}
                  required
                />
              </label>
              <label>
                <span className="sr-only">Email address</span>
                <input
                  name="email"
                  type="email"
                  placeholder="Email address (optional)"
                  autoComplete="email"
                />
              </label>
              <label className="rs-lead-phone">
                <span className="sr-only">Mobile number</span>
                <span aria-hidden="true">+91</span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Mobile number"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number"
                  required
                />
              </label>

              {error && <p className="rs-lead-error" role="alert">{error}</p>}

              <button type="submit" className="rs-lead-submit" disabled={loading}>
                {loading ? 'SENDING…' : 'GET PRICE & FLOOR PLAN'}
              </button>
            </form>

            <div className="rs-lead-divider" aria-hidden="true"><span>OR</span></div>

            <a
              className="rs-lead-whatsapp"
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle aria-hidden="true" />
              CONNECT ON WHATSAPP
            </a>
            <p className="rs-lead-privacy">We’ll only use your details to respond to this enquiry.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AsopalavLeadPopup
