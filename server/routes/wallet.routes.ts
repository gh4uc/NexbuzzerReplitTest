
import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth';

export function registerWalletRoutes(router: Router, storage: any): void {
  router.get("/wallet", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
  
  router.post("/wallet/add-funds", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
  
  router.get("/wallet/transactions", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
}
