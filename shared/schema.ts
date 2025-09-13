import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  photoURL: text("photo_url"),
  role: text("role").notNull().default("athlete"), // "athlete" | "coach" | "admin"
  sport: text("sport"),
  skillLevel: text("skill_level"),
  location: text("location"),
  age: integer("age"),
  points: integer("points").notNull().default(0),
  badge: text("badge").notNull().default("Bronze"), // "Bronze" | "Silver" | "Gold" | "Platinum"
  rank: integer("rank"),
  metrics: jsonb("metrics").default({}), // { speed: number, strength: number, stamina: number, technique: number }
  createdAt: timestamp("created_at").defaultNow(),
});

export const talents = pgTable("talents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sport: text("sport").notNull(),
  category: text("category"),
  description: text("description"),
  userId: varchar("user_id").notNull().references(() => users.id),
  approved: boolean("approved").notNull().default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  pointsAwarded: integer("points_awarded").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  pointsRequired: integer("points_required").notNull(),
  badge: text("badge"), // Optional badge tier
  type: text("type").notNull(), // "milestone" | "streak" | "performance" | "special"
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  pointsEarned: integer("points_earned").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

export const dailyTasks = pgTable("daily_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull().default(10),
  category: text("category").notNull(), // "training" | "nutrition" | "recovery" | "analysis"
  difficulty: text("difficulty").notNull().default("easy"), // "easy" | "medium" | "hard"
  aiRecommended: boolean("ai_recommended").notNull().default(false),
  userId: varchar("user_id").references(() => users.id), // null for global tasks
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coachAthletes = pgTable("coach_athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  athleteId: varchar("athlete_id").notNull().references(() => users.id),
  approvedAt: timestamp("approved_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceRecords = pgTable("performance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sport: text("sport").notNull(),
  metrics: jsonb("metrics").notNull(), // { speed: number, strength: number, stamina: number, technique: number }
  notes: text("notes"),
  recordedBy: varchar("recorded_by").references(() => users.id), // coach who recorded it
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const injuryAlerts = pgTable("injury_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => users.id),
  coachId: varchar("coach_id").references(() => users.id),
  riskLevel: text("risk_level").notNull(), // "low" | "medium" | "high" | "critical"
  bodyPart: text("body_part").notNull(),
  description: text("description").notNull(),
  recommendations: text("recommendations"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertTalentSchema = createInsertSchema(talents).omit({
  id: true,
  createdAt: true,
  approved: true,
  approvedBy: true,
  pointsAwarded: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  createdAt: true,
  completed: true,
  completedAt: true,
});

export const insertCoachAthleteSchema = createInsertSchema(coachAthletes).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export const insertPerformanceRecordSchema = createInsertSchema(performanceRecords).omit({
  id: true,
  recordedAt: true,
});

export const insertInjuryAlertSchema = createInsertSchema(injuryAlerts).omit({
  id: true,
  createdAt: true,
  resolved: true,
  resolvedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Talent = typeof talents.$inferSelect;
export type InsertTalent = z.infer<typeof insertTalentSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type CoachAthlete = typeof coachAthletes.$inferSelect;
export type InsertCoachAthlete = z.infer<typeof insertCoachAthleteSchema>;
export type PerformanceRecord = typeof performanceRecords.$inferSelect;
export type InsertPerformanceRecord = z.infer<typeof insertPerformanceRecordSchema>;
export type InjuryAlert = typeof injuryAlerts.$inferSelect;
export type InsertInjuryAlert = z.infer<typeof insertInjuryAlertSchema>;
