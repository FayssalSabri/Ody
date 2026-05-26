import { sql } from './db'
import { ensureDatabaseSchema } from '../db/bootstrap'
import { calculateOrderTotal, resolveAction, validateTransition, type OrderAction, type OrderStatus } from './order-rules'
import {
  createOrderStore,
  type Customer,
  type MenuCategory,
  type MenuItem,
  type Order,
  type OrderFilters,
  type Settings,
  type Summary
} from './order-store'
import { db } from './drizzle.js'
import { menuCategories, menuItems } from '../db/schema.js'
import { asc, count, eq } from 'drizzle-orm'
import { SETTING_KEYS, type SettingKey } from '@odyssey/types'

const fallbackStore = createOrderStore()

type DbOrderRow = {
  id: number
  customer_name: string
  status: OrderStatus
  total: string | number
  created_at: string | Date
  items: Array<{
    name: string
    quantity: number
    unit_price: string | number
    subtotal: string | number
  }> 
}

type DbCustomerRow = {
  id: number
  name: string
  email: string
  phone: string | null
  orders_count: number
  total_spend: string | number
  last_order_date: string | Date | null
}

type DbMenuItemRow = {
  id: number
  name: string
  description: string | null
  price: string | number
  available: boolean
  category: string
}

type DbSettingsRow = {
  prep_time_minutes: number
  auto_accept: boolean
  service_available: boolean
  opening_hours: string
}

type DbSummaryRow = {
  orders_today: number
  revenue_today: string | number
  pending_orders: number
}

type DbPopularItemRow = {
  name: string
  count: number
}

type CreateMenuItemInput = {
  name: string
  description: string
  price: number
  available: boolean
  category: string
}

type UpdateMenuItemInput = Partial<Omit<CreateMenuItemInput, 'category'>> & {
  category?: string
}

type UpdateSettingsInput = Partial<Settings>

type CreateOrderInput = {
  customerId: number
  items: Array<{ menuItemId: number; quantity: number }>
}

function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0
  }

  return Number(value)
}

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return new Date(0).toISOString()
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

async function withDatabaseSchema<T>(callback: () => Promise<T>) {
  await ensureDatabaseSchema()
  return callback()
}

function buildOrders(rows: DbOrderRow[]): Order[] {
  return rows.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    status: row.status,
    total: toNumber(row.total),
    createdAt: toIsoString(row.created_at),
    items: row.items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unitPrice: toNumber(item.unit_price),
      subtotal: toNumber(item.subtotal)
    }))
  }))
}

function buildCustomers(rows: DbCustomerRow[]): Customer[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    ordersCount: Number(row.orders_count),
    totalSpend: toNumber(row.total_spend),
    lastOrderDate: row.last_order_date ? toIsoString(row.last_order_date) : new Date(0).toISOString()
  }))
}

function buildMenuItems(rows: DbMenuItemRow[]): MenuItem[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: toNumber(row.price),
    available: row.available,
    category: row.category
  }))
}

function buildSettings(row: DbSettingsRow): Settings {
  return {
    prepTimeMinutes: Number(row.prep_time_minutes),
    autoAccept: Boolean(row.auto_accept),
    serviceAvailable: Boolean(row.service_available),
    openingHours: row.opening_hours
  }
}

function buildSummary(summaryRow: DbSummaryRow, popularRows: DbPopularItemRow[], recentOrders: Order[]): Summary {
  return {
    ordersToday: Number(summaryRow.orders_today),
    revenueToday: toNumber(summaryRow.revenue_today),
    pendingOrders: Number(summaryRow.pending_orders),
    popularItems: popularRows.map((row) => ({
      name: row.name,
      count: Number(row.count)
    })),
    recentOrders
  }
}

type DbCategoryRow = {
  id: number
  name: string
  description: string | null
  sort_order: number
  item_count: number
}

function buildCategories(rows: DbCategoryRow[]): MenuCategory[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    sortOrder: Number(row.sort_order),
    itemCount: Number(row.item_count)
  }))
}

