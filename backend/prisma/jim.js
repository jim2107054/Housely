/**
 * jim.js — Secondary seed: 4 showcase properties with full fields + videos
 * Run: node prisma/jim.js
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Agent who owns all 4 properties
const JIM_AGENT = {
  username: 'agent_jim',
  name: 'Jim Torres',
  email: 'jim.torres@housely.dev',
  phoneNumber: '+8801710009901',
  avatar: 'https://picsum.photos/seed/agent-jim/300/300',
  city: 'Dhaka',
  area: 'Banani',
};

// Sample video URLs (publicly accessible MP4s)
const VIDEO_URLS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

const PROPERTIES = [
  {
    name: 'Skyline Penthouse in Banani',
    description:
      'Breathtaking rooftop penthouse with panoramic views of Dhaka. Modern finishes, private terrace, and full smart-home integration.',
    listingType: 'RENT',
    propertyType: 'PENTHOUSE',
    rentPerMonth: 95000,
    salePrice: null,
    address: '14 Road-11, Banani',
    city: 'Dhaka',
    area: 'Banani',
    latitude: 23.7943,
    longitude: 90.4044,
    bedrooms: 4,
    bathrooms: 3,
    sizeInSqft: 3400,
    buildYear: 2022,
    hasWifi: true,
    hasWater: true,
    images: [
      'https://picsum.photos/seed/jim-p1-1/1200/800',
      'https://picsum.photos/seed/jim-p1-2/1200/800',
      'https://picsum.photos/seed/jim-p1-3/1200/800',
      'https://picsum.photos/seed/jim-p1-4/1200/800',
    ],
    facilities: {
      wifi: true,
      water: true,
      electricity: true,
      parking: true,
      mosqueDistance: 90,
      hospitalDistance: 320,
      shoppingMallDistance: 450,
      marketDistance: 150,
    },
    videoUrl: VIDEO_URLS[0],
  },
  {
    name: 'Garden Villa in Gulshan',
    description:
      'Elegant 5-bedroom villa surrounded by lush gardens. Separate servant quarters, swimming pool, and 24/7 security.',
    listingType: 'SALE',
    propertyType: 'VILLA',
    rentPerMonth: null,
    salePrice: 32000000,
    address: '7 Road-83, Gulshan-2',
    city: 'Dhaka',
    area: 'Gulshan',
    latitude: 23.7965,
    longitude: 90.4159,
    bedrooms: 5,
    bathrooms: 5,
    sizeInSqft: 5800,
    buildYear: 2019,
    hasWifi: true,
    hasWater: true,
    images: [
      'https://picsum.photos/seed/jim-p2-1/1200/800',
      'https://picsum.photos/seed/jim-p2-2/1200/800',
      'https://picsum.photos/seed/jim-p2-3/1200/800',
      'https://picsum.photos/seed/jim-p2-4/1200/800',
    ],
    facilities: {
      wifi: true,
      water: true,
      electricity: true,
      parking: true,
      mosqueDistance: 200,
      hospitalDistance: 600,
      shoppingMallDistance: 800,
      marketDistance: 300,
    },
    videoUrl: VIDEO_URLS[1],
  },
  {
    name: 'Modern Studio in Dhanmondi',
    description:
      'Fully furnished studio apartment ideal for students and young professionals. Walking distance to top universities and cafés.',
    listingType: 'RENT',
    propertyType: 'STUDIO',
    rentPerMonth: 22000,
    salePrice: null,
    address: '3 Road-5, Dhanmondi',
    city: 'Dhaka',
    area: 'Dhanmondi',
    latitude: 23.7462,
    longitude: 90.3762,
    bedrooms: 1,
    bathrooms: 1,
    sizeInSqft: 540,
    buildYear: 2021,
    hasWifi: true,
    hasWater: true,
    images: [
      'https://picsum.photos/seed/jim-p3-1/1200/800',
      'https://picsum.photos/seed/jim-p3-2/1200/800',
      'https://picsum.photos/seed/jim-p3-3/1200/800',
    ],
    facilities: {
      wifi: true,
      water: true,
      electricity: true,
      parking: false,
      mosqueDistance: 80,
      hospitalDistance: 400,
      shoppingMallDistance: 550,
      marketDistance: 120,
    },
    videoUrl: VIDEO_URLS[2],
  },
  {
    name: 'Heritage Townhouse in Old Dhaka',
    description:
      'Restored 3-story townhouse blending heritage architecture with contemporary comforts. Rooftop terrace and artisan courtyard.',
    listingType: 'RENT',
    propertyType: 'TOWNHOUSE',
    rentPerMonth: 48000,
    salePrice: null,
    address: '22 Shakhari Bazaar Lane',
    city: 'Dhaka',
    area: 'Old Dhaka',
    latitude: 23.7104,
    longitude: 90.4074,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 2100,
    buildYear: 2018,
    hasWifi: true,
    hasWater: true,
    images: [
      'https://picsum.photos/seed/jim-p4-1/1200/800',
      'https://picsum.photos/seed/jim-p4-2/1200/800',
      'https://picsum.photos/seed/jim-p4-3/1200/800',
      'https://picsum.photos/seed/jim-p4-4/1200/800',
    ],
    facilities: {
      wifi: true,
      water: true,
      electricity: true,
      parking: false,
      mosqueDistance: 60,
      hospitalDistance: 700,
      shoppingMallDistance: 1000,
      marketDistance: 80,
    },
    videoUrl: VIDEO_URLS[3],
  },
];

async function main() {
  console.log('🌱 Running jim.js seed...');

  const password = await bcrypt.hash('password123', 10);

  // ─── Upsert agent ───
  const agent = await prisma.user.upsert({
    where: { email: JIM_AGENT.email },
    update: {},
    create: {
      username: JIM_AGENT.username,
      email: JIM_AGENT.email,
      password,
      name: JIM_AGENT.name,
      phoneNumber: JIM_AGENT.phoneNumber,
      avatar: JIM_AGENT.avatar,
      role: 'AGENT',
      isVerified: true,
    },
  });

  // Ensure notification settings exist for agent
  await prisma.notificationSettings.upsert({
    where: { userId: agent.id },
    update: {},
    create: {
      userId: agent.id,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      bookingUpdates: true,
      promotions: false,
    },
  });

  console.log(`✅ Agent ready: ${agent.email} (ID: ${agent.id})`);

  // ─── Create 4 properties ───
  for (const [i, prop] of PROPERTIES.entries()) {
    const house = await prisma.house.create({
      data: {
        agentId: agent.id,
        name: prop.name,
        description: prop.description,
        status: 'AVAILABLE',
        listingType: prop.listingType,
        propertyType: prop.propertyType,
        rentPerMonth: prop.rentPerMonth,
        salePrice: prop.salePrice,
        address: prop.address,
        city: prop.city,
        area: prop.area,
        latitude: prop.latitude,
        longitude: prop.longitude,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        sizeInSqft: prop.sizeInSqft,
        buildYear: prop.buildYear,
        hasWifi: prop.hasWifi,
        hasWater: prop.hasWater,
        images: {
          create: prop.images.map((url, order) => ({ url, order })),
        },
        publicFacilities: {
          create: prop.facilities,
        },
        video: {
          create: { url: prop.videoUrl },
        },
      },
    });
    console.log(`  ✅ Property ${i + 1} created: "${house.name}" (ID: ${house.id})`);
  }

  console.log('\n🎉 jim.js seed complete!');
  console.log('   Agent login  → jim.torres@housely.dev / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
