import prisma from '../../config/prisma.js';
import { success } from '../../utils/response.js';

// ═══════════════════════════════════════════════════════════
// ─── STATISTICS & ANALYTICS ─────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalAgents,
      totalHouses,
      availableHouses,
      totalBookings,
      bookingStatusCounts,
      totalRevenue,
      thisMonthRevenue,
      totalReviews,
      avgRating,
      totalMessages,
      totalConversations,
    ] = await Promise.all([
      // Total counts
      prisma.user.count(),
      prisma.user.count({ where: { role: 'AGENT' } }),
      prisma.house.count(),
      prisma.house.count({ where: { status: 'AVAILABLE' } }),
      prisma.booking.count(),

      // Booking status breakdown
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Revenue calculations
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // This month revenue
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),

      // Reviews
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),

      // Messages
      prisma.message.count(),
      prisma.conversation.count(),
    ]);

    // Parse booking status counts
    const statusMap = bookingStatusCounts.reduce((acc, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    return success(res, {
      totalUsers,
      totalAgents,
      totalHouses,
      availableHouses,
      totalBookings,
      pendingBookings: statusMap.PENDING || 0,
      confirmedBookings: statusMap.CONFIRMED || 0,
      completedBookings: statusMap.COMPLETED || 0,
      cancelledBookings: statusMap.CANCELLED || 0,
      totalRevenue: totalRevenue._sum.amount || 0,
      thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
      totalReviews,
      avgRating: avgRating._avg.rating || 0,
      totalMessages,
      totalConversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      dbStatus,
      newUsersThisWeek,
      newHousesThisWeek,
      newBookingsThisWeek,
      pendingBookings,
      unreadNotifications,
    ] = await Promise.all([
      // Database connectivity check
      prisma.$queryRaw`SELECT 1`
        .then(() => 'connected')
        .catch(() => 'error'),

      // Weekly metrics
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.house.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.booking.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.notification.count({ where: { isRead: false } }),
    ]);

    return success(res, {
      database: dbStatus,
      newUsersThisWeek,
      newHousesThisWeek,
      newBookingsThisWeek,
      pendingBookings,
      unreadNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query;

    let revenueData = [];
    const now = new Date();

    if (period === 'daily') {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const result = await prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
          _sum: { amount: true },
        });

        revenueData.push({
          date: startOfDay.toISOString().split('T')[0],
          revenue: result._sum.amount || 0,
        });
      }
    } else if (period === 'monthly') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

        const result = await prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

        revenueData.push({
          date: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
          revenue: result._sum.amount || 0,
        });
      }
    } else if (period === 'yearly') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

        const result = await prisma.payment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfYear, lte: endOfYear },
          },
          _sum: { amount: true },
        });

        revenueData.push({
          date: String(year),
          revenue: result._sum.amount || 0,
        });
      }
    }

    return success(res, { data: revenueData });
  } catch (error) {
    next(error);
  }
};

export const getTopAgents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        email: true,
        _count: {
          select: {
            houses: true,
            agentBookings: true,
          },
        },
      },
      take: 100, // Get more to calculate revenue
    });

    // Calculate revenue and avg rating for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const [revenueResult, reviewsResult] = await Promise.all([
          prisma.payment.aggregate({
            where: {
              status: 'COMPLETED',
              booking: { agentId: agent.id },
            },
            _sum: { amount: true },
          }),
          prisma.review.aggregate({
            where: {
              house: { agentId: agent.id },
            },
            _avg: { rating: true },
          }),
        ]);

        return {
          id: agent.id,
          username: agent.username,
          name: agent.name,
          avatar: agent.avatar,
          email: agent.email,
          housesCount: agent._count.houses,
          bookingsCount: agent._count.agentBookings,
          totalRevenue: revenueResult._sum.amount || 0,
          avgRating: reviewsResult._avg.rating || 0,
        };
      })
    );

    // Sort by totalRevenue and take top N
    const topAgents = agentsWithStats
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return success(res, { agents: topAgents });
  } catch (error) {
    next(error);
  }
};

