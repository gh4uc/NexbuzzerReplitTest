
import { Request, Response, Router } from 'express';
import { requireAuth, requireUserAccess } from '../middleware/auth';

export function registerUserRoutes(router: Router, storage: any): void {
  router.get("/users/:userId", requireAuth, requireUserAccess, async (req: Request, res: Response) => {
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
  
  router.put("/users/:userId", requireAuth, requireUserAccess, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is authorized to update this profile
      if (req.session?.userId !== userId) {
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
}
