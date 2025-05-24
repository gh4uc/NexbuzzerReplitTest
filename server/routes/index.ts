
import express, { Express, Router } from 'express';
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { createSessionMiddleware } from '../services/sessionService';
import { setupWebSocketHandlers, WebSocketServer as WSServer } from '../middleware/websocket';
import { log } from '../utils/logger';

// Import all route modules
import { registerAuthRoutes } from './auth.routes';
import { registerUserRoutes } from './user.routes';
import { registerModelRoutes } from './model.routes';
import { registerWalletRoutes } from './wallet.routes';
import { registerCallRoutes } from './call.routes';
import { registerScheduledCallRoutes } from './scheduled-call.routes';
import { registerMessageRoutes } from './message.routes';
import { registerFavoriteRoutes } from './favorite.routes';
import { registerAdminRoutes } from './admin.routes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' }) as WSServer;
  
  // Set up session middleware
  const sessionMiddleware = createSessionMiddleware();
  app.use(sessionMiddleware);
  
  // Set up WebSocket handlers
  setupWebSocketHandlers(wss, sessionMiddleware);
  
  // API routes - all prefixed with /api
  const apiRouter = express.Router();
  
  // Get storage from app locals
  const storage = app.locals.storage;
  
  // Register all route modules
  registerAuthRoutes(apiRouter, storage);
  registerUserRoutes(apiRouter, storage);
  registerModelRoutes(apiRouter, storage);
  registerWalletRoutes(apiRouter, storage);
  registerCallRoutes(apiRouter, storage);
  registerScheduledCallRoutes(apiRouter, storage);
  registerMessageRoutes(apiRouter, storage, wss);
  registerFavoriteRoutes(apiRouter, storage);
  registerAdminRoutes(apiRouter, storage);
  
  // Register the API router
  app.use("/api", apiRouter);
  
  log("Routes registered successfully");
  
  return httpServer;
}
