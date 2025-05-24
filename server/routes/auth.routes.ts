
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import { requireAuth } from '../middleware/auth';

export function registerAuthRoutes(router: Router, storage: any): void {
  router.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Create wallet for the user
      await storage.createWallet({ userId: user.id, balance: 0 });
      
      // Create model profile if user role is model
      if (user.role === "model") {
        await storage.createModelProfile({
          userId: user.id,
          bio: "",
          languages: [],
          categories: [],
          offerVoiceCalls: true,
          offerVideoCalls: true,
          isAvailable: false,
          payoutInfo: "",
          profileImages: []
        });
      }
      
      // Set user in session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(201).json({ 
        user: { id: user.id, username: user.username, role: user.role, email: user.email }
      });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In a real app, we'd use proper password hashing
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set user in session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.status(200).json({ 
        user: { id: user.id, username: user.username, role: user.role, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/auth/logout", requireAuth, (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get wallet balance
      const wallet = await storage.getWallet(userId);
      
      // Get model profile if user is a model
      let modelProfile = null;
      if (user.role === "model") {
        modelProfile = await storage.getModelProfile(userId);
      }
      
      res.status(200).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          age: user.age,
          city: user.city,
          country: user.country,
          profileImage: user.profileImage,
          walletBalance: wallet?.balance || 0,
          modelProfile
        }
      });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}
