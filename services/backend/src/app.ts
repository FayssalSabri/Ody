import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { zValidator } from '@hono/zod-validator'
import type { OrderAction } from './lib/order-rules'
import type { OrderStatus } from './lib/order-rules'
import {
  applyOrderAction,
  createCategory,
  createMenuItem,
  createOrder,
  getCategories,
  getCustomerOrders,
  getCustomers,
  getMenuItems,
  getOrders,
  getSettings,
  getSummary,
  updateCategory,
  updateMenuItem,
  updateSettings
} from './lib/order-db'
import {
  createCategoryBodySchema,
  createMenuItemBodySchema,
  createOrderBodySchema,
  orderListQuerySchema,
  updateCategoryBodySchema,
  updateMenuItemBodySchema,
  updateSettingsBodySchema
} from './api-schemas'
import openApiDocument from './openapi-spec.js'

const orderActions: OrderAction[] = ['accept', 'prepare', 'ready', 'complete', 'cancel']

const devOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/

export function createApp() {
  const app = new Hono()

  app.use('*', logger())
  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) {
          return '*'
        }

        if (devOriginPattern.test(origin)) {
          return origin
        }

        return null
      },
      allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowHeaders: ['Content-Type']
    })
  )

  app.get('/health', (c) => c.json({ status: 'ok', service: 'odyssey-backend' }))

  app.get('/orders', zValidator('query', orderListQuerySchema), async (c) => {
    const query = c.req.valid('query')

    return c.json(
      await getOrders({
        ...(query.status ? { status: query.status as OrderStatus } : {}),
        ...(query.customerId ? { customerId: query.customerId } : {}),
        ...(query.search ? { search: query.search } : {}),
        ...(query.from ? { from: query.from } : {}),
        ...(query.to ? { to: query.to } : {})
      })
    )
  })

  app.get('/customers/:id/orders', async (c) => {
    const customerId = Number(c.req.param('id'))
    const result = await getCustomerOrders(customerId)

    if (!result.ok) {
      return c.json({ error: result.reason }, 404)
    }

    return c.json(result.orders)
  })

  app.post('/orders', zValidator('json', createOrderBodySchema), async (c) => {
    const body = c.req.valid('json')
    const result = await createOrder(body)

    if (!result.ok) {
      return c.json({ error: result.reason }, 422)
    }

    return c.json(result.order, 201)
  })

  for (const action of orderActions) {
    app.post(`/orders/:id/${action}`, async (c) => {
      const orderId = Number(c.req.param('id'))
      const result = await applyOrderAction(orderId, action)

      if (!result.ok) {
        return c.json({ error: result.reason }, 422)
      }

      return c.json(result.order)
    })
  }

  app.get('/customers', async (c) => c.json(await getCustomers()))

  app.get('/categories', async (c) => c.json(await getCategories()))

  app.post('/categories', zValidator('json', createCategoryBodySchema), async (c) => {
    const body = c.req.valid('json')
    const result = await createCategory({
      name: body.name.trim(),
      description: (body.description ?? '').trim(),
      sortOrder: body.sortOrder ?? 0
    })

    if (!result.ok) {
      return c.json({ error: result.reason }, 422)
    }

    return c.json(result.category, 201)
  })

  app.patch('/categories/:id', zValidator('json', updateCategoryBodySchema), async (c) => {
    const categoryId = Number(c.req.param('id'))
    const body = c.req.valid('json')

    const result = await updateCategory(categoryId, {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined && body.description !== null
        ? { description: body.description.trim() }
        : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {})
    })

    if (!result.ok) {
      return c.json({ error: result.reason }, 422)
    }

    return c.json(result.category)
  })

  app.get('/menu-items', async (c) => c.json(await getMenuItems()))

  app.post('/menu-items', zValidator('json', createMenuItemBodySchema), async (c) => {
    const body = c.req.valid('json')
    const result = await createMenuItem({
      name: body.name.trim(),
      description: body.description.trim(),
      price: body.price,
      available: body.available,
      category: body.category.trim()
    })

    if (!result.ok) {
      return c.json({ error: result.reason }, 422)
    }

    return c.json(result.item, 201)
  })

  app.patch('/menu-items/:id', zValidator('json', updateMenuItemBodySchema), async (c) => {
    const menuItemId = Number(c.req.param('id'))
    const body = c.req.valid('json')

    const result = await updateMenuItem(menuItemId, {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description.trim() } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.available !== undefined ? { available: body.available } : {}),
      ...(body.category !== undefined ? { category: body.category.trim() } : {})
    })

    if (!result.ok) {
      return c.json({ error: result.reason }, 422)
    }

    return c.json(result.item)
  })

  app.get('/settings', async (c) => c.json(await getSettings()))

  app.patch('/settings', zValidator('json', updateSettingsBodySchema), async (c) => {
    const body = c.req.valid('json')
    const result = await updateSettings(body)

    return c.json(result.settings)
  })

  app.get('/summary', async (c) => c.json(await getSummary()))

  app.get('/doc', (c) => c.json(openApiDocument))

  return app
}
