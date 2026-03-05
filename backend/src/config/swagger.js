import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Housely API',
      version: '1.0.0',
      description: 'House Rental Mobile Application API',
      contact: {
        name: 'Housely Support',
        email: 'support@housely.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['USER', 'AGENT', 'ADMIN'] },
            isVerified: { type: 'boolean' },
          },
        },
        House: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['AVAILABLE', 'UNAVAILABLE'] },
            rentPerMonth: { type: 'number', nullable: true },
            salePrice: { type: 'number', nullable: true },
            listingType: { type: 'string', enum: ['RENT', 'SALE'] },
            propertyType: { type: 'string', enum: ['APARTMENT', 'PENTHOUSE', 'HOTEL', 'VILLA', 'STUDIO', 'DUPLEX', 'TOWNHOUSE', 'CONDO'] },
            address: { type: 'string' },
            city: { type: 'string' },
            area: { type: 'string', nullable: true },
            latitude: { type: 'number', nullable: true },
            longitude: { type: 'number', nullable: true },
            bedrooms: { type: 'integer' },
            bathrooms: { type: 'integer' },
            sizeInSqft: { type: 'number', nullable: true },
            hasWifi: { type: 'boolean' },
            hasWater: { type: 'boolean' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            houseId: { type: 'string' },
            agentId: { type: 'string' },
            checkIn: { type: 'string', format: 'date-time' },
            checkOut: { type: 'string', format: 'date-time' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
            paymentStatus: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            houseId: { type: 'string' },
            userId: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string', nullable: true },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
            error: { type: 'object', nullable: true },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile endpoints' },
      { name: 'Houses', description: 'House listing endpoints' },
      { name: 'Bookings', description: 'Booking management' },
      { name: 'Reviews', description: 'House reviews' },
      { name: 'Messages', description: 'Real-time messaging' },
      { name: 'Notifications', description: 'Push notifications' },
      { name: 'Location', description: 'Location services' },
    ],
  },
  apis: ['./src/config/swagger-paths.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Housely API Docs',
  }));
  
  // Serve raw JSON spec
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default swaggerSpec;
