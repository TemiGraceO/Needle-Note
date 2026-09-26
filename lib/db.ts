import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('app.db');

export function setupDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      measurements TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      description TEXT,
      style_photo TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'sewing',
      total INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `);
}

/**
 * Custom App Query Helpers
 * Joins orders onto customers to populate feed card lines.
 */
export function getOrdersWithCustomerNames() {
  return db.getAllSync<{
    id: number;
    customer_id: number;
    customer_name: string;
    description: string;
    style_photo: string;
    due_date: string;
    status: string;
    total: number;
  }>(`
    SELECT o.*, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.id DESC
  `);
}
/**
 * Financial Analytics and History Queries
 */
export function getFinancialSummary() {
  // 1. Calculate sum of all orders
  const totalRow = db.getFirstSync<{ total: number }>(
    'SELECT TOTAL(total) as total FROM orders'
  );
  
  // 2. Calculate sum of all recorded payments
  const paidRow = db.getFirstSync<{ paid: number }>(
    'SELECT TOTAL(amount) as paid FROM payments'
  );

  const totalRevenue = totalRow?.total || 0;
  const totalPaid = paidRow?.paid || 0;
  const totalBalance = totalRevenue - totalPaid;

  // 3. Fetch recent payments mapped to the customer's name
  const history = db.getAllSync<{
    id: number;
    amount: number;
    paid_at: string;
    customer_name: string;
  }>(`
    SELECT p.id, p.amount, p.paid_at, c.name as customer_name
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    JOIN customers c ON o.customer_id = c.id
    ORDER BY p.id DESC
    LIMIT 20
  `);

  return {
    totalRevenue,
    totalPaid,
    totalBalance,
    history
  };
}
