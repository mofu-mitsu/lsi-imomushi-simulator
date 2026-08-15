import { relations } from 'drizzle-orm';
import { int, mysqlTable, serial, varchar, timestamp } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  ownerName: varchar('owner_name', { length: 255 }),
  selfType: varchar('self_type', { length: 255 }), 
  createdAt: timestamp('created_at').defaultNow(),
});

export const caterpillars = mysqlTable('caterpillars', {
  id: serial('id').primaryKey(),
  userId: int('user_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull().default('LSI芋虫'),
  stage: int('stage').notNull().default(0), // 0: 幼虫, 1: 課長, 2: 法務部長, 3: 監査主任, 4: 伝説の72,000匹
  exp: int('exp').notNull().default(0),
  lastFedAt: timestamp('last_fed_at'),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const caterpillarsRelations = relations(caterpillars, ({ one }) => ({
  user: one(users, {
    fields: [caterpillars.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  caterpillars: many(caterpillars),
}));
