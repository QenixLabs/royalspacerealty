import assert from 'node:assert/strict'
import test from 'node:test'

test('reopens the popup every fifteen seconds', async () => {
  const { POPUP_INTERVAL_MS } = await import('./lead-popup.ts')

  assert.equal(POPUP_INTERVAL_MS, 15_000)
})
