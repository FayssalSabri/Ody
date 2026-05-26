import { describe, expect, it } from 'vitest'
import { createOrderStore } from './order-store'

describe('order store', () => {
  it('updates an order status when the transition is valid', () => {
    const store = createOrderStore()

    const result = store.updateOrderStatus(101, 'accepted')

    expect(result).toEqual({
      ok: true,
      order: expect.objectContaining({
        id: 101,
        status: 'accepted'
      })
    })
    expect(store.getOrders().find((order) => order.id === 101)?.status).toBe('accepted')
  })

  it('rejects invalid transitions and leaves the order unchanged', () => {
    const store = createOrderStore()

    const result = store.updateOrderStatus(101, 'ready')

    expect(result).toEqual({
      ok: false,
      reason: 'Invalid transition from pending to ready.'
    })
    expect(store.getOrders().find((order) => order.id === 101)?.status).toBe('pending')
  })

  it('returns an error when the order does not exist', () => {
    const store = createOrderStore()

    const result = store.updateOrderStatus(999, 'accepted')

    expect(result).toEqual({
      ok: false,
      reason: 'Order 999 not found.'
    })
  })
})
