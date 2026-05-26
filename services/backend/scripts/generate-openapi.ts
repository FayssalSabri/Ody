import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import {
  createCategoryBodySchema,
  createMenuItemBodySchema,
  createOrderBodySchema,
  customerSchema,
  errorSchema,
  healthSchema,
  menuCategorySchema,
  menuItemSchema,
  orderSchema,
  orderStatusSchema,
  settingsSchema,
  summarySchema,
  updateCategoryBodySchema,
  updateMenuItemBodySchema,
  updateSettingsBodySchema
} from '../src/api-schemas.js'

const registry = new OpenAPIRegistry()

registry.register('Error', errorSchema)
registry.register('Order', orderSchema)
registry.register('Customer', customerSchema)
registry.register('MenuCategory', menuCategorySchema)
registry.register('MenuItem', menuItemSchema)
registry.register('Settings', settingsSchema)
registry.register('Summary', summarySchema)

const jsonResponse = <T extends z.ZodTypeAny>(schema: T, description: string) => ({
  description,
  content: {
    'application/json': {
      schema
    }
  }
})

registry.registerPath({
  method: 'get',
  path: '/health',
  summary: 'Health check',
  responses: { 200: jsonResponse(healthSchema, 'Service healthy') }
})

registry.registerPath({
  method: 'get',
  path: '/orders',
  summary: 'List orders',
  request: {
    query: z.object({
      status: orderStatusSchema.optional(),
      customerId: z.coerce.number().int().positive().optional(),
      search: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional()
    })
  },
  responses: { 200: jsonResponse(z.array(orderSchema), 'Orders list') }
})

registry.registerPath({
  method: 'post',
  path: '/orders',
  summary: 'Create an order',
  request: { body: { content: { 'application/json': { schema: createOrderBodySchema } } } },
  responses: {
    201: jsonResponse(orderSchema, 'Order created'),
    422: jsonResponse(errorSchema, 'Business rule violation')
  }
})

for (const action of ['accept', 'prepare', 'ready', 'complete', 'cancel'] as const) {
  registry.registerPath({
    method: 'post',
    path: `/orders/{id}/${action}`,
    summary: `${action} an order`,
    request: { params: z.object({ id: z.coerce.number().int().positive() }) },
    responses: {
      200: jsonResponse(orderSchema, 'Order updated'),
      422: jsonResponse(errorSchema, 'Invalid transition')
    }
  })
}

registry.registerPath({
  method: 'get',
  path: '/customers',
  summary: 'List customers',
  responses: { 200: jsonResponse(z.array(customerSchema), 'Customers list') }
})

registry.registerPath({
  method: 'get',
  path: '/customers/{id}/orders',
  summary: 'List orders for a customer',
  request: { params: z.object({ id: z.coerce.number().int().positive() }) },
  responses: {
    200: jsonResponse(z.array(orderSchema), 'Customer orders'),
    404: jsonResponse(errorSchema, 'Customer not found')
  }
})

registry.registerPath({
  method: 'get',
  path: '/categories',
  summary: 'List menu categories',
  responses: { 200: jsonResponse(z.array(menuCategorySchema), 'Categories list') }
})

registry.registerPath({
  method: 'post',
  path: '/categories',
  summary: 'Create a menu category',
  request: { body: { content: { 'application/json': { schema: createCategoryBodySchema } } } },
  responses: {
    201: jsonResponse(menuCategorySchema, 'Category created'),
    422: jsonResponse(errorSchema, 'Unable to create category')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/categories/{id}',
  summary: 'Update a menu category',
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: updateCategoryBodySchema } } }
  },
  responses: {
    200: jsonResponse(menuCategorySchema, 'Category updated'),
    422: jsonResponse(errorSchema, 'Unable to update category')
  }
})

registry.registerPath({
  method: 'get',
  path: '/menu-items',
  summary: 'List menu items',
  responses: { 200: jsonResponse(z.array(menuItemSchema), 'Menu items list') }
})

registry.registerPath({
  method: 'post',
  path: '/menu-items',
  summary: 'Create a menu item',
  request: { body: { content: { 'application/json': { schema: createMenuItemBodySchema } } } },
  responses: {
    201: jsonResponse(menuItemSchema, 'Menu item created'),
    422: jsonResponse(errorSchema, 'Invalid menu item payload')
  }
})

registry.registerPath({
  method: 'patch',
  path: '/menu-items/{id}',
  summary: 'Update a menu item',
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: { content: { 'application/json': { schema: updateMenuItemBodySchema } } }
  },
  responses: {
    200: jsonResponse(menuItemSchema, 'Menu item updated'),
    422: jsonResponse(errorSchema, 'Invalid menu item update')
  }
})

registry.registerPath({
  method: 'get',
  path: '/settings',
  summary: 'Get settings',
  responses: { 200: jsonResponse(settingsSchema, 'Settings payload') }
})

registry.registerPath({
  method: 'patch',
  path: '/settings',
  summary: 'Update settings',
  request: { body: { content: { 'application/json': { schema: updateSettingsBodySchema } } } },
  responses: {
    200: jsonResponse(settingsSchema, 'Settings updated'),
    422: jsonResponse(errorSchema, 'Invalid settings payload')
  }
})

registry.registerPath({
  method: 'get',
  path: '/summary',
  summary: 'Get home summary',
  responses: { 200: jsonResponse(summarySchema, 'Summary payload') }
})

const generator = new OpenApiGeneratorV3(registry.definitions)
const spec = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Odyssey API',
    version: '0.0.1'
  }
})

const root = process.cwd()
writeFileSync(resolve(root, 'openapi.json'), JSON.stringify(spec, null, 2))
writeFileSync(
  resolve(root, 'src/openapi-spec.ts'),
  `/* Generated by pnpm gen:contract — do not edit. */\nexport default ${JSON.stringify(spec, null, 2)} as const\n`
)
console.log('Generated openapi.json and src/openapi-spec.ts from drizzle-zod API schemas')
