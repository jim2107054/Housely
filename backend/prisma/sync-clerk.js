/**
 * One-time script: creates Clerk accounts for all existing seeded users
 * and writes the Clerk userId back into the Prisma User.clerkId field.
 *
 * Run from backend/ directory:
 *   node prisma/sync-clerk.js
 */

import { createClerkClient } from '@clerk/backend';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

// Passwords used by seed.js
const PASSWORDS = {
  'admin@housely.dev': 'admin123',
};
const DEFAULT_PASSWORD = 'password123';

async function syncUser(user) {
  if (user.clerkId) {
    console.log(`⏭  Skipping ${user.email} – already has clerkId`);
    return;
  }

  const password = PASSWORDS[user.email] ?? DEFAULT_PASSWORD;

  try {
    // Check if a Clerk user already exists for this email
    const existing = await clerkClient.users.getUserList({ emailAddress: [user.email] });
    let clerkUser = existing.data[0] ?? null;

    if (!clerkUser) {
      clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        password,
        firstName: user.name?.split(' ')[0] ?? user.username,
        lastName: user.name?.split(' ').slice(1).join(' ') || undefined,
        skipPasswordChecks: true,
      });
      console.log(`✅ Created Clerk user for ${user.email}`);
    } else {
      console.log(`🔗 Found existing Clerk user for ${user.email}`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { clerkId: clerkUser.id },
    });
    console.log(`   └─ Linked clerkId ${clerkUser.id} → DB user ${user.id}`);
  } catch (err) {
    console.error(`❌ Failed for ${user.email}:`, err.errors?.[0]?.message ?? err.message);
  }
}

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users in DB\n`);

  for (const user of users) {
    await syncUser(user);
  }

  console.log('\n🎉 Sync complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
