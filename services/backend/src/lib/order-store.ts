import { calculateOrderTotal, validateTransition, type OrderStatus } from './order-rules'

export type { OrderStatus }

export type OrderItem = {
  name: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export type Order = {
  id: number
  customerName: string
  status: OrderStatus
  total: number
  createdAt: string
  items: OrderItem[]
}

export type Customer = {
  id: number
  name: string
  email: string
  phone: string
  ordersCount: number
  totalSpend: number
  lastOrderDate: string
}

export type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  available: boolean
  category: string
}

export type Settings = {
  prepTimeMinutes: number
  autoAccept: boolean
  serviceAvailable: boolean
  openingHours: string
}

export type Summary = {
  ordersToday: number
  revenueToday: number
  pendingOrders: number
  popularItems: Array<{ name: string; count: number }>
  recentOrders: Order[]
}

export type MenuCategory = {
  id: number
  name: string
  description: string
  sortOrder: number
  itemCount: number
}

export type OrderFilters = {
  status?: OrderStatus
  customerId?: number
  search?: string
  from?: string
  to?: string
}

const initialOrders: Order[] = [
  {
    id: 101,
    customerName: 'Ava Martinez',
    status: 'pending',
    total: 32.5,
    createdAt: '2026-05-23T18:12:00.000Z',
    items: [
      { name: 'Truffle Pasta', quantity: 1, unitPrice: 24.5, subtotal: 24.5 },
      { name: 'Sparkling Lemonade', quantity: 1, unitPrice: 8, subtotal: 8 }
    ]
  },
  {
    id: 102,
    customerName: 'Noah Lee',
    status: 'ready',
    total: 42,
    createdAt: '2026-05-23T17:05:00.000Z',
    items: [
      { name: 'Wood-fired Pizza', quantity: 1, unitPrice: 28, subtotal: 28 },
      { name: 'Garden Salad', quantity: 1, unitPrice: 14, subtotal: 14 }
    ]
  },
  {
    id: 103,
    customerName: 'Sofia Chen',
    status: 'accepted',
    total: 18,
    createdAt: '2026-05-23T16:50:00.000Z',
    items: [{ name: 'Crispy Calamari', quantity: 1, unitPrice: 18, subtotal: 18 }]
  }
]

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: 'Ava Martinez',
    email: 'ava@example.com',
    phone: '555-1011',
    ordersCount: 2,
    totalSpend: 74.5,
    lastOrderDate: '2026-05-23T18:12:00.000Z'
  },
  {
    id: 2,
    name: 'Noah Lee',
    email: 'noah@example.com',
    phone: '555-2022',
    ordersCount: 1,
    totalSpend: 42,
    lastOrderDate: '2026-05-23T17:05:00.000Z'
  },
  {
    id: 3,
    name: 'Sofia Chen',
    email: 'sofia@example.com',
    phone: '555-3033',
    ordersCount: 1,
    totalSpend: 18,
    lastOrderDate: '2026-05-23T16:50:00.000Z'
  }
]

const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Truffle Pasta', description: 'House-made pasta with black truffle cream.', price: 24.5, available: true, category: 'Mains' },
  { id: 2, name: 'Wood-fired Pizza', description: 'Tomato, mozzarella, basil, and chili oil.', price: 28, available: true, category: 'Mains' },
  { id: 3, name: 'Garden Salad', description: 'Mixed greens, cucumber, cherry tomatoes, and herb vinaigrette.', price: 14, available: true, category: 'Starters' },
  { id: 4, name: 'Crispy Calamari', description: 'Lemon aioli and chili flakes.', price: 18, available: true, category: 'Starters' },
  { id: 5, name: 'Sparkling Lemonade', description: 'House sparkling lemonade.', price: 8, available: true, category: 'Drinks' }
]

