import { describe, expect, it } from 'vitest'
import type { MenuItem } from '@odyssey/api-client'
import {
  buildCategoryGroups,
  formatActionLabel,
  formatCurrency,
  getAllowedActions,
  getStatusTone
} from '../app/lib/dashboard-helpers'

describe('dashboard helpers', () => {
  it('returns allowed actions for pending orders', () => {
    expect(getAllowedActions('pending')).toEqual(['accept', 'cancel'])
  })

  it('returns no actions for completed orders', () => {
    expect(getAllowedActions('completed')).toEqual([])
  })

  it('formats action labels', () => {
    expect(formatActionLabel('prepare')).toBe('Start preparing')
  })

  it('maps status tones', () => {
    expect(getStatusTone('cancelled')).toBe('error')
    expect(getStatusTone('ready')).toBe('success')
  })

  it('formats currency values', () => {
    expect(formatCurrency(12.5)).toBe('$12.50')
  })

  it('groups menu items by category', () => {
    const menuItems: MenuItem[] = [
      { id: 1, name: 'Pasta', price: 20, available: true, category: 'Mains' },
      { id: 2, name: 'Salad', price: 10, available: true, category: 'Starters' },
      { id: 3, name: 'Pizza', price: 18, available: true, category: 'Mains' }
    ]

    const groups = buildCategoryGroups(menuItems)

    expect(groups).toHaveLength(2)
    expect(groups[0][0]).toBe('Mains')
    expect(groups[0][1]).toHaveLength(2)
  })
})
