import prisma from '../../config/prisma.js';

// ─── Sync Clerk user into our database (upsert) ───────────────────────────────

export const syncUser = async (clerkUser, body = {}) => {
  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  const isVerified =
    clerkUser.emailAddresses?.[0]?.verification?.status === 'verified';

  // Use username from body (mobile sends it on first sign-up), fall back to
  // Clerk's own username, then derive one from the email local-part.
  const username =
    body.username ||
    clerkUser.username ||
    (email ? email.split('@')[0] : clerkId);

  const name =
    body.name ||
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
    null;

  const avatar = clerkUser.imageUrl ?? null;
  const role = body.role ?? 'USER';

  // Upsert: update if clerkId exists, create otherwise
  const user = await prisma.user.upsert({
    where: { clerkId },
    update: {
      email,
      name: name ?? undefined,
      avatar: avatar ?? undefined,
      isVerified,
    },
    create: {
      clerkId,
      email,
      username,
      name,
      avatar,
      isVerified,
      role,
    },
    select: {
      id: true,
      clerkId: true,
      username: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phoneNumber: true,
      isVerified: true,
    },
  });

  return user;
};
