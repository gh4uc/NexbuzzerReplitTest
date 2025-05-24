
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

// Required for Neon serverless
neonConfig.webSocketConstructor = ws;

// Use environment variable if available, otherwise use a mock connection for development
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talkstyle';

// Add error handling for WebSocket connection
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 5000 
});

// Handle connection errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit the process in development mode
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export const db = drizzle(pool, { schema });

// Simple function to check database connection
export async function checkDbConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    console.log('Using mock data in development mode');
    return false;
  }
}
