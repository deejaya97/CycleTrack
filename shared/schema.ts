import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const periodEntries = pgTable("period_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  flowIntensity: text("flow_intensity").notNull(), // 'light', 'medium', 'heavy'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const symptoms = pgTable("symptoms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  mood: text("mood"), // 'great', 'good', 'okay', 'bad', 'terrible'
  energyLevel: text("energy_level"), // 'high', 'medium', 'low'
  cramps: text("cramps"), // 'none', 'mild', 'moderate', 'severe'
  headache: text("headache"), // 'none', 'mild', 'moderate', 'severe'
  bloating: text("bloating"), // 'none', 'mild', 'moderate', 'severe'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPeriodEntrySchema = createInsertSchema(periodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertSymptomSchema = createInsertSchema(symptoms).omit({
  id: true,
  createdAt: true,
});

export type InsertPeriodEntry = z.infer<typeof insertPeriodEntrySchema>;
export type PeriodEntry = typeof periodEntries.$inferSelect;
export type InsertSymptom = z.infer<typeof insertSymptomSchema>;
export type Symptom = typeof symptoms.$inferSelect;
