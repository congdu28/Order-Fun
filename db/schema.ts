import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const orderSessions = sqliteTable(
  'order_sessions',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    phase: text('phase', {
      enum: ['open', 'locked', 'payment', 'completed', 'cancelled'],
    })
      .notNull()
      .default('open'),
    ordererId: text('orderer_id').notNull(),
    ordererName: text('orderer_name').notNull(),
    deadlineAt: integer('deadline_at', { mode: 'timestamp' }),
    totalBill: integer('total_bill').notNull().default(0),
    totalItems: integer('total_items').notNull().default(0),
    settlementMethod: text('settlement_method', {
      enum: ['equal', 'item'],
    })
      .notNull()
      .default('equal'),
    bankInfo: text('bank_info'),
    qrObjectKey: text('qr_object_key'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_order_sessions_phase_created').on(table.phase, table.createdAt),
    index('idx_order_sessions_orderer_created').on(
      table.ordererId,
      table.createdAt,
    ),
  ],
);

export const menuItems = sqliteTable(
  'menu_items',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => orderSessions.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    note: text('note'),
    listedPrice: integer('listed_price'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('idx_menu_items_session_sort').on(table.sessionId, table.sortOrder)],
);

export const orderSelections = sqliteTable(
  'order_selections',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => orderSessions.id, { onDelete: 'cascade' }),
    memberId: text('member_id').notNull(),
    memberName: text('member_name').notNull(),
    menuItemId: text('menu_item_id').references(() => menuItems.id, {
      onDelete: 'set null',
    }),
    customItemName: text('custom_item_name'),
    quantity: integer('quantity').notNull().default(1),
    finalUnitPrice: integer('final_unit_price'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('idx_order_selections_session_member').on(
      table.sessionId,
      table.memberId,
    ),
  ],
);

export const paymentRecords = sqliteTable(
  'payment_records',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => orderSessions.id, { onDelete: 'cascade' }),
    memberId: text('member_id').notNull(),
    memberName: text('member_name').notNull(),
    amountDue: integer('amount_due').notNull(),
    markedPaidAt: integer('marked_paid_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('idx_payment_records_session_paid').on(table.sessionId, table.markedPaidAt),
    index('idx_payment_records_member_session').on(
      table.memberId,
      table.sessionId,
    ),
  ],
);
