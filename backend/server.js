import env from './src/config/env.js';
import http from 'http';
import app from './src/app.js';
import { initializeSocket } from './src/sockets/index.js';

const PORT = env.PORT;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in app for emitting events from routes
app.set('io', io);

if (env.NODE_ENV !== 'production') {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🔌 Socket.IO initialized`);
    console.log(`📋 Environment: ${env.NODE_ENV}`);
  });
}

// Export for Vercel serverless
export default app;
