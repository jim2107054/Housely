import prisma from '../src/config/prisma.js';

prisma.$queryRaw`SELECT 1`
  .then(() => {
    console.log('✅ DB Connected!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ DB Error:', e.message);
    process.exit(1);
  });
