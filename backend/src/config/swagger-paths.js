/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, name, password, confirmPassword]
 *             properties:
 *               username: { type: string, minLength: 3, example: johndoe }
 *               email: { type: string, format: email, example: john@email.com }
 *               name: { type: string, minLength: 2, example: John Doe }
 *               password: { type: string, minLength: 8, example: Password123! }
 *               confirmPassword: { type: string, example: Password123! }
 *     responses:
 *       201:
 *         description: User registered, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: johndoe }
 *               password: { type: string, example: Password123! }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         accessToken: { type: string }
 *                         refreshToken: { type: string }
 *                         user: { $ref: '#/components/schemas/User' }
 *
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string, minLength: 6, maxLength: 6 }
 *     responses:
 *       200:
 *         description: OTP verified
 *
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Reset OTP sent
 *
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp, password, confirmPassword]
 *             properties:
 *               email: { type: string, format: email }
 *               otp: { type: string }
 *               password: { type: string, minLength: 8 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 *
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New tokens generated
 *
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user (invalidate tokens)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/User' }
 *
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               bio: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 *
 * @swagger
 * /api/users/avatar:
 *   put:
 *     tags: [Users]
 *     summary: Update profile avatar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar updated
 *
 * @swagger
 * /api/users/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password changed
 *
 * @swagger
 * /api/users/favorites:
 *   get:
 *     tags: [Users]
 *     summary: Get user favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of favorite houses
 *
 * @swagger
 * /api/users/favorites/{houseId}:
 *   post:
 *     tags: [Users]
 *     summary: Add house to favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Added to favorites
 *   delete:
 *     tags: [Users]
 *     summary: Remove from favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Removed from favorites
 */

/**
 * @swagger
 * /api/houses:
 *   get:
 *     tags: [Houses]
 *     summary: Get all houses with filters
 *     parameters:
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: listingType
 *         schema: { type: string, enum: [RENT, SALE] }
 *       - in: query
 *         name: propertyType
 *         schema: { type: string, enum: [APARTMENT, PENTHOUSE, HOTEL, VILLA] }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: bedrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: bathrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of houses
 *   post:
 *     tags: [Houses]
 *     summary: Create new house listing (Agent only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, listingType, propertyType, address, city, bedrooms, bathrooms]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               listingType: { type: string, enum: [RENT, SALE] }
 *               propertyType: { type: string }
 *               address: { type: string }
 *               city: { type: string }
 *               rentPerMonth: { type: number }
 *               salePrice: { type: number }
 *               bedrooms: { type: integer }
 *               bathrooms: { type: integer }
 *               sizeInSqft: { type: number }
 *               hasWifi: { type: boolean }
 *               hasWater: { type: boolean }
 *     responses:
 *       201:
 *         description: House created
 *
 * @swagger
 * /api/houses/{id}:
 *   get:
 *     tags: [Houses]
 *     summary: Get house details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: House details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/House' }
 *   put:
 *     tags: [Houses]
 *     summary: Update house (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/House'
 *     responses:
 *       200:
 *         description: House updated
 *   delete:
 *     tags: [Houses]
 *     summary: Delete house (Owner only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: House deleted
 *
 * @swagger
 * /api/houses/{id}/images:
 *   post:
 *     tags: [Houses]
 *     summary: Upload house images
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get user bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of bookings
 *   post:
 *     tags: [Bookings]
 *     summary: Create new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [houseId, checkIn, checkOut]
 *             properties:
 *               houseId: { type: string }
 *               checkIn: { type: string, format: date-time }
 *               checkOut: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 *
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Booking' }
 *
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     tags: [Bookings]
 *     summary: Cancel booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 *
 * @swagger
 * /api/bookings/{id}/confirm:
 *   put:
 *     tags: [Bookings]
 *     summary: Confirm booking (Agent only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking confirmed
 *
 * @swagger
 * /api/bookings/agent:
 *   get:
 *     tags: [Bookings]
 *     summary: Get agent's bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Agent bookings list
 */

/**
 * @swagger
 * /api/reviews/house/{houseId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a house
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List of reviews with rating distribution
 *   post:
 *     tags: [Reviews]
 *     summary: Create review for a house
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: houseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Review created
 *
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 *
 * @swagger
 * /api/reviews/user:
 *   get:
 *     tags: [Reviews]
 *     summary: Get user's reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's reviews list
 */

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     tags: [Messages]
 *     summary: Get user conversations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of conversations
 *
 * @swagger
 * /api/messages/conversations/{userId}:
 *   post:
 *     tags: [Messages]
 *     summary: Start or get conversation with user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               houseId: { type: string, description: Optional house context }
 *     responses:
 *       200:
 *         description: Conversation details
 *
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages in conversation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: cursor
 *         schema: { type: string, description: Message ID for pagination }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: Messages list
 *
 * @swagger
 * /api/messages/{conversationId}/send:
 *   post:
 *     tags: [Messages]
 *     summary: Send message (REST fallback)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *               messageType: { type: string, enum: [TEXT, IMAGE, FILE], default: TEXT }
 *     responses:
 *       201:
 *         description: Message sent
 *
 * @swagger
 * /api/messages/{conversationId}/read:
 *   put:
 *     tags: [Messages]
 *     summary: Mark messages as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Messages marked as read
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [BOOKING, MESSAGE, REVIEW, SYSTEM, PROMO] }
 *       - in: query
 *         name: isRead
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Notifications list with unread count
 *
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 *
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All marked as read
 *
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Notification deleted
 *
 * @swagger
 * /api/notifications/device-token:
 *   post:
 *     tags: [Notifications]
 *     summary: Register device for push notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, platform]
 *             properties:
 *               token: { type: string }
 *               platform: { type: string, enum: [IOS, ANDROID, WEB] }
 *               deviceId: { type: string }
 *     responses:
 *       201:
 *         description: Device registered
 *
 * @swagger
 * /api/notifications/device-token:
 *   delete:
 *     tags: [Notifications]
 *     summary: Unregister device
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token: { type: string }
 *     responses:
 *       200:
 *         description: Device unregistered
 */

/**
 * @swagger
 * /api/location/cities:
 *   get:
 *     tags: [Location]
 *     summary: Get available cities
 *     responses:
 *       200:
 *         description: List of cities
 *
 * @swagger
 * /api/location/areas:
 *   get:
 *     tags: [Location]
 *     summary: Get areas in a city
 *     parameters:
 *       - in: query
 *         name: city
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of areas
 *
 * @swagger
 * /api/location/nearby:
 *   get:
 *     tags: [Location]
 *     summary: Get nearby houses
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 5, description: Radius in km }
 *     responses:
 *       200:
 *         description: Nearby houses
 */

/**
 * @swagger
 * /api/filter/search:
 *   get:
 *     tags: [Houses]
 *     summary: Advanced house search with filters
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string, description: Search query }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: area
 *         schema: { type: string }
 *       - in: query
 *         name: listingType
 *         schema: { type: string, enum: [RENT, SALE] }
 *       - in: query
 *         name: propertyType
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minBedrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: maxBedrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: minBathrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: hasWifi
 *         schema: { type: boolean }
 *       - in: query
 *         name: hasWater
 *         schema: { type: boolean }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [price_asc, price_desc, newest, rating] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Filtered houses list
 */

export default {};
