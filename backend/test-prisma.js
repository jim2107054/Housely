import prisma from './src/config/prisma.js';

async function main() {
  try {
    const locations = await prisma.house.groupBy({
      by: ['city'],
      where: { status: 'AVAILABLE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
    console.log(locations);
  } catch (err) {
    console.error("Top Locations Error:", err);
  }
}

main().finally(() => prisma.$disconnect());