export async function getOrdersFromDb(filters: OrderFilters = {}): Promise<Order[]> {
  return withDatabaseSchema(async () => {
    const status = filters.status ?? null
    const customerId = filters.customerId ?? null
    const search = filters.search?.trim() ? `%${filters.search.trim()}%` : null
    const from = filters.from ?? null
    const to = filters.to ?? null

    const rows = await sql<DbOrderRow[]>`
      SELECT
        o.id,
        c.name AS customer_name,
        o.status,
        o.total,
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'name', mi.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE
        (${status}::text IS NULL OR o.status = ${status}::order_status)
        AND (${customerId}::int IS NULL OR o.customer_id = ${customerId})
        AND (${search}::text IS NULL OR c.name ILIKE ${search})
        AND (${from}::timestamptz IS NULL OR o.created_at >= ${from}::timestamptz)
        AND (${to}::timestamptz IS NULL OR o.created_at <= ${to}::timestamptz)
      GROUP BY o.id, c.name, o.status, o.total, o.created_at
      ORDER BY o.created_at DESC
    `

    return buildOrders(rows)
  })
}

export async function getCustomersFromDb(): Promise<Customer[]> {
  return withDatabaseSchema(async () => {
    const rows = await sql<DbCustomerRow[]>`
      SELECT
        c.id,
        c.name,
        c.email,
        c.phone,
        COUNT(o.id)::int AS orders_count,
        COALESCE(SUM(o.total), 0)::float AS total_spend,
        MAX(o.created_at) AS last_order_date
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id, c.name, c.email, c.phone
      ORDER BY c.name ASC
    `

    return buildCustomers(rows)
  })
}

export async function getMenuItemsFromDb(): Promise<MenuItem[]> {
  return withDatabaseSchema(async () => {
    const rows = await sql<DbMenuItemRow[]>`
      SELECT
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.available,
        mc.name AS category
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      ORDER BY mc.sort_order ASC, mi.name ASC
    `

    return buildMenuItems(rows)
  })
}

export async function getSettingsFromDb(): Promise<Settings> {
  return withDatabaseSchema(async () => {
    const rows = await sql<DbSettingsRow[]>`
      SELECT
        COALESCE(MAX(CASE WHEN key = 'prep_time_minutes' THEN value::int END), 15) AS prep_time_minutes,
        COALESCE(MAX(CASE WHEN key = 'auto_accept' THEN value END), 'false')::boolean AS auto_accept,
        COALESCE(MAX(CASE WHEN key = 'service_available' THEN value END), 'true')::boolean AS service_available,
        COALESCE(MAX(CASE WHEN key = 'opening_hours' THEN value END), '{"mon":"09:00-22:00"}') AS opening_hours
      FROM settings
    `

    return buildSettings(rows[0] ?? {
      prep_time_minutes: 15,
      auto_accept: false,
      service_available: true,
      opening_hours: '{"mon":"09:00-22:00"}'
    })
  })
}

