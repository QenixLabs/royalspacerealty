import assert from 'node:assert/strict'
import test from 'node:test'

async function loadScheduler() {
  try {
    return await import('./lead-popup.ts')
  } catch {
    assert.fail('Lead popup scheduler is not implemented.')
  }
}

test('uses a random 35-55 second desktop delay', async () => {
  const { getPopupDelayMs } = await loadScheduler()

  assert.equal(getPopupDelayMs(false, () => 0), 35_000)
  assert.equal(getPopupDelayMs(false, () => 1), 55_000)
})

test('uses a random 45-70 second mobile delay', async () => {
  const { getPopupDelayMs } = await loadScheduler()

  assert.equal(getPopupDelayMs(true, () => 0), 45_000)
  assert.equal(getPopupDelayMs(true, () => 1), 70_000)
})

test('admits sixty percent of otherwise eligible sessions', async () => {
  const { shouldEnterPopupFlow } = await loadScheduler()

  assert.equal(shouldEnterPopupFlow(() => 0.59), true)
  assert.equal(shouldEnterPopupFlow(() => 0.6), false)
})

test('keeps the original trigger deadlines across route changes', async () => {
  const { getPopupSchedule } = await loadScheduler()
  const initial = getPopupSchedule(undefined, false, 1_000, () => 0.5)
  const afterNavigation = getPopupSchedule(initial, false, 20_000, () => 0)

  assert.deepEqual(initial, { dwellAt: 46_000, exitAt: 16_000 })
  assert.equal(afterNavigation, initial)
})

test('excludes contact and admin routes', async () => {
  const { isPopupPathEligible } = await loadScheduler()

  assert.equal(isPopupPathEligible('/'), true)
  assert.equal(isPopupPathEligible('/projects/modirealty-asopalav'), true)
  assert.equal(isPopupPathEligible('/contact'), false)
  assert.equal(isPopupPathEligible('/contact/'), false)
  assert.equal(isPopupPathEligible('/admin'), false)
  assert.equal(isPopupPathEligible('/admin/inquiries'), false)
})

test('suppresses for seven days after dismissal', async () => {
  const { isPopupSuppressed } = await loadScheduler()
  const now = Date.UTC(2026, 8, 25)
  const day = 24 * 60 * 60 * 1_000

  assert.equal(isPopupSuppressed({ dismissedAt: now - 6 * day }, now), true)
  assert.equal(isPopupSuppressed({ dismissedAt: now - 7 * day }, now), false)
})

test('suppresses for thirty days after submission', async () => {
  const { isPopupSuppressed } = await loadScheduler()
  const now = Date.UTC(2026, 8, 25)
  const day = 24 * 60 * 60 * 1_000

  assert.equal(isPopupSuppressed({ submittedAt: now - 29 * day }, now), true)
  assert.equal(isPopupSuppressed({ submittedAt: now - 30 * day }, now), false)
})
