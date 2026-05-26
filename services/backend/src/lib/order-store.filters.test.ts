import { describe, expect, it } from 'vitest'
import { createOrderStore } from './order-store'

describe('order filters', () => {
  it('filters orders by status', () => {
    const store = createOrderStore()

    const pending = store.getOrdersFiltered({ status: 'pending' })

    expect(pending.every((order) => order.status === 'pending')).toBe(true)
    expect(pending.length).toBeGreaterThan(0)
  })

  it('filters orders by customer name search', () => {
    const store = createOrderStore()

    const results = store.getOrdersFiltered({ search: 'ava' })

    expect(results.every((order) => order.customerName.toLowerCase().includes('ava'))).toBe(true)
  })
})
