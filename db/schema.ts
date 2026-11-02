import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
export const orders = sqliteTable("delivery_orders", {
  id: text("id").primaryKey(), owner: text("owner").notNull(), requestKey: text("request_key").notNull(), restaurantId: text("restaurant_id").notNull(),
  items: text("items").notNull(), subtotal: integer("subtotal").notNull(), delivery: integer("delivery").notNull(), service: integer("service").notNull(), discount: integer("discount").notNull(), total: integer("total").notNull(),
  address: text("address").notNull(), note: text("note").notNull(), slot: text("slot").notNull(), status: text("status").notNull(), issue: text("issue"), createdAt: integer("created_at").notNull(), updatedAt: integer("updated_at").notNull(),
}, table => [uniqueIndex("delivery_order_idempotency").on(table.owner, table.requestKey)]);
