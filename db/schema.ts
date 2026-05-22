import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  credits: integer('credits').default(1000).notNull(),
});

export const repositories = pgTable('repositories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  repoId: integer('repo_id').notNull(),
  name: text('name').notNull(),
  fullName: text('full_name').notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  stargazersCount: integer('stargazers_count').notNull(),
  private: integer('private').notNull(),
  language: text('language'),
  defaultBranch: text('default_branch'),
  owner: text('owner').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;
