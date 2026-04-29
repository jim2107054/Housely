import prisma from './src/config/prisma.js';

async function main() {
  try {
    const userId = "cuid-or-whatever";
    const result = await Promise.all([
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
      prisma.message.count({
        where: {
          conversation: {
            OR: [{ userId }, { agentId: userId }],
          },
          senderId: { not: userId },
          isRead: false,
        },
      }),
    ]);
    console.log(result);
  } catch (err) {
    console.error("Unread Count Error:", err);
  }
}

main().finally(() => prisma.$disconnect());
