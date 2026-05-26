import { sql } from './lib/db'
import { ensureDatabaseSchema } from './db/bootstrap'

async function seed() {
  await ensureDatabaseSchema()

  await sql`
    TRUNCATE TABLE
      order_items,
      orders,
      customers,
      menu_items,
      menu_categories,
      settings
    RESTART IDENTITY CASCADE
  `

  const categories = await sql<{ id: number; name: string }[]>`
    INSERT INTO menu_categories (name, description, sort_order)
    VALUES
      ('Mains', 'Signature mains', 1),
      ('Starters', 'Shareable starters', 2),
      ('Drinks', 'Beverages', 3),
      ('Desserts', 'House desserts', 4)
    RETURNING id, name
  `

  const categoriesByName = Object.fromEntries(categories.map((category) => [category.name, category.id]))

  const menuItems = await sql<{ id: number; name: string }[]>`
    INSERT INTO menu_items (category_id, name, description, price, available, image_url)
    VALUES
      (${categoriesByName.Mains}, 'Truffle Pasta', 'House-made pasta with black truffle cream.', 24.50, true, null),
      (${categoriesByName.Mains}, 'Wood-fired Pizza', 'Tomato, mozzarella, basil, and chili oil.', 28.00, true, null),
      (${categoriesByName.Mains}, 'Grilled Salmon', 'Citrus butter and seasonal vegetables.', 32.00, true, null),
      (${categoriesByName.Starters}, 'Garden Salad', 'Mixed greens, cucumber, cherry tomatoes, and herb vinaigrette.', 14.00, true, null),
      (${categoriesByName.Starters}, 'Crispy Calamari', 'Lemon aioli and chili flakes.', 18.00, true, null),
      (${categoriesByName.Starters}, 'Burrata Plate', 'Heirloom tomatoes and basil oil.', 16.00, false, null),
      (${categoriesByName.Drinks}, 'Sparkling Lemonade', 'House sparkling lemonade.', 8.00, true, null),
      (${categoriesByName.Drinks}, 'Cold Brew', '12-hour steeped coffee.', 6.50, true, null),
      (${categoriesByName.Desserts}, 'Olive Oil Cake', 'Whipped mascarpone and berries.', 12.00, true, null),
      (${categoriesByName.Desserts}, 'Chocolate Pot', 'Dark chocolate ganache.', 10.00, true, null)
    RETURNING id, name
  `

  const menuItemsByName = Object.fromEntries(menuItems.map((item) => [item.name, item.id]))

  const customers = await sql<{ id: number; email: string }[]>`
    INSERT INTO customers (name, email, phone)
    VALUES
      ('Ava Martinez', 'ava@example.com', '555-1011'),
      ('Noah Lee', 'noah@example.com', '555-2022'),
      ('Sofia Chen', 'sofia@example.com', '555-3033'),
      ('Jordan Blake', 'jordan@example.com', '555-4044'),
      ('Mia Patel', 'mia@example.com', '555-5055')
    RETURNING id, email
  `

  const customersByEmail = Object.fromEntries(customers.map((customer) => [customer.email, customer.id]))

  const orderSeeds = [
    { customer: 'ava@example.com', status: 'pending', total: 32.5, createdAt: '2026-05-24T18:12:00.000Z', items: [['Truffle Pasta', 1, 24.5], ['Sparkling Lemonade', 1, 8]] },
    { customer: 'noah@example.com', status: 'ready', total: 42, createdAt: '2026-05-24T17:05:00.000Z', items: [['Wood-fired Pizza', 1, 28], ['Garden Salad', 1, 14]] },
    { customer: 'sofia@example.com', status: 'accepted', total: 18, createdAt: '2026-05-24T16:50:00.000Z', items: [['Crispy Calamari', 1, 18]] },
    { customer: 'jordan@example.com', status: 'preparing', total: 32, createdAt: '2026-05-24T15:20:00.000Z', items: [['Grilled Salmon', 1, 32]] },
    { customer: 'mia@example.com', status: 'completed', total: 18.5, createdAt: '2026-05-24T12:00:00.000Z', items: [['Olive Oil Cake', 1, 12], ['Cold Brew', 1, 6.5]] },
    { customer: 'ava@example.com', status: 'cancelled', total: 16, createdAt: '2026-05-23T20:00:00.000Z', items: [['Burrata Plate', 1, 16]] },
    { customer: 'noah@example.com', status: 'completed', total: 38.5, createdAt: '2026-05-23T19:10:00.000Z', items: [['Truffle Pasta', 1, 24.5], ['Chocolate Pot', 1, 10], ['Cold Brew', 1, 4]] }
  ] as const

  for (const seedOrder of orderSeeds) {
    const [order] = await sql<{ id: number }[]>`
      INSERT INTO orders (customer_id, status, total, notes, created_at, updated_at)
      VALUES
        (${customersByEmail[seedOrder.customer]}, ${seedOrder.status}, ${seedOrder.total.toFixed(2)}, null, ${seedOrder.createdAt}, NOW())
      RETURNING id
    `

    for (const [name, quantity, subtotal] of seedOrder.items) {
      const menuItemId = menuItemsByName[name]
      const unitPrice = Number((subtotal / quantity).toFixed(2))

      await sql`
        INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, subtotal)
        VALUES (${order.id}, ${menuItemId}, ${quantity}, ${unitPrice.toFixed(2)}, ${subtotal.toFixed(2)})
      `
    }
  }

  await sql`
    INSERT INTO settings (key, value, updated_at)
    VALUES
      ('prep_time_minutes', '15', NOW()),
      ('auto_accept', 'false', NOW()),
      ('service_available', 'true', NOW()),
      ('opening_hours', '{"mon":"09:00-22:00","tue":"09:00-22:00","wed":"09:00-22:00"}', NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `

  console.log('Seed complete')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
