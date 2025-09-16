import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertReportSchema, assignReportSchema, upsertUserSchema } from "@shared/schema";
import { chatWithGemini } from "./gemini";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for photo uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Reports routes
  app.post('/api/reports', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category, description, latitude, longitude, address } = req.body;

      // Validate required fields
      if (!category || !latitude || !longitude) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let photoUrl = null;
      if (req.file) {
        // Generate unique filename
        const ext = path.extname(req.file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`;
        const newPath = path.join('uploads', filename);
        
        // Move file to permanent location
        fs.renameSync(req.file.path, newPath);
        photoUrl = `/uploads/${filename}`;
      }

      const reportData = {
        userId,
        category: category as any,
        description: description || null,
        photoUrl,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || null,
      };

      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getUserReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/reports/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserReportStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const report = await storage.getReportById(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Authority routes
  app.get('/api/authority/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching authority reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.get('/api/authority/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const stats = await storage.getAuthorityStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching authority stats:", error);
      res.status(500).json({ message: "Failed to fetch authority stats" });
    }
  });

  // New authority portal routes
  app.get('/api/authority/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/authority/report-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const stats = await storage.getReportStatsByCategory();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching report statistics:", error);
      res.status(500).json({ message: "Failed to fetch report statistics" });
    }
  });

  app.get('/api/authority/report-locations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const locations = await storage.getReportLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching report locations:", error);
      res.status(500).json({ message: "Failed to fetch report locations" });
    }
  });

  app.get('/api/authority/my-performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const performance = await storage.getEmployeePerformance(userId);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching employee performance:", error);
      res.status(500).json({ message: "Failed to fetch employee performance" });
    }
  });

  app.post('/api/authority/assign-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      // Validate request body with Zod
      const validationResult = assignReportSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request data",
          errors: validationResult.error.issues
        });
      }

      const { reportId, employeeId } = validationResult.data;

      const updatedReport = await storage.assignReport(reportId, employeeId);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(updatedReport);
    } catch (error) {
      console.error("Error assigning report:", error);
      res.status(500).json({ message: "Failed to assign report" });
    }
  });

  // Employee CRUD routes
  app.post('/api/authority/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      // Validate request body with Zod
      const validationResult = upsertUserSchema.safeParse({
        ...req.body,
        userType: 'authority', // Ensure new employee is authority type
        id: undefined // Let database generate ID
      });
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid employee data",
          errors: validationResult.error.issues
        });
      }

      const employee = await storage.upsertUser(validationResult.data);
      res.json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/authority/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const employeeId = req.params.id;
      
      // Validate request body with Zod
      const validationResult = upsertUserSchema.safeParse({
        ...req.body,
        id: employeeId,
        userType: 'authority' // Ensure employee remains authority type
      });
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid employee data",
          errors: validationResult.error.issues
        });
      }

      const employee = await storage.upsertUser(validationResult.data);
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/authority/employees/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is actually an authority
      if (!user || user.userType !== 'authority') {
        return res.status(403).json({ message: "Forbidden: Authority access required" });
      }

      const employeeId = req.params.id;
      
      // Check if employee exists
      const employee = await storage.getUser(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // For safety, we'll deactivate instead of actual deletion
      const deactivatedEmployee = await storage.upsertUser({
        ...employee,
        isActive: false
      });
      
      res.json({ message: "Employee deactivated successfully", employee: deactivatedEmployee });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { message, language } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Validate language parameter - only accept supported languages
      const supportedLanguages = ['en', 'hi', 'pa'];
      const userLanguage = supportedLanguages.includes(language) ? language : 'en';
      
      const response = await chatWithGemini(message, userLanguage);
      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
