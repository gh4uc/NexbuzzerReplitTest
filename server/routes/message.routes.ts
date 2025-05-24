
import { Request, Response, Router } from 'express';
import { WebSocketServer } from 'ws';

export function registerMessageRoutes(router: Router, storage: any, wss: WebSocketServer): void {
  router.post("/messages", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
        receiverId: Number(receiverId),
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
  
  router.get("/messages/:userId", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
  
  router.put("/messages/:id/read", async (req: Request, res: Response) => {
    try {
      // Check if user is authenticated
      if (!req.session?.userId) {
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
}
