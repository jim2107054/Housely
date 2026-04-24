import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { syncUser } from './auth.controller.js';

const router = Router();

// Called by mobile/admin after Clerk sign-in to upsert the user record in our DB
router.post('/sync', requireAuth(), syncUser);

export default router;
