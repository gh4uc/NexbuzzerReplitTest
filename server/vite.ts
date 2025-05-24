
import { createServer as createViteServer } from 'vite';
import { Server } from 'http';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import express from 'express';

function log(message: string): void {
  console.log(`[express] ${message}`);
}

export { log };

export async function setupVite(app: any, server: Server<typeof IncomingMessage, typeof ServerResponse>) {
  const vite = await createVite(server);
  app.use(vite.middlewares);
  log('Vite middleware set up');
}

export function serveStatic(app: any) {
  const projectRoot = path.resolve(process.cwd());
  const clientRoot = path.resolve(projectRoot, 'client');
  app.use(express.static(path.join(clientRoot, 'dist')));
  log('Static serving set up');
}

export async function createVite(server: Server<typeof IncomingMessage, typeof ServerResponse>) {
  // Determine root directory
  const projectRoot = path.resolve(process.cwd());
  const clientRoot = path.resolve(projectRoot, 'client');

  // Configure Vite
  const vite = await createViteServer({
    root: clientRoot,
    publicDir: path.resolve(projectRoot, 'public'),
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
      // Fix: Change boolean to string[] for allowedHosts
      allowedHosts: ['localhost']
    },
    logLevel: 'info',
    appType: 'spa',
    resolve: {
      alias: {
        '@': path.resolve(clientRoot, 'src'),
        '@shared': path.resolve(projectRoot, 'shared'),
      },
    },
  });

  return vite;
}
