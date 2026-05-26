import type { MenuItem, OrderStatus } from '@odyssey/api-client'

export type OrderAction = 'accept' | 'prepare' | 'ready' | 'complete' | 'cancel'

const transitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['completed'],
  completed: [],
  cancelled: []
}

const actionTargets: Record<OrderAction, OrderStatus> = {
  accept: 'accepted',
  prepare: 'preparing',
  ready: 'ready',
  complete: 'completed',
  cancel: 'cancelled'
}

export function getAllowedActions(status: OrderStatus): OrderAction[] {
  return (Object.entries(actionTargets) as Array<[OrderAction, OrderStatus]>)
    .filter(([, targetStatus]) => transitions[status].includes(targetStatus))
    .map(([action]) => action)
}

export function formatActionLabel(action: OrderAction) {
  switch (action) {
    case 'accept':
      return 'Accept'
    case 'prepare':
      return 'Start preparing'
    case 'ready':
      return 'Mark ready'
    case 'complete':
      return 'Complete'
    case 'cancel':
      return 'Cancel'
    default:
      return action
  }
}

export function buildCategoryGroups(menuItems: MenuItem[]) {
  const grouped = menuItems.reduce<Record<string, MenuItem[]>>((accumulator, menuItem) => {
    accumulator[menuItem.category] = accumulator[menuItem.category] ?? []
    accumulator[menuItem.category].push(menuItem)
    return accumulator
  }, {})

  return Object.entries(grouped).sort(([leftCategory], [rightCategory]) => leftCategory.localeCompare(rightCategory))
}

export function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

export function getStatusTone(status: OrderStatus) {
  if (status === 'completed' || status === 'ready') {
    return 'success'
  }

  if (status === 'accepted' || status === 'preparing') {
    return 'warning'
  }

  if (status === 'cancelled') {
    return 'error'
  }

  return 'info'
}
