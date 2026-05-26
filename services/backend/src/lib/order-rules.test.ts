import { describe, expect, it } from 'vitest'
import { calculateOrderTotal, getAllowedActions, resolveAction, validateTransition } from './order-rules'

describe('order rules', () => {
  it('allows valid transitions', () => {
    expect(validateTransition('pending', 'accepted')).toEqual({ ok: true })
    expect(validateTransition('accepted', 'preparing')).toEqual({ ok: true })
    expect(validateTransition('ready', 'completed')).toEqual({ ok: true })
  })

  it('rejects invalid transitions', () => {
    expect(validateTransition('pending', 'ready')).toEqual({
      ok: false,
      reason: 'Invalid transition from pending to ready.'
    })
  })

  it('calculates totals using quantity and unit price', () => {
    expect(
      calculateOrderTotal([
        { quantity: 2, unitPrice: 12.5 },
        { quantity: 1, unitPrice: 17.5 }
      ])
    ).toBe(42.5)
  })

  it('maps actions to target statuses', () => {
    expect(resolveAction('accept')).toBe('accepted')
    expect(getAllowedActions('pending')).toEqual(['accept', 'cancel'])
  })
})
