// BigInt serialization support (for Video.sizeInBytes)
BigInt.prototype.toJSON = function () { return this.toString(); };

import express from 'express';
import cors from 'cors';

// Swagger documentation
import { setupSwagger } from './config/swagger.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import locationRoutes from './modules/location/location.routes.js';
import userRoutes from './modules/user/user.routes.js';
import houseRoutes from './modules/house/house.routes.js';
import filterRoutes from './modules/filter/filter.routes.js';
import bookingRoutes from './modules/booking/booking.routes.js';
import reviewRoutes from './modules/review/review.routes.js';
import messageRoutes from './modules/message/message.routes.js';
import notificationRoutes from './modules/notification/notification.routes.js';
import videoRoutes from './modules/video/video.routes.js';

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';
import prisma from './config/prisma.js';
import { protect, requireRole } from './middlewares/auth.js';
import { success } from './utils/response.js';

const app = express();

// ─── Global middleware ───
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Swagger Documentation ───
setupSwagger(app);

// ─── Health check ───
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// ─── API health check (DB + Cloudinary) ───
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const cloudinaryOk = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    res.status(200).json({
      status: 'OK',
      db: 'connected',
      cloudinary: cloudinaryOk ? 'configured' : 'not_configured',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      db: 'disconnected',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
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
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/conversations', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/videos', videoRoutes);

// ─── Admin stats endpoint ───
app.get('/api/admin/stats', protect, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const startOfMonth = new Date(new Date().setDate(1));
    startOfMonth.setHours(0, 0, 0, 0);

    const [userCount, houseCount, videoCount, bookingCount] = await Promise.all([
      prisma.user.count(),
      prisma.house.count(),
      prisma.video.count(),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return success(res, { stats: { userCount, houseCount, videoCount, bookingCount } });
  } catch (err) {
    next(err);
  }
});

// ─── Error handler (must be last) ───
app.use(errorHandler);

export default app;
