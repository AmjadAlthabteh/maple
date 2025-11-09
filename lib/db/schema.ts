import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, varchar, index, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['user', 'admin']);
export const planEnum = pgEnum('plan', ['starter', 'pro', 'business']);
export const emailProviderEnum = pgEnum('email_provider', ['gmail', 'outlook', 'custom']);
export const messageStatusEnum = pgEnum('message_status', ['pending', 'processing', 'ready', 'sent', 'failed']);
export const conversationStatusEnum = pgEnum('conversation_status', ['open', 'pending', 'resolved', 'archived']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('user').notNull(),
  emailVerified: boolean('email_verified').default(false),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

// Organizations table
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  plan: planEnum('plan').default('starter').notNull(),
  monthlyMessageLimit: integer('monthly_message_limit').default(500).notNull(),
  monthlyMessagesUsed: integer('monthly_messages_used').default(0).notNull(),
  inboxLimit: integer('inbox_limit').default(1).notNull(),
  brandVoice: text('brand_voice'),
  settings: jsonb('settings').$type<{
    autoRespond?: boolean;
    requireApproval?: boolean;
    workingHours?: { start: string; end: string; timezone: string };
    signature?: string;
    autoResponseRules?: {
      enabled: boolean;
      confidenceThreshold: number; // 0-100, send if AI confidence >= this
      requireApprovalForLowConfidence: boolean;
      autoSendCategories?: string[]; // Auto-send for these categories (e.g., ['general_inquiry', 'faq'])
      neverAutoSendCategories?: string[]; // Never auto-send (e.g., ['billing', 'complaint', 'urgent'])
      maxAutoResponsesPerDay?: number; // Safety limit
      onlyDuringWorkingHours?: boolean;
      requireKnowledgeBaseMatch?: boolean; // Only auto-send if KB was used
      sentimentFilter?: {
        autoSendPositive: boolean; // Auto-send to positive sentiment emails
        autoSendNeutral: boolean;
        requireApprovalNegative: boolean; // Always require approval for negative sentiment
      };
    };
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  stripeCustomerId: text('stripe_customer_id').notNull().unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripePriceId: text('stripe_price_id'),
  status: varchar('status', { length: 50 }), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('subscriptions_org_idx').on(table.organizationId),
  stripeCustomerIdx: index('subscriptions_stripe_customer_idx').on(table.stripeCustomerId),
}));

// Email accounts table
export const emailAccounts = pgTable('email_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  provider: emailProviderEnum('provider').notNull(),
  encryptedAccessToken: text('encrypted_access_token'),
  encryptedRefreshToken: text('encrypted_refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  isActive: boolean('is_active').default(true),
  lastSyncAt: timestamp('last_sync_at'),
  webhookId: text('webhook_id'), // For Gmail push notifications or Outlook webhooks
  metadata: jsonb('metadata').$type<{
    displayName?: string;
    profilePicture?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('email_accounts_org_idx').on(table.organizationId),
  emailIdx: index('email_accounts_email_idx').on(table.email),
}));

// Conversations table
export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  emailAccountId: uuid('email_account_id').notNull().references(() => emailAccounts.id, { onDelete: 'cascade' }),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  customerName: varchar('customer_name', { length: 255 }),
  subject: text('subject'),
  status: conversationStatusEnum('status').default('open').notNull(),
  priority: integer('priority').default(0), // For sorting/filtering
  tags: jsonb('tags').$type<string[]>().default([]),
  assignedToUserId: uuid('assigned_to_user_id').references(() => users.id, { onDelete: 'set null' }),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('conversations_org_idx').on(table.organizationId),
  statusIdx: index('conversations_status_idx').on(table.status),
  customerEmailIdx: index('conversations_customer_email_idx').on(table.customerEmail),
  lastMessageAtIdx: index('conversations_last_message_at_idx').on(table.lastMessageAt),
}));

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  externalId: text('external_id'), // Gmail message ID or Outlook message ID
  threadId: text('thread_id'), // For email threading
  fromEmail: varchar('from_email', { length: 255 }).notNull(),
  fromName: varchar('from_name', { length: 255 }),
  toEmail: varchar('to_email', { length: 255 }).notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  htmlBody: text('html_body'),
  isInbound: boolean('is_inbound').default(true).notNull(),
  isAiGenerated: boolean('is_ai_generated').default(false),
  attachments: jsonb('attachments').$type<Array<{
    filename: string;
    mimeType: string;
    size: number;
    url: string;
  }>>(),
  sentiment: varchar('sentiment', { length: 50 }), // positive, neutral, negative
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('messages_conversation_idx').on(table.conversationId),
  externalIdIdx: index('messages_external_id_idx').on(table.externalId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

// AI Responses table
export const aiResponses = pgTable('ai_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  messageId: uuid('message_id').references(() => messages.id, { onDelete: 'cascade' }), // The message that triggered this
  generatedResponse: text('generated_response').notNull(),
  status: messageStatusEnum('status').default('pending').notNull(),
  confidence: integer('confidence'), // 0-100
  suggestedTone: varchar('suggested_tone', { length: 50 }),
  usedKnowledgeBase: boolean('used_knowledge_base').default(false),
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  editedResponse: text('edited_response'),
  sentAt: timestamp('sent_at'),
  feedback: jsonb('feedback').$type<{
    rating?: number;
    comment?: string;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdx: index('ai_responses_conversation_idx').on(table.conversationId),
  statusIdx: index('ai_responses_status_idx').on(table.status),
}));

// Knowledge base table
export const knowledgeBase = pgTable('knowledge_base', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  source: varchar('source', { length: 50 }), // manual, learned, imported
  embedding: jsonb('embedding'), // For vector similarity search
  createdByUserId: uuid('created_by_user_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  orgIdx: index('knowledge_base_org_idx').on(table.organizationId),
  categoryIdx: index('knowledge_base_category_idx').on(table.category),
  isActiveIdx: index('knowledge_base_is_active_idx').on(table.isActive),
}));

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  metric: varchar('metric', { length: 100 }).notNull(), // response_time, satisfaction_score, messages_sent, etc.
  value: integer('value').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  orgDateIdx: index('analytics_org_date_idx').on(table.organizationId, table.date),
  metricIdx: index('analytics_metric_idx').on(table.metric),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizations),
  assignedConversations: many(conversations),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  emailAccounts: many(emailAccounts),
  conversations: many(conversations),
  knowledgeBase: many(knowledgeBase),
  subscription: one(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [emailAccounts.organizationId],
    references: [organizations.id],
  }),
  conversations: many(conversations),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [conversations.organizationId],
    references: [organizations.id],
  }),
  emailAccount: one(emailAccounts, {
    fields: [conversations.emailAccountId],
    references: [emailAccounts.id],
  }),
  assignedTo: one(users, {
    fields: [conversations.assignedToUserId],
    references: [users.id],
  }),
  messages: many(messages),
  aiResponses: many(aiResponses),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  aiResponses: many(aiResponses),
}));

export const aiResponsesRelations = relations(aiResponses, ({ one }) => ({
  conversation: one(conversations, {
    fields: [aiResponses.conversationId],
    references: [conversations.id],
  }),
  message: one(messages, {
    fields: [aiResponses.messageId],
    references: [messages.id],
  }),
  reviewedBy: one(users, {
    fields: [aiResponses.reviewedByUserId],
    references: [users.id],
  }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  organization: one(organizations, {
    fields: [knowledgeBase.organizationId],
    references: [organizations.id],
  }),
  createdBy: one(users, {
    fields: [knowledgeBase.createdByUserId],
    references: [users.id],
  }),
}));
