import { db } from './db';

export type OrderWithCustomer = {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_phone: string | null;
  description: string | null;
  due_date: string | null;
  status: string;
  total: number;
};

export function getOrdersDueToday(): OrderWithCustomer[] {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  return db.getAllSync<OrderWithCustomer>(
    `SELECT o.id, o.customer_id, c.name as customer_name, c.phone as customer_phone,
            o.description, o.due_date, o.status, o.total
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE o.due_date = ?
     ORDER BY o.due_date`,
    [today]
  );
}