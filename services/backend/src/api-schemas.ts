import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)
import { createInsertSchema } from 'drizzle-zod'
import { menuCategories } from './db/schema'

export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled'
])

export const errorSchema = z.object({
  error: z.string()
})

export const orderItemLineSchema = z.object({
  name: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  subtotal: z.number()
})

export const orderSchema = z.object({
  id: z.number().int(),
  customerName: z.string(),
  status: orderStatusSchema,
  total: z.number(),
  createdAt: z.string(),
  items: z.array(orderItemLineSchema)
})

export const customerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  ordersCount: z.number().int(),
  totalSpend: z.number(),
  lastOrderDate: z.string()
})

export const menuCategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  sortOrder: z.number().int(),
  itemCount: z.number().int()
})

export const menuItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  available: z.boolean(),
  category: z.string()
})

export const settingsSchema = z.object({
  prepTimeMinutes: z.number().int().min(1),
  autoAccept: z.boolean(),
  serviceAvailable: z.boolean(),
  openingHours: z.string()
})

export const popularItemSchema = z.object({
  name: z.string(),
  count: z.number().int()
})

export const summarySchema = z.object({
  ordersToday: z.number().int(),
  revenueToday: z.number(),
  pendingOrders: z.number().int(),
  popularItems: z.array(popularItemSchema),
  recentOrders: z.array(orderSchema)
})

export const healthSchema = z.object({
  status: z.string(),
  service: z.string()
})

export const createOrderBodySchema = z.object({
  customerId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().positive(),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
})

const insertCategorySchema = createInsertSchema(menuCategories)

export const createCategoryBodySchema = insertCategorySchema
  .pick({
    name: true,
    description: true,
    sortOrder: true
  })
  .extend({
    description: z.string(),
    sortOrder: z.number().int()
  })

export const updateCategoryBodySchema = createCategoryBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field must be provided.' }
)

export const createMenuItemBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  available: z.boolean(),
  category: z.string().min(1)
})

export const updateMenuItemBodySchema = createMenuItemBodySchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'At least one field must be provided.' }
)

export const updateSettingsBodySchema = z
  .object({
    prepTimeMinutes: z.number().int().positive().optional(),
    autoAccept: z.boolean().optional(),
    serviceAvailable: z.boolean().optional(),
    openingHours: z.string().min(1).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one setting must be provided.'
  })

export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  customerId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
})
