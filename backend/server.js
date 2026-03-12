import http from 'http';
import app from './src/app.js';
import env from './src/config/env.js';
import { initializeSocket } from './src/sockets/index.js';

const PORT = env.PORT;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io accessible in app for emitting events from routes
app.set('io', io);

if (env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO initialized`);
    console.log(`📋 Environment: ${env.NODE_ENV}`);
  });
}

// Export for Vercel serverless
export default app;
