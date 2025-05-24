
import session from "express-session";
import MemoryStore from "memorystore";

export function createSessionMiddleware() {
  const MemoryStoreInstance = MemoryStore(session);
  
  // Get environment variables with defaults
  const isProduction = process.env.NODE_ENV === "production";
  const sessionSecret = process.env.SESSION_SECRET || "nexbuzzer-secret-key";
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  // Configuration for our session middleware
  const sessionMiddleware = session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreInstance({
      checkPeriod: 86400000 // Prune expired entries every 24h
    }),
    cookie: {
      maxAge: cookieMaxAge,
      httpOnly: true, // Prevents JavaScript from accessing the cookie
      secure: isProduction, // Set to true in production
      sameSite: isProduction ? "none" : "lax",
      domain: cookieDomain,
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
