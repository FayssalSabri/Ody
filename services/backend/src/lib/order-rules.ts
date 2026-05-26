export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled'

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

export function getAllowedTransitions(from: OrderStatus) {
  return transitions[from]
}

export function getAllowedActions(from: OrderStatus): OrderAction[] {
  return (Object.entries(actionTargets) as Array<[OrderAction, OrderStatus]>)
    .filter(([, targetStatus]) => transitions[from].includes(targetStatus))
    .map(([action]) => action)
}

export function resolveAction(action: OrderAction) {
  return actionTargets[action]
}

export function validateTransition(from: OrderStatus, to: OrderStatus) {
  if (from === to) {
    return { ok: false, reason: 'Order status must change to a different state.' }
  }

  if (transitions[from].includes(to)) {
    return { ok: true }
  }

  return {
    ok: false,
    reason: `Invalid transition from ${from} to ${to}.`
  }
}

export function calculateOrderTotal(items: Array<{ quantity: number; unitPrice: number }>) {
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  return Number(total.toFixed(2))
}
