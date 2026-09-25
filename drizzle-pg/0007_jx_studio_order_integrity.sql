CREATE UNIQUE INDEX IF NOT EXISTS projects_order_id_unique ON projects(order_id) WHERE order_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_unique ON orders(stripe_session_id);
