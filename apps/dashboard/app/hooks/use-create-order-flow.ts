import { useMemo, useState } from 'react'
import type { MenuItem } from '@odyssey/api-client'

export type DraftOrderItem = {
  menuItemId: string
  quantity: string
}

export type DraftOrder = {
  customerId: string
  items: DraftOrderItem[]
}

export function useCreateOrderFlow(menuItems: MenuItem[]) {
  const [draft, setDraft] = useState<DraftOrder>({
    customerId: '',
    items: [{ menuItemId: '', quantity: '1' }]
  })

  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error' | 'warning'; title: string; body?: string } | null>(null)

  const orderTotal = useMemo(() => {
    return draft.items.reduce((sum, item) => {
      const menu = menuItems.find((m) => String(m.id) === item.menuItemId)
      const quantity = Number(item.quantity)
      if (!menu || !Number.isFinite(quantity) || quantity <= 0) {
        return sum
      }
      return sum + menu.price * quantity
    }, 0)
  }, [draft.items, menuItems])

  const validateDraft = (): { items: { menuItemId: number; quantity: number }[]; customerId: number } | null => {
    if (!draft.customerId) {
      setFeedback({ tone: 'warning', title: 'Choose a customer', body: 'Select a customer before creating the order.' })
      return null
    }

    const items = draft.items
      .map((item) => ({ menuItemId: Number(item.menuItemId), quantity: Number(item.quantity) }))
      .filter((item) => item.menuItemId && Number.isFinite(item.quantity) && item.quantity > 0)

    if (!items.length) {
      setFeedback({ tone: 'warning', title: 'Add at least one item', body: 'Select an item and enter a valid quantity.' })
      return null
    }

    return { items, customerId: Number(draft.customerId) }
  }

  const resetDraft = () => {
    setDraft({ customerId: '', items: [{ menuItemId: '', quantity: '1' }] })
    setFeedback(null)
  }

  return {
    draft,
    setDraft,
    feedback,
    setFeedback,
    orderTotal,
    validateDraft,
    resetDraft
  }
}