const initialSettings: Settings = {
  prepTimeMinutes: 15,
  autoAccept: false,
  serviceAvailable: true,
  openingHours: '{"mon":"09:00-22:00","tue":"09:00-22:00"}'
}

function cloneOrders(orders: Order[]) {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({ ...item }))
  }))
}

function cloneMenuItems(menuItems: MenuItem[]) {
  return menuItems.map((menuItem) => ({ ...menuItem }))
}

function cloneSettings(settings: Settings) {
  return { ...settings }
}

export function createOrderStore() {
  const orders = cloneOrders(initialOrders)
  const menuItems = cloneMenuItems(initialMenuItems)
  const customers = initialCustomers.map((customer) => ({ ...customer }))
  let settings = cloneSettings(initialSettings)

  const getCustomers = () => customers.map((customer) => ({ ...customer }))

  const getMenuItems = () => cloneMenuItems(menuItems)

  const getSettings = () => cloneSettings(settings)

  const getSummary = (): Summary => {
    const counts = orders.flatMap((order) => order.items).reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.name] = (accumulator[item.name] ?? 0) + 1
      return accumulator
    }, {})

    const popularItems = Object.entries(counts)
      .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    const today = new Date().toISOString().slice(0, 10)
    const todaysOrders = orders.filter((order) => order.createdAt.slice(0, 10) === today)

    return {
      ordersToday: todaysOrders.length,
      revenueToday: todaysOrders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: orders.filter((order) => order.status === 'pending').length,
      popularItems,
      recentOrders: cloneOrders(orders).slice(0, 10)
    }
  }

  const categories: MenuCategory[] = [
    { id: 1, name: 'Mains', description: 'Signature mains', sortOrder: 1, itemCount: 2 },
    { id: 2, name: 'Starters', description: 'Shareable starters', sortOrder: 2, itemCount: 2 },
    { id: 3, name: 'Drinks', description: 'Beverages', sortOrder: 3, itemCount: 1 }
  ]

  const getCategories = () => categories.map((category) => ({
    ...category,
    itemCount: menuItems.filter((item) => item.category === category.name).length
  }))

  const createCategory = (input: { name: string; description: string; sortOrder: number }) => {
    const nextId = categories.reduce((max, category) => Math.max(max, category.id), 0) + 1
    const category: MenuCategory = {
      id: nextId,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
      itemCount: 0
    }

    categories.push(category)
    return { ok: true as const, category: getCategories().find((entry) => entry.id === nextId)! }
  }

  const updateCategory = (categoryId: number, input: Partial<{ name: string; description: string; sortOrder: number }>) => {
    const existing = categories.find((category) => category.id === categoryId)

    if (!existing) {
      return { ok: false as const, reason: `Category ${categoryId} not found.` }
    }

    const previousName = existing.name

    if (input.name !== undefined) {
      existing.name = input.name
    }

    if (input.description !== undefined) {
      existing.description = input.description
    }

    if (input.sortOrder !== undefined) {
      existing.sortOrder = input.sortOrder
    }

    if (input.name && input.name !== previousName) {
      menuItems.forEach((item) => {
        if (item.category === previousName) {
          item.category = input.name!
        }
      })
    }

    return { ok: true as const, category: getCategories().find((category) => category.id === categoryId)! }
  }

  const getCustomerOrders = (customerId: number) => {
    const customer = customers.find((entry) => entry.id === customerId)

    if (!customer) {
      return { ok: false as const, reason: `Customer ${customerId} not found.` }
    }

    return {
      ok: true as const,
      orders: cloneOrders(orders).filter((order) => order.customerName === customer.name)
    }
  }

  const filterOrders = (filters: OrderFilters = {}) => {
    return cloneOrders(orders).filter((order) => {
      if (filters.status && order.status !== filters.status) {
        return false
      }

      if (filters.customerId) {
        const customer = customers.find((entry) => entry.id === filters.customerId)

        if (!customer || order.customerName !== customer.name) {
          return false
        }
      }

      if (filters.search && !order.customerName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }

      if (filters.from && order.createdAt < filters.from) {
        return false
      }

      if (filters.to && order.createdAt > filters.to) {
        return false
      }

      return true
    })
  }

  const updateOrderStatus = (orderId: number, toStatus: OrderStatus) => {
    const existingOrder = orders.find((order) => order.id === orderId)

    if (!existingOrder) {
      return { ok: false as const, reason: `Order ${orderId} not found.` }
    }

    const transition = validateTransition(existingOrder.status, toStatus)

    if (!transition.ok) {
      return { ok: false as const, reason: transition.reason }
    }

    existingOrder.status = toStatus

    return {
      ok: true as const,
      order: {
        ...existingOrder,
        items: existingOrder.items.map((item) => ({ ...item }))
      }
    }
  }

  const createMenuItem = (input: { name: string; description: string; price: number; available: boolean; category: string }) => {
    const nextId = menuItems.reduce((currentMax, menuItem) => Math.max(currentMax, menuItem.id), 0) + 1

    const newMenuItem: MenuItem = {
      id: nextId,
      name: input.name,
      description: input.description,
      price: Number(input.price.toFixed(2)),
      available: input.available,
      category: input.category
    }

    menuItems.push(newMenuItem)

    return newMenuItem
  }

  const updateMenuItem = (menuItemId: number, input: Partial<{ name: string; description: string; price: number; available: boolean; category: string }>) => {
    const existingMenuItem = menuItems.find((menuItem) => menuItem.id === menuItemId)

    if (!existingMenuItem) {
      return null
    }

    if (input.name !== undefined) {
      existingMenuItem.name = input.name
    }

    if (input.description !== undefined) {
      existingMenuItem.description = input.description
    }

    if (input.price !== undefined) {
      existingMenuItem.price = Number(input.price.toFixed(2))
    }

    if (input.available !== undefined) {
      existingMenuItem.available = input.available
    }

    if (input.category !== undefined) {
      existingMenuItem.category = input.category
    }

    return { ...existingMenuItem }
  }

  const updateSettings = (nextSettings: Partial<Settings>) => {
    settings = {
      ...settings,
      ...nextSettings
    }

    return cloneSettings(settings)
  }

  const createOrder = (input: { customerId: number; items: Array<{ menuItemId: number; quantity: number }> }) => {
    const customer = customers.find((entry) => entry.id === input.customerId)

    if (!customer) {
      return { ok: false as const, reason: `Customer ${input.customerId} not found.` }
    }

    if (input.items.length === 0) {
      return { ok: false as const, reason: 'At least one item is required.' }
    }

    const selectedItems = input.items.map((item) => {
      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than zero.')
      }

      const menuItem = menuItems.find((entry) => entry.id === item.menuItemId)

      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found.`)
      }

      if (!menuItem.available) {
        throw new Error(`Menu item ${menuItem.name} is unavailable.`)
      }

      return {
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        subtotal: Number((item.quantity * menuItem.price).toFixed(2))
      }
    })

    const total = Number(calculateOrderTotal(selectedItems.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice }))).toFixed(2))

    const nextOrder: Order = {
      id: orders.reduce((currentMax, order) => Math.max(currentMax, order.id), 0) + 1,
      customerName: customer.name,
      status: 'pending',
      total,
      createdAt: new Date().toISOString(),
      items: selectedItems
    }

    orders.push(nextOrder)

    return { ok: true as const, order: cloneOrders([nextOrder])[0] }
  }

  return {
    getOrders: () => filterOrders(),
    getOrdersFiltered: filterOrders,
    getCustomers,
    getMenuItems,
    getCategories,
    getSettings,
    getSummary,
    getCustomerOrders,
    updateOrderStatus,
    createMenuItem,
    updateMenuItem,
    createCategory,
    updateCategory,
    updateSettings,
    createOrder
  }
}
