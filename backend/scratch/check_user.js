import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'mdjahid205hasan@gmail.com' }
  });
  console.log(JSON.stringify(user, null, 2));
}

checkUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
