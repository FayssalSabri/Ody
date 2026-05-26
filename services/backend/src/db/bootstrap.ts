import { sql } from '../lib/db'

let schemaReady: Promise<void> | null = null

export async function ensureDatabaseSchema() {
  if (!schemaReady) {
    schemaReady = runEnsureDatabaseSchema()
  }

  return schemaReady
}

async function runEnsureDatabaseSchema() {
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'order_status'
      ) THEN
        CREATE TYPE order_status AS ENUM (
          'pending',
          'accepted',
          'preparing',
          'ready',
          'completed',
          'cancelled'
        );
      END IF;
    END $$;
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_categories (
      id serial PRIMARY KEY,
      name varchar(120) NOT NULL,
      description text,
      sort_order integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id serial PRIMARY KEY,
      category_id integer NOT NULL REFERENCES menu_categories(id),
      name varchar(160) NOT NULL,
      description text,
      price numeric(10,2) NOT NULL,
      available boolean NOT NULL DEFAULT true,
      image_url text,
      created_at timestamp NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id serial PRIMARY KEY,
      name varchar(160) NOT NULL,
      email varchar(160) NOT NULL,
      phone varchar(40),
      created_at timestamp NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id serial PRIMARY KEY,
      customer_id integer NOT NULL REFERENCES customers(id),
      status order_status NOT NULL DEFAULT 'pending',
      total numeric(10,2) NOT NULL,
      notes text,
      created_at timestamp NOT NULL DEFAULT NOW(),
      updated_at timestamp NOT NULL DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id serial PRIMARY KEY,
      order_id integer NOT NULL REFERENCES orders(id),
      menu_item_id integer NOT NULL REFERENCES menu_items(id),
      quantity integer NOT NULL,
      unit_price numeric(10,2) NOT NULL,
      subtotal numeric(10,2) NOT NULL
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id serial PRIMARY KEY,
      key varchar(160) NOT NULL UNIQUE,
      value text NOT NULL,
      updated_at timestamp NOT NULL DEFAULT NOW()
    );
  `
}
