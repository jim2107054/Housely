import app from './src/app.js';
import env from './src/config/env.js';

const PORT = env.PORT;

if (env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${env.NODE_ENV}`);
  });
}

// Export for Vercel serverless
export default app;
