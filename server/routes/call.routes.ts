
import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { generateTwilioToken } from '../services/twilioService';

export function registerCallRoutes(router: Router, storage: any): void {
  router.get("/calls", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const callSessions = await storage.getCallSessionsByUser(userId);
      
      res.status(200).json({ calls: callSessions });
    } catch (error) {
      console.error("Get user calls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/calls", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      
      if (rate && wallet.balance < rate) {
        return res.status(400).json({ message: "Insufficient funds. Please add more funds to your wallet." });
      }
      
      // Generate Twilio room and token
      const roomName = `nexbuzzer-${userId}-${modelId}-${Date.now()}`;
      const token = generateTwilioToken(userId.toString(), roomName);
      
      // Create call session
      const callSession = await storage.createCallSession({
        userId,
        modelId: Number(modelId),
        type,
        status: "active",
        startTime: new Date(),
        rate: Number(rate),
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
  
  router.put("/calls/:id/end", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
      const duration = Math.ceil((endTime.getTime() - (callSession.startTime?.getTime() || 0)) / 1000); // in seconds
      const durationInMinutes = Math.max(1, Math.ceil(duration / 60)); // Minimum 1 minute
      const totalCost = durationInMinutes * (callSession.rate || 0);
      
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
  
  router.get("/calls/model", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
}
