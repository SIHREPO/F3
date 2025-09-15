import {
  users,
  reports,
  type User,
  type UpsertUser,
  type Report,
  type InsertReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getUserReports(userId: string): Promise<Report[]>;
  getReportById(id: string): Promise<Report | undefined>;
  updateReportStatus(id: string, status: string): Promise<Report | undefined>;
  getUserReportStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  }>;
  
  // Authority operations
  getAllReports(): Promise<Report[]>;
  getAuthorityStats(): Promise<{
    totalReports: number;
    pendingReports: number;
    inProgressReports: number;
    resolvedReports: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Report operations
  async createReport(reportData: InsertReport): Promise<Report> {
    // Generate unique report ID
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    const reportId = `SW${year}${randomNum}`;

    const [report] = await db
      .insert(reports)
      .values({
        ...reportData,
        reportId,
      })
      .returning();
    return report;
  }

  async getUserReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReportById(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async updateReportStatus(id: string, status: string): Promise<Report | undefined> {
    const [report] = await db
      .update(reports)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async getUserReportStats(userId: string): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    resolved: number;
  }> {
    const userReports = await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId));

    const stats = {
      total: userReports.length,
      pending: userReports.filter(r => r.status === 'pending').length,
      inProgress: userReports.filter(r => r.status === 'in_progress').length,
      resolved: userReports.filter(r => r.status === 'resolved').length,
    };

    return stats;
  }

  // Authority operations
  async getAllReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt));
  }

  async getAuthorityStats(): Promise<{
    totalReports: number;
    pendingReports: number;
    inProgressReports: number;
    resolvedReports: number;
  }> {
    const allReports = await db.select().from(reports);

    const stats = {
      totalReports: allReports.length,
      pendingReports: allReports.filter(r => r.status === 'pending').length,
      inProgressReports: allReports.filter(r => r.status === 'in_progress').length,
      resolvedReports: allReports.filter(r => r.status === 'resolved').length,
    };

    return stats;
  }
}

export const storage = new DatabaseStorage();
