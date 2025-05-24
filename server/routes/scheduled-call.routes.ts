
import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';

export function registerScheduledCallRoutes(router: Router, storage: any): void {
  router.get("/scheduled-calls", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.session.userId;
      const scheduledCalls = await storage.getScheduledCallsByUser(userId);
      
      res.status(200).json({ scheduledCalls });
    } catch (error) {
      console.error("Get user scheduled calls error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.post("/scheduled-calls", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
      const estimatedCost = (rate || 0) * duration;
      
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
        modelId: Number(modelId),
        scheduledTime: new Date(scheduledTime),
        duration,
        type,
        rate: Number(rate),
        status: "pending"
      });
      
      res.status(201).json({ scheduledCall });
    } catch (error) {
      console.error("Create scheduled call error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.put("/scheduled-calls/:callId", requireAuth, async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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
}