export async function getSummaryFromDb(): Promise<Summary> {
  return withDatabaseSchema(async () => {
    const [summaryRow] = await sql<DbSummaryRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS orders_today,
        COALESCE(SUM(total) FILTER (WHERE created_at::date = CURRENT_DATE), 0)::float AS revenue_today,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0)::int AS pending_orders
      FROM orders
    `

    const popularRows = await sql<DbPopularItemRow[]>`
      SELECT
        mi.name,
        COUNT(*)::int AS count
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE o.created_at::date = CURRENT_DATE
      GROUP BY mi.name
      ORDER BY count DESC
      LIMIT 5
    `

    const recentOrders = await getOrdersFromDb()

    return buildSummary(
      summaryRow ?? { orders_today: 0, revenue_today: 0, pending_orders: 0 },
      popularRows,
      recentOrders.slice(0, 10)
    )
  })
}

export async function getCategoriesFromDb(): Promise<MenuCategory[]> {
  return withDatabaseSchema(async () => {
    const rows = await db
      .select({
        id: menuCategories.id,
        name: menuCategories.name,
        description: menuCategories.description,
        sort_order: menuCategories.sortOrder,
        item_count: count(menuItems.id)
      })
      .from(menuCategories)
      .leftJoin(menuItems, eq(menuItems.categoryId, menuCategories.id))
      .groupBy(menuCategories.id, menuCategories.name, menuCategories.description, menuCategories.sortOrder)
      .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.name))

    return buildCategories(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        sort_order: row.sort_order,
        item_count: Number(row.item_count)
      }))
    )
  })
}

export async function createCategoryInDb(input: { name: string; description: string; sortOrder: number }) {
  return withDatabaseSchema(async () => {
    const [created] = await sql<{ id: number }[]>`
      INSERT INTO menu_categories (name, description, sort_order)
      VALUES (${input.name}, ${input.description ?? null}, ${input.sortOrder})
      RETURNING id
    `

    if (!created) {
      return { ok: false as const, reason: 'Unable to create category.' }
    }

    const category = (await getCategoriesFromDb()).find((entry) => entry.id === created.id)

    if (!category) {
      return { ok: false as const, reason: 'Unable to load created category.' }
    }

    return { ok: true as const, category }
  })
}

export async function updateCategoryInDb(
  categoryId: number,
  input: Partial<{ name: string; description: string; sortOrder: number }>
) {
  return withDatabaseSchema(async () => {
    const [currentCategory] = await sql<{ name: string; description: string | null; sort_order: number }[]>`
      SELECT name, description, sort_order
      FROM menu_categories
      WHERE id = ${categoryId}
    `

    if (!currentCategory) {
      return { ok: false as const, reason: `Category ${categoryId} not found.` }
    }

    await sql`
      UPDATE menu_categories
      SET
        name = ${input.name ?? currentCategory.name},
        description = ${input.description ?? currentCategory.description},
        sort_order = ${input.sortOrder ?? currentCategory.sort_order}
      WHERE id = ${categoryId}
    `

    const category = (await getCategoriesFromDb()).find((entry) => entry.id === categoryId)

    if (!category) {
      return { ok: false as const, reason: 'Unable to load updated category.' }
    }

    return { ok: true as const, category }
  })
}

export async function getCustomerOrdersFromDb(customerId: number) {
  return withDatabaseSchema(async () => {
    const customer = await sql<{ id: number }[]>`
      SELECT id
      FROM customers
      WHERE id = ${customerId}
    `

    if (customer.length === 0) {
      return { ok: false as const, reason: `Customer ${customerId} not found.` }
    }

    return {
      ok: true as const,
      orders: await getOrdersFromDb({ customerId })
    }
  })
}

async function getCategoryIdByName(categoryName: string) {
  const rows = await sql<{ id: number }[]>`
    SELECT id
    FROM menu_categories
    WHERE name = ${categoryName}
  `

  return rows[0]?.id
}

export async function createMenuItemInDb(input: CreateMenuItemInput) {
  return withDatabaseSchema(async () => {
    const categoryId = await getCategoryIdByName(input.category)

    if (!categoryId) {
      return { ok: false as const, reason: `Category ${input.category} not found.` }
    }

    const [menuItem] = await sql<{ id: number }[]>`
      INSERT INTO menu_items (category_id, name, description, price, available, image_url)
      VALUES (${categoryId}, ${input.name}, ${input.description ?? null}, ${input.price.toFixed(2)}, ${input.available}, NULL)
      RETURNING id
    `

    if (!menuItem) {
      return { ok: false as const, reason: 'Unable to create menu item.' }
    }

    const created = (await getMenuItemsFromDb()).find((item) => item.id === menuItem.id)

    if (!created) {
      return { ok: false as const, reason: 'Unable to load created menu item.' }
    }

    return { ok: true as const, item: created }
  })
}

export async function updateMenuItemInDb(menuItemId: number, input: UpdateMenuItemInput) {
  return withDatabaseSchema(async () => {
    const currentItem = await sql<{ id: number; category_id: number; name: string; description: string | null; price: string | number; available: boolean }[]>`
      SELECT id, category_id, name, description, price, available
      FROM menu_items
      WHERE id = ${menuItemId}
    `

    if (currentItem.length === 0) {
      return { ok: false as const, reason: `Menu item ${menuItemId} not found.` }
    }

    const current = currentItem[0]
    const nextCategoryId = input.category ? await getCategoryIdByName(input.category) : current.category_id

    if (input.category && !nextCategoryId) {
      return { ok: false as const, reason: `Category ${input.category} not found.` }
    }

    await sql`
      UPDATE menu_items
      SET
        category_id = ${nextCategoryId},
        name = ${input.name ?? current.name},
        description = ${input.description ?? current.description},
        price = ${Number(input.price ?? Number(current.price)).toFixed(2)},
        available = ${input.available ?? current.available}
      WHERE id = ${menuItemId}
    `

    const updated = (await getMenuItemsFromDb()).find((item) => item.id === menuItemId)

    if (!updated) {
      return { ok: false as const, reason: 'Unable to load updated menu item.' }
    }

    return { ok: true as const, item: updated }
  })
}

function persistSetting(key: SettingKey, value: string) {
  return sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `
}

export async function updateSettingsInDb(input: UpdateSettingsInput) {
  return withDatabaseSchema(async () => {
    if (input.prepTimeMinutes !== undefined) {
      await persistSetting('prep_time_minutes', String(input.prepTimeMinutes))
    }

    if (input.autoAccept !== undefined) {
      await persistSetting('auto_accept', String(input.autoAccept))
    }

    if (input.serviceAvailable !== undefined) {
      await persistSetting('service_available', String(input.serviceAvailable))
    }

    if (input.openingHours !== undefined) {
      await persistSetting('opening_hours', input.openingHours)
    }

    return { ok: true as const, settings: await getSettingsFromDb() }
  })
}

export async function createOrderInDb(input: CreateOrderInput) {
  return withDatabaseSchema(async () => {
    const customer = await sql<{ id: number }[]>`
      SELECT id
      FROM customers
      WHERE id = ${input.customerId}
    `

    if (customer.length === 0) {
      return { ok: false as const, reason: `Customer ${input.customerId} not found.` }
    }

    if (input.items.length === 0) {
      return { ok: false as const, reason: 'At least one item is required.' }
    }

    const selectedMenuItemIds = input.items.map((item) => item.menuItemId)
    const menuItems = await sql<{ id: number; price: string | number; available: boolean; name: string }[]>`
      SELECT id, price, available, name
      FROM menu_items
      WHERE id = ANY(${selectedMenuItemIds})
    `

    if (menuItems.length !== new Set(selectedMenuItemIds).size) {
      return { ok: false as const, reason: 'One or more menu items were not found.' }
    }

    const menuItemMap = new Map(menuItems.map((item) => [item.id, item]))
    const orderItems = input.items.map((item) => {
      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than zero.')
      }

      const menuItem = menuItemMap.get(item.menuItemId)

      if (!menuItem) {
        throw new Error(`Menu item ${item.menuItemId} not found.`)
      }

      if (!menuItem.available) {
        throw new Error(`Menu item ${menuItem.name} is unavailable.`)
      }

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: Number(menuItem.price),
        subtotal: Number((item.quantity * Number(menuItem.price)).toFixed(2))
      }
    })

    const total = Number(calculateOrderTotal(orderItems.map((item) => ({ quantity: item.quantity, unitPrice: item.unitPrice }))).toFixed(2))

    const [createdOrder] = await sql<{ id: number }[]>`
      INSERT INTO orders (customer_id, status, total, notes, created_at, updated_at)
      VALUES (${input.customerId}, 'pending', ${total.toFixed(2)}, NULL, NOW(), NOW())
      RETURNING id
    `

    if (!createdOrder) {
      return { ok: false as const, reason: 'Unable to create order.' }
    }

    for (const item of orderItems) {
      await sql`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
        VALUES (${createdOrder.id}, ${item.menuItemId}, ${item.quantity}, ${item.unitPrice.toFixed(2)}, ${item.subtotal.toFixed(2)})
      `
    }

    const created = (await getOrdersFromDb()).find((order) => order.id === createdOrder.id)

    if (!created) {
      return { ok: false as const, reason: 'Unable to load created order.' }
    }

    return { ok: true as const, order: created }
  })
}

