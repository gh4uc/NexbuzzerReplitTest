
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { RequestHandler } from 'express';

// Handle WebSocket connections
export function setupWebSocketHandlers(wss: WebSocketServer, sessionMiddleware: RequestHandler) {
  wss.on('connection', (ws, req) => {
    // Parse session from the WebSocket request
    sessionMiddleware(req as any, {} as any, () => {
      const userId = (req as any).session?.userId;
      
      if (userId) {
        (ws as any).userId = userId;
        
        // Send online status
        ws.send(JSON.stringify({
          type: "CONNECTED",
          userId
        }));
      } else {
        // No authenticated user, close connection
        ws.close();
      }
    });
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const userId = (ws as any).userId;
        
        if (!userId) {
          ws.close();
          return;
        }
        
        // Handle different message types
        if (data.type === "PING") {
          ws.send(JSON.stringify({ type: "PONG" }));
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    });
  });
}

export { WebSocketServer };
