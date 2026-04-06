import { pgTable, text, serial, date, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clubCards = pgTable("club_cards", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id", { length: 255 }).notNull().unique(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  cardType: varchar("card_type", { length: 50 }).notNull(),
  issueDate: date("issue_date").notNull(),
  expiryDate: date("expiry_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Активна"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  clientId: varchar("client_id", { length: 255 }).notNull(),
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  procedureType: varchar("procedure_type", { length: 100 }),
  notes: text("notes"),
  masterId: varchar("master_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClubCardSchema = createInsertSchema(clubCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertClubCard = z.infer<typeof insertClubCardSchema>;
export type ClubCard = typeof clubCards.$inferSelect;

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
});

export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visits.$inferSelect;

// Keep existing users table for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