export const getTopProperties = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const houses = await prisma.house.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        listingType: true,
        propertyType: true,
        rentPerMonth: true,
        salePrice: true,
        status: true,
        agent: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        _count: {
          select: {
            views: true,
            bookings: true,
            favorites: true,
          },
        },
      },
      take: 100, // Get more to calculate avg rating
    });

    // Calculate avg rating for each property
    const housesWithStats = await Promise.all(
      houses.map(async (house) => {
        const reviewsResult = await prisma.review.aggregate({
          where: { houseId: house.id },
          _avg: { rating: true },
        });

        return {
          id: house.id,
          name: house.name,
          city: house.city,
          listingType: house.listingType,
          propertyType: house.propertyType,
          rentPerMonth: house.rentPerMonth,
          salePrice: house.salePrice,
          status: house.status,
          agent: house.agent,
          viewCount: house._count.views,
          bookingCount: house._count.bookings,
          favoriteCount: house._count.favorites,
          avgRating: reviewsResult._avg.rating || 0,
        };
      })
    );

    // Sort by viewCount and take top N
    const topProperties = housesWithStats
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);

    return success(res, { properties: topProperties });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── USER MANAGEMENT ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isVerified,
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (role) where.role = role;
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          isVerified: true,
          phoneNumber: true,
          bio: true,
          dateOfBirth: true,
          createdAt: true,
          _count: {
            select: {
              houses: true,
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isVerified: true,
        phoneNumber: true,
        bio: true,
        dateOfBirth: true,
        createdAt: true,
        _count: {
          select: {
            houses: true,
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return success(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'AGENT', 'ADMIN'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return success(res, { user }, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { isVerified: true },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: !currentUser.isVerified },
      select: { id: true, username: true, isVerified: true },
    });

    return success(res, { user }, 'Verification status updated');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    return success(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── HOUSE MANAGEMENT ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getHouses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      listingType,
      city,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (listingType) where.listingType = listingType;
    if (city) where.city = { contains: city, mode: 'insensitive' };

    const [houses, total] = await Promise.all([
      prisma.house.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          city: true,
          area: true,
          address: true,
          status: true,
          listingType: true,
          propertyType: true,
          rentPerMonth: true,
          salePrice: true,
          bedrooms: true,
          bathrooms: true,
          sizeInSqft: true,
          buildYear: true,
          hasWifi: true,
          hasWater: true,
          createdAt: true,
          agent: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          images: {
            select: {
              url: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
              views: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.house.count({ where }),
    ]);

    return success(res, {
      houses,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateHouseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['AVAILABLE', 'UNAVAILABLE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const house = await prisma.house.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true },
    });

    return success(res, { house }, 'House status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteHouse = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.house.delete({ where: { id } });

    return success(res, null, 'House deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── BOOKING MANAGEMENT ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = status ? { status } : {};

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          notes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
          agent: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          house: {
            select: {
              id: true,
              name: true,
              city: true,
              images: {
                select: { url: true },
                take: 1,
                orderBy: { order: 'asc' },
              },
              agent: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              transactionId: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return success(res, {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return success(res, { booking }, 'Booking status updated successfully');
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── PAYMENT MANAGEMENT ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          amount: true,
          currency: true,
          method: true,
          transactionId: true,
          status: true,
          description: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
          booking: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                  email: true,
                },
              },
              house: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return success(res, {
      payments,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── REVIEW MANAGEMENT ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getReviews = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      minRating,
      maxRating,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (minRating && maxRating) {
      where.rating = {
        gte: parseInt(minRating),
        lte: parseInt(maxRating),
      };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
            },
          },
          house: {
            select: {
              id: true,
              name: true,
              city: true,
              agent: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          media: {
            select: {
              id: true,
              url: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return success(res, {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.review.delete({ where: { id } });

    return success(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════════════════
// ─── NOTIFICATION MANAGEMENT ────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const sendNotifications = async (req, res, next) => {
  try {
    const { title, message, type = 'GENERAL', userIds } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    let targetUserIds = userIds;

    // If "ALL" is in userIds, get all user IDs
    if (userIds.includes('ALL')) {
      const users = await prisma.user.findMany({ select: { id: true } });
      targetUserIds = users.map((u) => u.id);
    }

    // Create notifications for each user
    const notifications = targetUserIds.map((userId) => ({
      userId,
      type,
      title,
      message,
    }));

    await prisma.notification.createMany({ data: notifications });

    return success(
      res,
      { count: notifications.length },
      'Notifications sent successfully'
    );
  } catch (error) {
    next(error);
  }
};
