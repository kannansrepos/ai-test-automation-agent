import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

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
  targetDomain: text('target_domain').default('http://localhost:3000/'),
  globalInstructions: text('global_instructions'),
  updatedAt: timestamp('updated_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const TestCasesTable = pgTable('test_cases', {
  id: serial('id').primaryKey(),
  // Repository Informations
  repoId: integer('repository_id')
    .notNull()
    .references(() => repositories.id, { onDelete: 'cascade' }),
  githubRepoId: integer('github_repo_id').notNull(),
  repoName: text('repo_name').notNull(),
  repoOwner: text('repo_owner').notNull(),
  branch: text('branch').default('main').notNull(),

  // Test Case Informations
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  priority: text('priority').notNull(),

  // Test case content
  targetRoute: text('target_route').notNull(),
  targetFile: jsonb('target_file').$type<string[]>().default([]),
  expectedResult: text('expected_result').notNull(),

  testScript: text('test_script').notNull(),
  status: text('status').default('generated').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Repository = typeof repositories.$inferSelect;
export type NewRepository = typeof repositories.$inferInsert;

export type TestCase = typeof TestCasesTable.$inferSelect;
export type NewTestCase = typeof TestCasesTable.$inferInsert;