export async function getOrders(filters: OrderFilters = {}) {
  try {
    return await getOrdersFromDb(filters)
  } catch (error) {
    console.warn('[orders] Falling back to in-memory store.', error)
    return fallbackStore.getOrdersFiltered(filters)
  }
}

export async function getCategories() {
  try {
    return await getCategoriesFromDb()
  } catch (error) {
    console.warn('[categories] Falling back to in-memory store.', error)
    return fallbackStore.getCategories()
  }
}

export async function createCategory(input: { name: string; description: string; sortOrder: number }) {
  try {
    return await createCategoryInDb(input)
  } catch (error) {
    console.warn('[categories:create] Falling back to in-memory store.', error)
    return fallbackStore.createCategory(input)
  }
}

export async function updateCategory(
  categoryId: number,
  input: Partial<{ name: string; description: string; sortOrder: number }>
) {
  try {
    return await updateCategoryInDb(categoryId, input)
  } catch (error) {
    console.warn('[categories:update] Falling back to in-memory store.', error)
    return fallbackStore.updateCategory(categoryId, input)
  }
}

export async function getCustomerOrders(customerId: number) {
  try {
    return await getCustomerOrdersFromDb(customerId)
  } catch (error) {
    console.warn('[customers/orders] Falling back to in-memory store.', error)
    return fallbackStore.getCustomerOrders(customerId)
  }
}

