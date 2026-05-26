import { pgEnum, pgTable, serial, text, timestamp, integer, boolean, numeric, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled'
])

export const menuCategories = pgTable('menu_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').notNull().default(true),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  createdAt: timestamp('created_at').notNull().defaultNow()
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').notNull(),
  status: orderStatusEnum('status').notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull(),
  menuItemId: integer('menu_item_id').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull()
})

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 160 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
})

export const insertMenuCategorySchema = createInsertSchema(menuCategories)
export const selectMenuCategorySchema = createSelectSchema(menuCategories)

export const insertMenuItemSchema = createInsertSchema(menuItems)
export const selectMenuItemSchema = createSelectSchema(menuItems)

export const insertCustomerSchema = createInsertSchema(customers)
export const selectCustomerSchema = createSelectSchema(customers)

export const insertOrderSchema = createInsertSchema(orders)
export const selectOrderSchema = createSelectSchema(orders)

export const insertOrderItemSchema = createInsertSchema(orderItems)
export const selectOrderItemSchema = createSelectSchema(orderItems)

export const insertSettingSchema = createInsertSchema(settings)
export const selectSettingSchema = createSelectSchema(settings)
