import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const u = await prisma.user.updateMany({
    where: { email: 'skt104.shujon@gmail.com' },
    data: { clerkId: 'user_3Cog6S8oqFs4zBPOWgrbMX78c1x' }
  });
  console.log('Updated user rows:', u.count);
  const o = await prisma.user.updateMany({
    where: { email: 'shakoyatsujon@gmail.com' },
    data: { clerkId: 'user_3Cog6VSKT1YC8jgfmhdCCHEy42N' }
  });
  console.log('Updated owner rows:', o.count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
