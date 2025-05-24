import { Request, Response, Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';

export function registerAdminRoutes(router: Router, storage: any): void {
  router.get("/admin/users", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    // Protected route - only admins can access
    res.status(200).json({ message: "Admin users endpoint" });
  });
  
  router.get("/admin/models", requireAuth, requireRole("admin"), async (req: Request, res: Response) => {
    // Protected route - only admins can access
    res.status(200).json({ message: "Admin models endpoint" });
  });
}
