import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  // ─── Create Users ───
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@test.com',
      password,
      name: 'Test User',
      phoneNumber: '+8801700000001',
      isVerified: true,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: 'agent@test.com' },
    update: {},
    create: {
      username: 'testagent',
      email: 'agent@test.com',
      password,
      name: 'Test Agent',
      phoneNumber: '+8801700000002',
      role: 'AGENT',
      isVerified: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@test.com',
      password,
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log(`  ✅ Users: ${user.username}, ${agent.username}, ${admin.username}`);

  // ─── Create Houses ───
  const housesData = [
    {
      name: 'Modern Apartment in Gulshan',
      description: 'A beautiful modern apartment with panoramic city views. Fully furnished with premium finishes.',
      listingType: 'RENT',
      propertyType: 'APARTMENT',
      rentPerMonth: 35000,
      address: 'Road 103, Gulshan-2',
      city: 'Dhaka',
      area: 'Gulshan',
      latitude: 23.7925,
      longitude: 90.4078,
      bedrooms: 3,
      bathrooms: 2,
      sizeInSqft: 1800,
      buildYear: 2020,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Luxury Villa in Baridhara',
      description: 'Spacious luxury villa with garden, garage, and rooftop terrace.',
      listingType: 'SALE',
      propertyType: 'VILLA',
      salePrice: 25000000,
      address: 'Road 5, Baridhara',
      city: 'Dhaka',
      area: 'Baridhara',
      latitude: 23.7980,
      longitude: 90.4165,
      bedrooms: 5,
      bathrooms: 4,
      sizeInSqft: 4500,
      buildYear: 2018,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Studio Flat in Dhanmondi',
      description: 'Compact studio flat ideal for students. Close to universities.',
      listingType: 'RENT',
      propertyType: 'STUDIO',
      rentPerMonth: 12000,
      address: 'Road 27, Dhanmondi',
      city: 'Dhaka',
      area: 'Dhanmondi',
      latitude: 23.7461,
      longitude: 90.3742,
      bedrooms: 1,
      bathrooms: 1,
      sizeInSqft: 500,
      buildYear: 2015,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Penthouse in Banani',
      description: 'Stunning penthouse with 360-degree views. Private elevator access.',
      listingType: 'RENT',
      propertyType: 'PENTHOUSE',
      rentPerMonth: 85000,
      address: 'Road 11, Banani',
      city: 'Dhaka',
      area: 'Banani',
      latitude: 23.7937,
      longitude: 90.4016,
      bedrooms: 4,
      bathrooms: 3,
      sizeInSqft: 3200,
      buildYear: 2022,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Duplex in Uttara',
      description: 'Family-friendly duplex with large balcony and parking.',
      listingType: 'RENT',
      propertyType: 'DUPLEX',
      rentPerMonth: 28000,
      address: 'Sector 7, Uttara',
      city: 'Dhaka',
      area: 'Uttara',
      latitude: 23.8759,
      longitude: 90.3795,
      bedrooms: 3,
      bathrooms: 2,
      sizeInSqft: 2200,
      buildYear: 2019,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Cozy Apartment in Mirpur',
      description: 'Affordable apartment in a quiet neighborhood. Great for small families.',
      listingType: 'RENT',
      propertyType: 'APARTMENT',
      rentPerMonth: 15000,
      address: 'Section 10, Mirpur',
      city: 'Dhaka',
      area: 'Mirpur',
      latitude: 23.8069,
      longitude: 90.3687,
      bedrooms: 2,
      bathrooms: 1,
      sizeInSqft: 900,
      buildYear: 2016,
      hasWifi: false,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Townhouse in Bashundhara',
      description: 'Modern townhouse in gated community with playground and gym.',
      listingType: 'SALE',
      propertyType: 'TOWNHOUSE',
      salePrice: 15000000,
      address: 'Block F, Bashundhara R/A',
      city: 'Dhaka',
      area: 'Bashundhara',
      latitude: 23.8150,
      longitude: 90.4250,
      bedrooms: 4,
      bathrooms: 3,
      sizeInSqft: 2800,
      buildYear: 2021,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Hotel Suite Downtown',
      description: 'Premium hotel-style suite in the heart of Motijheel business district.',
      listingType: 'RENT',
      propertyType: 'HOTEL',
      rentPerMonth: 50000,
      address: 'Dilkusha C/A, Motijheel',
      city: 'Dhaka',
      area: 'Motijheel',
      latitude: 23.7275,
      longitude: 90.4194,
      bedrooms: 2,
      bathrooms: 2,
      sizeInSqft: 1200,
      buildYear: 2023,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Waterfront Condo in Chittagong',
      description: 'Beautiful condo with sea views near Patenga beach.',
      listingType: 'SALE',
      propertyType: 'CONDO',
      salePrice: 8000000,
      address: 'Agrabad, Chittagong',
      city: 'Chittagong',
      area: 'Agrabad',
      latitude: 22.3269,
      longitude: 91.8053,
      bedrooms: 3,
      bathrooms: 2,
      sizeInSqft: 1600,
      buildYear: 2020,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
    {
      name: 'Budget Apartment in Sylhet',
      description: 'Affordable apartment with mountain views near Shahjalal University.',
      listingType: 'RENT',
      propertyType: 'APARTMENT',
      rentPerMonth: 8000,
      address: 'Zindabazar, Sylhet',
      city: 'Sylhet',
      area: 'Zindabazar',
      latitude: 24.8998,
      longitude: 91.8700,
      bedrooms: 2,
      bathrooms: 1,
      sizeInSqft: 750,
      buildYear: 2017,
      hasWifi: true,
      hasWater: true,
      agentId: agent.id,
    },
  ];

  for (const houseData of housesData) {
    const existing = await prisma.house.findFirst({
      where: { name: houseData.name, agentId: agent.id },
    });

    if (!existing) {
      const house = await prisma.house.create({
        data: {
          ...houseData,
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${houseData.name.replace(/\s/g, '')}/800/600`,
                order: 0,
              },
              {
                url: `https://picsum.photos/seed/${houseData.name.replace(/\s/g, '')}2/800/600`,
                order: 1,
              },
            ],
          },
          publicFacilities: {
            create: {
              mosqueDistance: Math.round(Math.random() * 2000 + 100),
              hospitalDistance: Math.round(Math.random() * 5000 + 200),
              shoppingMallDistance: Math.round(Math.random() * 3000 + 300),
              marketDistance: Math.round(Math.random() * 1500 + 100),
            },
          },
        },
      });
      console.log(`  ✅ House: ${house.name}`);
    }
  }

  // ─── Create sample bookings ───
  const houses = await prisma.house.findMany({ 
    select: { id: true, agentId: true },
    take: 5 
  });
  
  for (let i = 0; i < Math.min(3, houses.length); i++) {
    const house = houses[i];
    const existingBooking = await prisma.booking.findFirst({
      where: { userId: user.id, houseId: house.id },
    });
    
    if (!existingBooking) {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + (i + 1) * 7);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 7);
      
      await prisma.booking.create({
        data: {
          userId: user.id,
          houseId: house.id,
          agentId: house.agentId,
          checkIn,
          checkOut,
          totalAmount: 50000 + (i * 10000),
          status: ['PENDING', 'CONFIRMED', 'COMPLETED'][i] || 'PENDING',
          paymentStatus: i === 2 ? 'COMPLETED' : 'PENDING',
          notes: `Sample booking ${i + 1}`,
        },
      });
    }
  }
  console.log('  ✅ Sample bookings created');

  // ─── Create sample reviews ───
  for (let i = 0; i < Math.min(4, houses.length); i++) {
    const house = houses[i];
    const existingReview = await prisma.review.findFirst({
      where: { userId: user.id, houseId: house.id },
    });
    
    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: user.id,
          houseId: house.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: [
            'Great place to stay! Very clean and well maintained.',
            'Loved the location. Agent was very helpful.',
            'Modern amenities and spacious rooms. Highly recommend!',
            'Perfect for families. Kids loved the neighborhood.',
          ][i],
        },
      });
    }
  }
  console.log('  ✅ Sample reviews created');

  // ─── Create some views for popularity ───
  for (const house of houses.slice(0, 5)) {
    const existingView = await prisma.houseView.findFirst({
      where: { userId: user.id, houseId: house.id },
    });
    if (!existingView) {
      await prisma.houseView.create({
        data: { userId: user.id, houseId: house.id },
      });
    }
  }
  console.log('  ✅ Sample views created');

  console.log('\n🎉 Seed completed!');
  console.log('  Test credentials:');
  console.log('  User:  user@test.com / password123');
  console.log('  Agent: agent@test.com / password123');
  console.log('  Admin: admin@test.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
