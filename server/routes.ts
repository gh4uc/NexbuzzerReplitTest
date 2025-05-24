import express, { Request, Response, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { z } from "zod";
import {
  insertUserSchema,
  insertWalletSchema,
  insertTransactionSchema,
  insertModelProfileSchema,
  insertCallSessionSchema,
  insertScheduledCallSchema,
  insertMessageSchema,
  insertFavoriteSchema
} from "@shared/schema";
import { generateTwilioToken } from "./services/twilioService";
import { createSessionMiddleware } from "./services/sessionService";
import { requireAuth, requireRole, requireModelAccess, requireUserAccess } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Set up session middleware
  const sessionMiddleware = createSessionMiddleware();
  app.use(sessionMiddleware);
  
  // API routes - all prefixed with /api
  const apiRouter = express.Router();
  
  // Auth routes
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
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
      req.session.userId = user.id;
      
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
  
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
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
      req.session.userId = user.id;
      
      res.status(200).json({ 
        user: { id: user.id, username: user.username, role: user.role, email: user.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/auth/logout", requireAuth, (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      
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
  
  // User routes
  apiRouter.get("/users/:userId", requireAuth, requireUserAccess, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          gender: user.gender,
          age: user.age,
          city: user.city,
          country: user.country,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/users/:userId", requireAuth, requireUserAccess, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is authorized to update this profile
      if (req.session.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updateData = req.body;
      
      // Don't allow changing username, email, or role through this endpoint
      delete updateData.username;
      delete updateData.email;
      delete updateData.role;
      delete updateData.password;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        user: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          role: updatedUser.role,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          gender: updatedUser.gender,
          age: updatedUser.age,
          city: updatedUser.city,
          country: updatedUser.country,
          profileImage: updatedUser.profileImage
        }
      });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Model routes
  apiRouter.get("/models", async (req: Request, res: Response) => {
    try {
      // Parse filters from query params
      const filters: any = {};
      
      if (req.query.available === "true") {
        filters.isAvailable = true;
      }
      
      if (req.query.voice === "true") {
        filters.offerVoiceCalls = true;
      }
      
      if (req.query.video === "true") {
        filters.offerVideoCalls = true;
      }
      
      if (req.query.languages) {
        filters.languages = (req.query.languages as string).split(",");
      }
      
      if (req.query.categories) {
        filters.categories = (req.query.categories as string).split(",");
      }
      
      const models = await storage.getAllModels(filters);
      
      // Transform data for client
      const modelData = models.map(({ user, ...profile }) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        city: user.city,
        country: user.country,
        profileImage: user.profileImage,
        bio: profile.bio,
        languages: profile.languages,
        categories: profile.categories,
        offerVoiceCalls: profile.offerVoiceCalls,
        offerVideoCalls: profile.offerVideoCalls,
        voiceRate: profile.voiceRate,
        videoRate: profile.videoRate,
        isAvailable: profile.isAvailable,
        profileImages: profile.profileImages
      }));
      
      // Check if models are in user's favorites if user is logged in
      if (req.session.userId) {
        const userId = req.session.userId;
        
        for (const model of modelData) {
          model.isFavorite = await storage.isFavorite(userId, model.id);
        }
      }
      
      res.status(200).json({ models: modelData });
    } catch (error) {
      console.error("Get models error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/models/:modelId", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }
      
      const user = await storage.getUser(modelId);
      
      if (!user || user.role !== "model") {
        return res.status(404).json({ message: "Model not found" });
      }
      
      const profile = await storage.getModelProfile(modelId);
      
      if (!profile) {
        return res.status(404).json({ message: "Model profile not found" });
      }
      
      // Check if model is in user's favorites if user is logged in
      let isFavorite = false;
      if (req.session.userId) {
        isFavorite = await storage.isFavorite(req.session.userId, modelId);
      }
      
      res.status(200).json({ 
        model: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          city: user.city,
          country: user.country,
          profileImage: user.profileImage,
          bio: profile.bio,
          languages: profile.languages,
          categories: profile.categories,
          offerVoiceCalls: profile.offerVoiceCalls,
          offerVideoCalls: profile.offerVideoCalls,
          voiceRate: profile.voiceRate,
          videoRate: profile.videoRate,
          isAvailable: profile.isAvailable,
          profileImages: profile.profileImages,
          isFavorite
        }
      });
    } catch (error) {
      console.error("Get model error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/models/:modelId", requireAuth, requireModelAccess, async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }
      
      // Check if user is authorized to update this profile
      if (req.session.userId !== modelId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(modelId);
      
      if (!user || user.role !== "model") {
        return res.status(404).json({ message: "Model not found" });
      }
      
      const updateData = req.body;
      
      // Don't allow changing userId or commissionRate
      delete updateData.userId;
      delete updateData.commissionRate;
      
      const updatedProfile = await storage.updateModelProfile(modelId, updateData);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Model profile not found" });
      }
      
      res.status(200).json({ profile: updatedProfile });
    } catch (error) {
      console.error("Update model profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Wallet routes
  apiRouter.get("/wallet", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const wallet = await storage.getWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.status(200).json({ wallet });
    } catch (error) {
      console.error("Get wallet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/wallet/add-funds", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const { amount } = req.body;
      
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Add funds to wallet
      const updatedWallet = await storage.updateWalletBalance(userId, amount);
      
      if (!updatedWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      // Record transaction
      await storage.createTransaction({
        userId,
        amount,
        type: "deposit",
        status: "completed",
        description: "Added funds to wallet"
      });
      
      res.status(200).json({ wallet: updatedWallet });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/wallet/transactions", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const transactions = await storage.getTransactions(userId);
      
      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Call session routes
  apiRouter.get("/calls", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const callSessions = await storage.getCallSessionsByUser(userId);
      
      res.status(200).json({ calls: callSessions });
    } catch (error) {
      console.error("Get user calls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/calls", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const { modelId, type } = req.body;
      
      if (!modelId || !type || (type !== "voice" && type !== "video")) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Check if model exists and is available
      const model = await storage.getUserWithProfile(modelId);
      
      if (!model || model.role !== "model" || !model.modelProfile) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      if (!model.modelProfile.isAvailable) {
        return res.status(400).json({ message: "Model is not available" });
      }
      
      // Check if model offers the requested call type
      if ((type === "voice" && !model.modelProfile.offerVoiceCalls) || 
          (type === "video" && !model.modelProfile.offerVideoCalls)) {
        return res.status(400).json({ message: `Model does not offer ${type} calls` });
      }
      
      // Check if user has enough funds (minimum 1 minute)
      const wallet = await storage.getWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const rate = type === "voice" ? model.modelProfile.voiceRate : model.modelProfile.videoRate;
      
      if (wallet.balance < rate) {
        return res.status(400).json({ message: "Insufficient funds. Please add more funds to your wallet." });
      }
      
      // Generate Twilio room and token
      const roomName = `nexbuzzer-${userId}-${modelId}-${Date.now()}`;
      const token = generateTwilioToken(userId.toString(), roomName);
      
      // Create call session
      const callSession = await storage.createCallSession({
        userId,
        modelId,
        type,
        status: "active",
        startTime: new Date(),
        rate,
        twilioRoomId: roomName,
        twilioRoomToken: token
      });
      
      res.status(201).json({ 
        call: {
          id: callSession.id,
          modelId,
          type,
          status: callSession.status,
          startTime: callSession.startTime,
          rate,
          twilioRoomId: callSession.twilioRoomId,
          twilioRoomToken: callSession.twilioRoomToken
        }
      });
    } catch (error) {
      console.error("Create call error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/calls/:id/end", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const callId = parseInt(req.params.id);
      
      if (isNaN(callId)) {
        return res.status(400).json({ message: "Invalid call ID" });
      }
      
      // Get call session
      const callSession = await storage.getCallSession(callId);
      
      if (!callSession) {
        return res.status(404).json({ message: "Call session not found" });
      }
      
      // Check if user is involved in the call
      if (callSession.userId !== userId && callSession.modelId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Check if call is active
      if (callSession.status !== "active") {
        return res.status(400).json({ message: "Call is not active" });
      }
      
      // Calculate duration and cost
      const endTime = new Date();
      const duration = Math.ceil((endTime.getTime() - callSession.startTime!.getTime()) / 1000); // in seconds
      const durationInMinutes = Math.max(1, Math.ceil(duration / 60)); // Minimum 1 minute
      const totalCost = durationInMinutes * callSession.rate;
      
      // Update call session
      const updatedCallSession = await storage.updateCallSession(callId, {
        status: "completed",
        endTime,
        duration,
        totalCost
      });
      
      // Deduct funds from user's wallet
      const wallet = await storage.getWallet(callSession.userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      await storage.updateWalletBalance(callSession.userId, -totalCost);
      
      // Record transaction for user
      await storage.createTransaction({
        userId: callSession.userId,
        amount: -totalCost,
        type: "call_charge",
        status: "completed",
        description: `Payment for ${durationInMinutes} minute ${callSession.type} call with model #${callSession.modelId}`,
        relatedEntityId: callId
      });
      
      // Add commission to model's wallet (75%)
      const commissionRate = 0.75;
      const modelCommission = totalCost * commissionRate;
      
      await storage.updateWalletBalance(callSession.modelId, modelCommission);
      
      // Record transaction for model
      await storage.createTransaction({
        userId: callSession.modelId,
        amount: modelCommission,
        type: "call_revenue",
        status: "completed",
        description: `Commission for ${durationInMinutes} minute ${callSession.type} call with user #${callSession.userId}`,
        relatedEntityId: callId
      });
      
      res.status(200).json({ 
        call: {
          id: updatedCallSession!.id,
          status: updatedCallSession!.status,
          startTime: updatedCallSession!.startTime,
          endTime: updatedCallSession!.endTime,
          duration: updatedCallSession!.duration,
          totalCost: updatedCallSession!.totalCost
        }
      });
    } catch (error) {
      console.error("End call error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/calls/model", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const modelId = req.session.userId;
      const user = await storage.getUser(modelId);
      
      if (!user || user.role !== "model") {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const callSessions = await storage.getCallSessionsByModel(modelId);
      
      res.status(200).json({ calls: callSessions });
    } catch (error) {
      console.error("Get model calls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Scheduled call routes
  apiRouter.get("/scheduled-calls", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const scheduledCalls = await storage.getScheduledCallsByUser(userId);
      
      res.status(200).json({ scheduledCalls });
    } catch (error) {
      console.error("Get user scheduled calls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/scheduled-calls", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const { modelId, scheduledTime, duration, type } = req.body;
      
      if (!modelId || !scheduledTime || !duration || !type) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Validate duration (minimum 5 minutes)
      if (duration < 5) {
        return res.status(400).json({ message: "Minimum call duration is 5 minutes" });
      }
      
      // Check if model exists
      const model = await storage.getUserWithProfile(modelId);
      
      if (!model || model.role !== "model" || !model.modelProfile) {
        return res.status(404).json({ message: "Model not found" });
      }
      
      // Check if model offers the requested call type
      if ((type === "voice" && !model.modelProfile.offerVoiceCalls) || 
          (type === "video" && !model.modelProfile.offerVideoCalls)) {
        return res.status(400).json({ message: `Model does not offer ${type} calls` });
      }
      
      // Check if user has enough funds
      const wallet = await storage.getWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      const rate = type === "voice" ? model.modelProfile.voiceRate : model.modelProfile.videoRate;
      const estimatedCost = rate * duration;
      
      if (wallet.balance < estimatedCost) {
        return res.status(400).json({ 
          message: "Insufficient funds. Please add more funds to your wallet.",
          requiredAmount: estimatedCost,
          currentBalance: wallet.balance
        });
      }
      
      // Create scheduled call
      const scheduledCall = await storage.createScheduledCall({
        userId,
        modelId,
        scheduledTime: new Date(scheduledTime),
        duration,
        type,
        rate,
        status: "pending"
      });
      
      res.status(201).json({ scheduledCall });
    } catch (error) {
      console.error("Create scheduled call error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/scheduled-calls/:callId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const callId = parseInt(req.params.callId);
      const { status } = req.body;
      
      if (isNaN(callId)) {
        return res.status(400).json({ message: "Invalid call ID" });
      }
      
      if (!status || !["confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get scheduled call
      const scheduledCall = await storage.getScheduledCall(callId);
      
      if (!scheduledCall) {
        return res.status(404).json({ message: "Scheduled call not found" });
      }
      
      // Check if user is involved in the call
      if (scheduledCall.userId !== userId && scheduledCall.modelId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Update scheduled call
      const updatedCall = await storage.updateScheduledCall(callId, { status });
      
      res.status(200).json({ scheduledCall: updatedCall });
    } catch (error) {
      console.error("Update scheduled call status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Message routes
  apiRouter.post("/messages", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const senderId = req.session.userId;
      const { receiverId, content } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      // Check if receiver exists
      const receiver = await storage.getUser(receiverId);
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Create message
      const message = await storage.createMessage({
        senderId,
        receiverId,
        content,
        isRead: false
      });
      
      // Notify receiver via WebSocket if connected
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && (client as any).userId === receiverId) {
          client.send(JSON.stringify({
            type: "NEW_MESSAGE",
            message
          }));
        }
      });
      
      res.status(201).json({ message });
    } catch (error) {
      console.error("Create message error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.get("/messages/:userId", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const currentUserId = req.session.userId;
      const otherUserId = parseInt(req.params.userId);
      
      if (isNaN(otherUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messages = await storage.getMessages(currentUserId, otherUserId);
      
      res.status(200).json({ messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.put("/messages/:id/read", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const messageId = parseInt(req.params.id);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      // Mark message as read
      const updatedMessage = await storage.markMessageAsRead(messageId);
      
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if user is the receiver
      if (updatedMessage.receiverId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.status(200).json({ message: updatedMessage });
    } catch (error) {
      console.error("Mark message as read error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Favorite routes
  apiRouter.get("/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const favorites = await storage.getFavorites(userId);
      
      // Transform data for client
      const favoriteModels = favorites.map(({ model }) => ({
        id: model.id,
        username: model.username,
        firstName: model.firstName,
        lastName: model.lastName,
        age: model.age,
        city: model.city,
        country: model.country,
        profileImage: model.profileImage,
        bio: model.modelProfile.bio,
        languages: model.modelProfile.languages,
        categories: model.modelProfile.categories,
        offerVoiceCalls: model.modelProfile.offerVoiceCalls,
        offerVideoCalls: model.modelProfile.offerVideoCalls,
        voiceRate: model.modelProfile.voiceRate,
        videoRate: model.modelProfile.videoRate,
        isAvailable: model.modelProfile.isAvailable,
        profileImages: model.modelProfile.profileImages,
        isFavorite: true
      }));
      
      res.status(200).json({ favorites: favoriteModels });
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/favorites", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const { modelId } = req.body;
      
      if (!modelId) {
        return res.status(400).json({ message: "Model ID is required" });
      }
      
      // Check if model exists
      const model = await storage.getUser(modelId);
      
      if (!model || model.role !== "model") {
        return res.status(404).json({ message: "Model not found" });
      }
      
      // Check if already favorited
      const isAlreadyFavorite = await storage.isFavorite(userId, modelId);
      
      if (isAlreadyFavorite) {
        return res.status(400).json({ message: "Model already in favorites" });
      }
      
      // Create favorite
      const favorite = await storage.createFavorite({ userId, modelId });
      
      res.status(201).json({ favorite });
    } catch (error) {
      console.error("Create favorite error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/favorites/:modelId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      const modelId = parseInt(req.params.modelId);
      
      if (isNaN(modelId)) {
        return res.status(400).json({ message: "Invalid model ID" });
      }
      
      // Remove from favorites
      const success = await storage.deleteFavorite(userId, modelId);
      
      if (!success) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.status(200).json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Delete favorite error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin routes
  apiRouter.get("/admin/users", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    // Protected route - only admins can access
    // ... existing code ...
  });
  
  apiRouter.get("/admin/models", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    // Protected route - only admins can access
    // ... existing code ...
  });
  
  // WebSocket connection handling
  wss.on('connection', (ws, req) => {
    // Parse session from the WebSocket request
    sessionMiddleware(req as any, {} as any, () => {
      const userId = (req as any).session?.userId;
      
      if (userId) {
        (ws as any).userId = userId;
        
        // Send online status
        ws.send(JSON.stringify({
          type: "CONNECTED",
          userId
        }));
      } else {
        // No authenticated user, close connection
        ws.close();
      }
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const userId = (ws as any).userId;
        
        if (!userId) {
          ws.close();
          return;
        }
        
        // Handle different message types
        if (data.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG" }));
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });
  });
  
  // Register the API router
  app.use("/api", apiRouter);
  
  return httpServer;
}
