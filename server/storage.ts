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
  
  // New authority portal methods
  getEmployees(): Promise<User[]>;
  getReportStatsByCategory(): Promise<{
    drainage: number;
    pothole: number;
    wire: number;
    garbage: number;
    street_light: number;
  }>;
  getReportLocations(): Promise<{lat: number, lng: number, count: number}[]>;
  getEmployeePerformance(employeeId: string): Promise<{
    activeReports: number;
    resolvedReports: number;
    flaggedReports: number;
    averageRating: number;
    satisfactionRate: number;
  }>;
  assignReport(reportId: string, employeeId: string): Promise<Report | undefined>;
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

  // New authority portal methods implementation
  async getEmployees(): Promise<User[]> {
    const employees = await db.select().from(users).where(eq(users.userType, 'authority'));
    return employees;
  }

  async getReportStatsByCategory(): Promise<{
    drainage: number;
    pothole: number;
    wire: number;
    garbage: number;
    street_light: number;
  }> {
    const allReports = await db.select().from(reports);
    
    return {
      drainage: allReports.filter(r => r.category === 'drainage').length,
      pothole: allReports.filter(r => r.category === 'pothole').length,
      wire: allReports.filter(r => r.category === 'wire').length,
      garbage: allReports.filter(r => r.category === 'garbage').length,
      street_light: allReports.filter(r => r.category === 'street_light').length,
    };
  }

  async getReportLocations(): Promise<{lat: number, lng: number, count: number}[]> {
    const allReports = await db.select().from(reports);
    
    // Group by location and count
    const locationMap = new Map<string, {lat: number, lng: number, count: number}>();
    
    allReports.forEach(report => {
      const key = `${report.latitude},${report.longitude}`;
      if (locationMap.has(key)) {
        locationMap.get(key)!.count++;
      } else {
        locationMap.set(key, {
          lat: report.latitude,
          lng: report.longitude,
          count: 1
        });
      }
    });
    
    return Array.from(locationMap.values());
  }

  async getEmployeePerformance(employeeId: string): Promise<{
    activeReports: number;
    resolvedReports: number;
    flaggedReports: number;
    averageRating: number;
    satisfactionRate: number;
  }> {
    const assignedReports = await db.select().from(reports).where(eq(reports.assignedTo, employeeId));
    
    return {
      activeReports: assignedReports.filter(r => r.status === 'in_progress').length,
      resolvedReports: assignedReports.filter(r => r.status === 'resolved').length,
      flaggedReports: 0, // Placeholder - would query feedback table
      averageRating: 4.2, // Placeholder - would calculate from feedback
      satisfactionRate: 85.5, // Placeholder - would calculate from feedback
    };
  }

  async assignReport(reportId: string, employeeId: string): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({
        assignedTo: employeeId,
        assignedAt: new Date(),
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(reports.id, reportId))
      .returning();
    
    return updatedReport;
  }
}

export const storage = new DatabaseStorage();
