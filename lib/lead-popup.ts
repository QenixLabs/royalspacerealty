const DAY_MS = 24 * 60 * 60 * 1_000

export const POPUP_STORAGE_KEYS = {
  dismissedAt: 'rs-asopalav-popup-dismissed-at',
  submittedAt: 'rs-asopalav-popup-submitted-at',
  sessionSeen: 'rs-asopalav-popup-seen',
  sessionSelected: 'rs-asopalav-popup-selected',
} as const

export function getPopupDelayMs(isMobile: boolean, random = Math.random) {
  const [minimum, maximum] = isMobile ? [45_000, 70_000] : [35_000, 55_000]
  const value = Math.min(1, Math.max(0, random()))
  return minimum + Math.round((maximum - minimum) * value)
}

export function shouldEnterPopupFlow(random = Math.random) {
  return random() < 0.6
}

export type PopupSchedule = { dwellAt: number; exitAt: number }

export function getPopupSchedule(
  existing: PopupSchedule | undefined,
  isMobile: boolean,
  now = Date.now(),
  random = Math.random,
) {
  if (existing) return existing
  return {
    dwellAt: now + getPopupDelayMs(isMobile, random),
    exitAt: now + 15_000,
  }
}

export function isPopupPathEligible(pathname: string) {
  return !(
    pathname === '/contact' ||
    pathname.startsWith('/contact/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  )
}

export function isPopupSuppressed(
  timestamps: { dismissedAt?: number; submittedAt?: number },
  now = Date.now(),
) {
  const dismissedRecently =
    typeof timestamps.dismissedAt === 'number' && now - timestamps.dismissedAt < 7 * DAY_MS
  const submittedRecently =
    typeof timestamps.submittedAt === 'number' && now - timestamps.submittedAt < 30 * DAY_MS

  return dismissedRecently || submittedRecently
}
