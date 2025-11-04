import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const persons = pgTable("persons", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  generation: integer("generation").notNull(),
  parentId: text("parent_id"),
  children: text("children")
    .array()
    .default(sql`'{}'::text[]`),
  birthRank: integer("birth_rank"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Persons = typeof persons.$inferSelect;

export const schema = { persons };
