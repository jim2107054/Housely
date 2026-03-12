import request from 'supertest';
import app from '../src/app.js';

describe('Health & App API', () => {
  describe('GET /health', () => {
    it('should return health status OK', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/app/about', () => {
    it('should return app info', async () => {
      const res = await request(app).get('/api/app/about');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.app).toHaveProperty('name', 'Housely');
      expect(res.body.app).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/docs', () => {
    it('should return swagger documentation', async () => {
      const res = await request(app).get('/api/docs/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('swagger');
    });
  });

  describe('GET /api/docs.json', () => {
    it('should return swagger spec JSON', async () => {
      const res = await request(app).get('/api/docs.json');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi', '3.0.0');
      expect(res.body.info).toHaveProperty('title', 'Housely API');
    });
  });
});

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'test',
          email: 'invalid-email',
          name: 'Test User',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        });
      expect(res.status).toBe(400);
    });

    it('should validate password match', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          confirmPassword: 'DifferentPass!',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'WrongPass123!',
        });
      expect([400, 401, 404]).toContain(res.status);
    });
  });
});

describe('Houses API', () => {
  describe('GET /api/houses', () => {
    it('should return paginated houses', async () => {
      const res = await request(app).get('/api/houses');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('data');
    });

    it('should accept pagination params', async () => {
      const res = await request(app)
        .get('/api/houses')
        .query({ page: 1, limit: 5 });
      expect(res.status).toBe(200);
    });

    it('should filter by city', async () => {
      const res = await request(app)
        .get('/api/houses')
        .query({ city: 'Dhaka' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/houses/:id', () => {
    it('should return 404 for non-existent house', async () => {
      const res = await request(app)
        .get('/api/houses/non-existent-id-12345');
      expect([400, 404]).toContain(res.status);
    });
  });
});

describe('Protected Routes', () => {
  it('should reject unauthenticated requests to /api/users/me', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('should reject unauthenticated requests to /api/bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('should reject unauthenticated requests to /api/messages/conversations', async () => {
    const res = await request(app).get('/api/messages/conversations');
    expect(res.status).toBe(401);
  });

  it('should reject unauthenticated requests to /api/notifications', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });
});

describe('Filter API', () => {
  describe('GET /api/filter/search', () => {
    it('should search houses by query', async () => {
      const res = await request(app)
        .get('/api/filter/search')
        .query({ q: 'apartment' });
      expect(res.status).toBe(200);
    });

    it('should filter by property type', async () => {
      const res = await request(app)
        .get('/api/filter/search')
        .query({ propertyType: 'APARTMENT' });
      expect(res.status).toBe(200);
    });

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/filter/search')
        .query({ minPrice: 10000, maxPrice: 50000 });
      expect(res.status).toBe(200);
    });
  });
});

describe('Location API', () => {
  describe('GET /api/location/cities', () => {
    it('should return available cities', async () => {
      const res = await request(app).get('/api/location/cities');
      expect(res.status).toBe(200);
    });
  });
});

describe('Review API', () => {
  describe('GET /api/reviews/house/:houseId', () => {
    it('should return 404 for non-existent house', async () => {
      const res = await request(app)
        .get('/api/reviews/house/non-existent-id');
      expect([400, 404]).toContain(res.status);
    });
  });
});