export async function applyOrderAction(orderId: number, action: OrderAction) {
  const toStatus = resolveAction(action)
  return updateOrderStatus(orderId, toStatus)
}

export async function getCustomers() {
  try {
    return await getCustomersFromDb()
  } catch (error) {
    console.warn('[customers] Falling back to in-memory store.', error)
    return fallbackStore.getCustomers()
  }
}

export async function getMenuItems() {
  try {
    return await getMenuItemsFromDb()
  } catch (error) {
    console.warn('[menu-items] Falling back to in-memory store.', error)
    return fallbackStore.getMenuItems()
  }
}

export async function getSettings() {
  try {
    return await getSettingsFromDb()
  } catch (error) {
    console.warn('[settings] Falling back to in-memory store.', error)
    return fallbackStore.getSettings()
  }
}

export async function getSummary() {
  try {
    return await getSummaryFromDb()
  } catch (error) {
    console.warn('[summary] Falling back to in-memory store.', error)
    return fallbackStore.getSummary()
  }
}

export async function updateOrderStatus(orderId: number, toStatus: OrderStatus) {
  try {
    return await updateOrderStatusInDb(orderId, toStatus)
  } catch (error) {
    console.warn('[orders/status] Falling back to in-memory store.', error)
    return fallbackStore.updateOrderStatus(orderId, toStatus)
  }
}

export async function createMenuItem(input: CreateMenuItemInput) {
  try {
    return await createMenuItemInDb(input)
  } catch (error) {
    console.warn('[menu-items:create] Falling back to in-memory store.', error)
    const item = fallbackStore.createMenuItem(input)
    return { ok: true as const, item }
  }
}

export async function updateMenuItem(menuItemId: number, input: UpdateMenuItemInput) {
  try {
    return await updateMenuItemInDb(menuItemId, input)
  } catch (error) {
    console.warn('[menu-items:update] Falling back to in-memory store.', error)
    const item = fallbackStore.updateMenuItem(menuItemId, input)

    if (!item) {
      return { ok: false as const, reason: `Menu item ${menuItemId} not found.` }
    }

    return { ok: true as const, item }
  }
}

export async function updateSettings(input: UpdateSettingsInput) {
  try {
    return await updateSettingsInDb(input)
  } catch (error) {
    console.warn('[settings:update] Falling back to in-memory store.', error)
    return { ok: true as const, settings: fallbackStore.updateSettings(input) }
  }
}

export async function createOrder(input: CreateOrderInput) {
  try {
    return await createOrderInDb(input)
  } catch (error) {
    console.warn('[orders:create] Falling back to in-memory store.', error)
    return fallbackStore.createOrder(input)
  }
}

async function updateOrderStatusInDb(orderId: number, toStatus: OrderStatus) {
  return withDatabaseSchema(async () => {
    const currentOrder = await sql<{ status: OrderStatus }[]>`
      SELECT status
      FROM orders
      WHERE id = ${orderId}
    `

    if (currentOrder.length === 0) {
      return { ok: false as const, reason: `Order ${orderId} not found.` }
    }

    const transition = validateTransition(currentOrder[0].status, toStatus)

    if (!transition.ok) {
      return { ok: false as const, reason: transition.reason }
    }

    await sql`
      UPDATE orders
      SET status = ${toStatus}, updated_at = NOW()
      WHERE id = ${orderId}
    `

    const updatedOrders = await getOrdersFromDb()
    const updatedOrder = updatedOrders.find((order) => order.id === orderId)

    if (!updatedOrder) {
      return { ok: false as const, reason: `Order ${orderId} not found.` }
    }

    return { ok: true as const, order: updatedOrder }
  })
}
