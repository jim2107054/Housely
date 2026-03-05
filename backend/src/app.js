import express from 'express';
import cors from 'cors';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import locationRoutes from './modules/location/location.routes.js';
import userRoutes from './modules/user/user.routes.js';
import houseRoutes from './modules/house/house.routes.js';
import filterRoutes from './modules/filter/filter.routes.js';

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// ─── Global middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// ─── App info ───
app.get('/api/app/about', (req, res) => {
  res.json({
    success: true,
    message: 'Success',
    app: {
      name: 'Housely',
      version: '1.0.0',
      description: 'House Rental Mobile Application',
      website: 'https://housely.app',
      support: 'support@housely.app',
    },
  });
});

// ─── Mount routes ───
app.use('/api/auth', authRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/filter', filterRoutes);

// ─── Error handler (must be last) ───
app.use(errorHandler);

export default app;
