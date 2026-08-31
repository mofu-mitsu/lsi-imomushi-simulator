import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

export const createPool = () => {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB_NAME,
      connectionLimit: 10,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return global._mysqlPool;
};

let db: any;
try {
  const pool = createPool();
  db = drizzle(pool, { schema, mode: 'default' });
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = { findMany: async () => [], findFirst: async () => null,
    findUnique: async () => null, create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {}, delete: async () => ({}) };
  
  const chainable: any = new Proxy(async () => [], {
    get: (target, prop) => {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') return target[prop as keyof typeof target];
      return () => chainable;
    }
  });

  db = new Proxy({}, {
    get: (_, prop) => prop === 'query'
      ? new Proxy({}, { get: () => noOp }) : () => chainable,
  });
}
export { db };
