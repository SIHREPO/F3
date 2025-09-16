import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  real,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("citizen"), // citizen or authority
  employeeId: varchar("employee_id").unique(), // For authority users
  role: employeeRoleEnum("role"), // Role within authority organization
  department: issueCategoryEnum("department"), // Which department/category they handle
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Issue categories enum
export const issueCategoryEnum = pgEnum("issue_category", [
  "drainage",
  "pothole", 
  "wire",
  "garbage",
  "street_light",
]);

// Employee roles enum
export const employeeRoleEnum = pgEnum("employee_role", [
  "admin",
  "supervisor", 
  "field_worker",
]);

// Issue status enum
export const issueStatusEnum = pgEnum("issue_status", [
  "pending",
  "in_progress", 
  "resolved",
  "rejected",
]);

// Reports table
export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id), // Assigned authority employee
  category: issueCategoryEnum("category").notNull(),
  description: text("description"),
  photoUrl: varchar("photo_url"), // URL to stored photo
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address"), // Reverse geocoded address
  status: issueStatusEnum("status").notNull().default("pending"),
  reportId: varchar("report_id").notNull().unique(), // Public facing ID like SW2024001
  priority: varchar("priority").default("medium"), // low, medium, high, urgent
  estimatedCompletion: timestamp("estimated_completion"),
  assignedAt: timestamp("assigned_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report feedback and ratings table
export const reportFeedback = pgTable("report_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reportId: varchar("report_id").notNull().references(() => reports.id),
  userId: varchar("user_id").notNull().references(() => users.id), // Citizen who gave feedback
  rating: integer("rating").notNull(), // 1-5 star rating
  satisfactionLevel: varchar("satisfaction_level"), // very_poor, poor, average, good, excellent
  comment: text("comment"),
  serviceQuality: integer("service_quality"), // 1-5 rating for service quality
  responseTime: integer("response_time"), // 1-5 rating for response time
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee performance tracking table
export const employeePerformance = pgTable("employee_performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalAssigned: integer("total_assigned").default(0),
  totalResolved: integer("total_resolved").default(0),
  totalPending: integer("total_pending").default(0),
  averageRating: real("average_rating"), // Average user rating
  satisfactionRate: real("satisfaction_rate"), // Percentage of satisfied users
  averageResponseTime: real("average_response_time"), // In hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_employee_performance_period").on(table.employeeId, table.year, table.month)
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reports: many(reports, { relationName: "user_reports" }),
  assignedReports: many(reports, { relationName: "assigned_reports" }),
  feedback: many(reportFeedback),
  performance: many(employeePerformance),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
    relationName: "user_reports",
  }),
  assignedEmployee: one(users, {
    fields: [reports.assignedTo],
    references: [users.id],
    relationName: "assigned_reports",
  }),
  feedback: many(reportFeedback),
}));

export const reportFeedbackRelations = relations(reportFeedback, ({ one }) => ({
  report: one(reports, {
    fields: [reportFeedback.reportId],
    references: [reports.id],
  }),
  user: one(users, {
    fields: [reportFeedback.userId],
    references: [users.id],
  }),
}));

export const employeePerformanceRelations = relations(employeePerformance, ({ one }) => ({
  employee: one(users, {
    fields: [employeePerformance.employeeId],
    references: [users.id],
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ 
  id: true, 
  reportId: true, 
  assignedAt: true,
  createdAt: true, 
  updatedAt: true 
});
export const insertFeedbackSchema = createInsertSchema(reportFeedback).omit({ 
  id: true, 
  createdAt: true 
});
export const insertPerformanceSchema = createInsertSchema(employeePerformance).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const assignReportSchema = z.object({
  reportId: z.string(),
  employeeId: z.string(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  estimatedCompletion: z.date().optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type ReportFeedback = typeof reportFeedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type EmployeePerformance = typeof employeePerformance.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type AssignReport = z.infer<typeof assignReportSchema>;
