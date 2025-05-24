import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function requireRole(role: "user" | "model" | "admin") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await req.app.locals.storage.getUser(req.session.userId);
      
      if (!user || user.role !== role) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

export function requireModelAccess(req: Request, res: Response, next: NextFunction) {
  const modelId = parseInt(req.params.modelId);
  
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Allow access if user is the model or an admin
  if (req.session.userId === modelId) {
    return next();
  }

  // Check if user is admin
  req.app.locals.storage.getUser(req.session.userId)
    .then(user => {
      if (user?.role === "admin") {
        next();
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    })
    .catch(error => {
      console.error("Model access check error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
}

export function requireUserAccess(req: Request, res: Response, next: NextFunction) {
  const userId = parseInt(req.params.userId);
  
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Allow access if user is accessing their own data or is an admin
  if (req.session.userId === userId) {
    return next();
  }

  // Check if user is admin
  req.app.locals.storage.getUser(req.session.userId)
    .then(user => {
      if (user?.role === "admin") {
        next();
      } else {
        res.status(403).json({ message: "Forbidden" });
      }
    })
    .catch(error => {
      console.error("User access check error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
} 