
import { Request, Response, NextFunction } from "express";

// Basic authentication check
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      message: "Authentication required",
      code: "AUTH_REQUIRED"
    });
  }
  next();
}

// Role-based authentication
export function requireRole(role: "user" | "model" | "admin") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    try {
      const user = await req.app.locals.storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(401).json({ 
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }
      
      if (user.role !== role) {
        return res.status(403).json({ 
          message: `Access denied. ${role} role required.`,
          code: "INVALID_ROLE"
        });
      }
      
      // Add user to request for convenient access in route handlers
      req.user = user;
      next();
    } catch (error: any) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
}

// Check if user has access to model data
export function requireModelAccess(req: Request, res: Response, next: NextFunction) {
  const modelId = parseInt(req.params.modelId);
  
  if (isNaN(modelId)) {
    return res.status(400).json({ message: "Invalid model ID" });
  }
  
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Allow access if user is the model
  if (req.session.userId === modelId) {
    return next();
  }

  // Check if user is admin
  req.app.locals.storage.getUser(req.session.userId)
    .then((user: any) => {
      if (user?.role === "admin") {
        req.user = user;
        next();
      } else {
        res.status(403).json({ 
          message: "You don't have permission to access this model's data",
          code: "MODEL_ACCESS_DENIED"
        });
      }
    })
    .catch((error: any) => {
      console.error("Model access check error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
}

// Check if user has access to user data
export function requireUserAccess(req: Request, res: Response, next: NextFunction) {
  const userId = parseInt(req.params.userId);
  
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Allow access if user is accessing their own data
  if (req.session.userId === userId) {
    return next();
  }

  // Check if user is admin
  req.app.locals.storage.getUser(req.session.userId)
    .then((user: any) => {
      if (user?.role === "admin") {
        req.user = user;
        next();
      } else {
        res.status(403).json({ 
          message: "You don't have permission to access this user's data",
          code: "USER_ACCESS_DENIED" 
        });
      }
    })
    .catch((error: any) => {
      console.error("User access check error:", error);
      res.status(500).json({ message: "Internal server error" });
    });
}

// Extends Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
