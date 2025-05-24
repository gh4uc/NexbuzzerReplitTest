import session from "express-session";
import MemoryStore from "memorystore";

export function createSessionMiddleware() {
  const MemoryStoreInstance = MemoryStore(session);
  
  // Configuration for our session middleware
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "nexbuzzer-secret-key", // In production, use a proper secret from environment
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreInstance({
      checkPeriod: 86400000 // Prune expired entries every 24h
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      // Set domain for production if needed (e.g., ".replit.dev")
      ...(process.env.NODE_ENV === "production" ? { domain: ".replit.dev" } : {})
    }
  });
  
  return sessionMiddleware;
}

// Declare the session interface to include userId
declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}
