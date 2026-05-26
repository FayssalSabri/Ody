import { describe, expect, it } from 'vitest'
import { createOrderStore } from './order-store'

describe('createOrder', () => {
  it('creates an order when items are available', () => {
    const store = createOrderStore()

    const result = store.createOrder({
      customerId: 1,
      items: [{ menuItemId: 1, quantity: 2 }]
    })

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.order.total).toBe(49)
      expect(result.order.status).toBe('pending')
    }
  })

  it('rejects unavailable menu items', () => {
    const store = createOrderStore()
    store.updateMenuItem(3, { available: false })

    expect(() =>
      store.createOrder({
        customerId: 1,
        items: [{ menuItemId: 3, quantity: 1 }]
      })
    ).toThrow(/unavailable/i)
  })

  it('rejects unknown customers', () => {
    const store = createOrderStore()

    const result = store.createOrder({
      customerId: 999,
      items: [{ menuItemId: 1, quantity: 1 }]
    })

    expect(result).toEqual({
      ok: false,
      reason: 'Customer 999 not found.'
    })
  })
})
