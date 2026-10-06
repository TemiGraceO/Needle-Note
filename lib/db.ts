import * as SQLite from 'expo-sqlite';

// Open or instantiate the local device database file storage context
export const db = SQLite.openDatabaseSync('app.db');

export function setupDatabase() {
  try {
    db.execSync(`
      PRAGMA journal_mode = WAL;
      
      -- CLIENT INDEX LEDGER SCHEMA TABLE
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        notes TEXT,
        measurements TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      -- PRODUCTION ORDERS & FABRIC STYLE REGISTRY TABLE
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
      
      -- DEPOSIT RECEIPTS & CASH TRACKER TRANSACTION TABLE
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        paid_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      );

      -- DYNAMIC CLOUD CHAT MESSAGE LOGS (STANDARDIZES TWILIO / WHATSAPP STORAGE)
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        body TEXT NOT NULL,
        sender TEXT CHECK(sender IN ('tailor', 'client')) NOT NULL,
        channel TEXT CHECK(channel IN ('whatsapp', 'sms')) NOT NULL,
        sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `);
  } catch (err) {
    console.error('Core database initialization failed:', err);
  }
}

/**
 * Custom App Query Helpers
 * Joins orders onto customers to populate feed card lines.
 */
export function getOrdersWithCustomerNames() {
  try {
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
      SELECT o.*, IFNULL(c.name, 'Unknown Client') as customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.id DESC
    `);
  } catch (err) {
    console.error('Database query failure during orders join execution:', err);
    return [];
  }
}

/**
 * Financial Analytics and History Queries
 */
export function getFinancialSummary() {
  try {
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
      SELECT p.id, p.amount, p.paid_at, IFNULL(c.name, 'Unknown Client') as customer_name
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY p.id DESC
      LIMIT 20
    `);

    return {
      totalRevenue,
      totalPaid,
      totalBalance,
      history
    };
  } catch (err) {
    console.error('Financial calculations transaction failed to compute:', err);
    return {
      totalRevenue: 0,
      totalPaid: 0,
      totalBalance: 0,
      history: []
    };
  }
}

/**
 * Chat Messaging Transactions Storage Operations Engine API
 * Includes inline validation to runtime-patch missing tables on demand.
 */
export function getCustomerMessages(customerId: number) {
  try {
    return db.getAllSync<{
      id: number;
      body: string;
      sender: 'tailor' | 'client';
      channel: 'whatsapp' | 'sms';
      sent_at: string;
    }>(
      'SELECT id, body, sender, channel, sent_at FROM messages WHERE customer_id = ? ORDER BY id ASC',
      [customerId]
    );
  } catch (err: any) {
    // If table missing error is thrown, intercept and construct table at runtime context
    if (err.toString().includes('no such table: messages')) {
      console.log('Intercepted missing messages table. Auto-creating table at runtime...');
      try {
        db.execSync(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            body TEXT NOT NULL,
            sender TEXT CHECK(sender IN ('tailor', 'client')) NOT NULL,
            channel TEXT CHECK(channel IN ('whatsapp', 'sms')) NOT NULL,
            sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
          );
        `);
        // Retry selection query instantly
        return db.getAllSync<{
          id: number;
          body: string;
          sender: 'tailor' | 'client';
          channel: 'whatsapp' | 'sms';
          sent_at: string;
        }>(
          'SELECT id, body, sender, channel, sent_at FROM messages WHERE customer_id = ? ORDER BY id ASC',
          [customerId]
        );
      } catch (innerErr) {
        console.error('Failed to runtime-patch missing messages table:', innerErr);
      }
    }
    console.error('Failed to pull chat record rows from device:', err);
    return [];
  }
}

export function saveLocalMessage(
  customerId: number, 
  body: string, 
  sender: 'tailor' | 'client', 
  channel: 'whatsapp' | 'sms' = 'whatsapp'
) {
  try {
    const res = db.runSync(
      'INSERT INTO messages (customer_id, body, sender, channel) VALUES (?, ?, ?, ?);',
      [customerId, body.trim(), sender, channel]
    );
    return res.lastInsertRowId;
  } catch (err: any) {
    if (err.toString().includes('no such table: messages')) {
      console.log('Intercepted missing messages table during insertion. Auto-patching...');
      try {
        db.execSync(`
          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            body TEXT NOT NULL,
            sender TEXT CHECK(sender IN ('tailor', 'client')) NOT NULL,
            channel TEXT CHECK(channel IN ('whatsapp', 'sms')) NOT NULL,
            sent_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
          );
        `);
        const res = db.runSync(
          'INSERT INTO messages (customer_id, body, sender, channel) VALUES (?, ?, ?, ?);',
          [customerId, body.trim(), sender, channel]
        );
        return res.lastInsertRowId;
      } catch (innerErr) {
        console.error('Failed to runtime-patch table during insertion fallback:', innerErr);
      }
    }
    console.error('Failed to commit message log line data entry item:', err);
    return null;
  }
}
