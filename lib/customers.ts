import { db } from './db';

export type Measurements = Record<string, string>;

export type Customer = {
  id: number;
  name: string;
  phone: string | null;
  notes: string | null;
  measurements: Measurements;
};

type Row = {
  id: number;
  name: string;
  phone: string | null;
  notes: string | null;
  measurements: string | null;
};

function toCustomer(r: Row): Customer {
  let m: Measurements = {};
  try {
    m = r.measurements ? JSON.parse(r.measurements) : {};
  } catch {
    m = {};
  }
  return { id: r.id, name: r.name, phone: r.phone, notes: r.notes, measurements: m };
}

export function getCustomers(search = ''): Customer[] {
  const q = `%${search.trim()}%`;
  const rows = db.getAllSync<Row>(
    'SELECT * FROM customers WHERE name LIKE ? OR phone LIKE ? ORDER BY name COLLATE NOCASE',
    [q, q]
  );
  return rows.map(toCustomer);
}

export function getCustomer(id: number): Customer | null {
  const r = db.getFirstSync<Row>('SELECT * FROM customers WHERE id = ?', [id]);
  return r ? toCustomer(r) : null;
}

export function addCustomer(name: string, phone: string): number {
  const res = db.runSync('INSERT INTO customers (name, phone) VALUES (?, ?)', [
    name.trim(),
    phone.trim(),
  ]);
  return res.lastInsertRowId;
}

export function saveMeasurements(id: number, m: Measurements) {
  db.runSync('UPDATE customers SET measurements = ? WHERE id = ?', [JSON.stringify(m), id]);
}