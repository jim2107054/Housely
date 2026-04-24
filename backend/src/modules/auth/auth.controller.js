import { getAuth, clerkClient } from '@clerk/express';
import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';

export const syncUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    const clerkUser = await clerkClient.users.getUser(userId);
    const user = await authService.syncUser(clerkUser, req.body);
    // Persist role into Clerk public metadata so it's available in session claims
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: user.role },
    });
    return success(res, { user }, 'User synced successfully');
  } catch (err) {
    next(err);
  }
};
