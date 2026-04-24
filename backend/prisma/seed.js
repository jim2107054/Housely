import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const OWNER_DATA = [
  {
    username: 'owner_nadia',
    name: 'Nadia Rahman',
    email: 'owner.nadia@housely.dev',
    phoneNumber: '+8801710001001',
    avatar: 'https://picsum.photos/seed/owner-nadia/300/300',
    city: 'Dhaka',
    area: 'Gulshan',
  },
  {
    username: 'owner_tanvir',
    name: 'Tanvir Ahmed',
    email: 'owner.tanvir@housely.dev',
    phoneNumber: '+8801710001002',
    avatar: 'https://picsum.photos/seed/owner-tanvir/300/300',
    city: 'Dhaka',
    area: 'Dhanmondi',
  },
  {
    username: 'owner_samira',
    name: 'Samira Chowdhury',
    email: 'owner.samira@housely.dev',
    phoneNumber: '+8801710001003',
    avatar: 'https://picsum.photos/seed/owner-samira/300/300',
    city: 'Chattogram',
    area: 'Agrabad',
  },
  {
    username: 'owner_rihan',
    name: 'Rihan Kabir',
    email: 'owner.rihan@housely.dev',
    phoneNumber: '+8801710001004',
    avatar: 'https://picsum.photos/seed/owner-rihan/300/300',
    city: 'Sylhet',
    area: 'Zindabazar',
  },
  {
    username: 'owner_shakoyat',
    name: 'Shakoyat Sujon',
    email: 'shakoyatsujon@gmail.com',
    clerkId: 'user_3Cog6VSKT1YC8jgfmhdCCHEy42N',
    phoneNumber: '+8801710001005',
    avatar: 'https://picsum.photos/seed/owner-shakoyat/300/300',
    city: 'Dhaka',
    area: 'Mirpur',
  },
];

const RENTER_DATA = [
  {
    username: 'renter_amina',
    name: 'Amina Sultana',
    email: 'user.amina@housely.dev',
    phoneNumber: '+8801810002001',
    avatar: 'https://picsum.photos/seed/user-amina/300/300',
  },
  {
    username: 'renter_farhan',
    name: 'Farhan Mahmud',
    email: 'user.farhan@housely.dev',
    phoneNumber: '+8801810002002',
    avatar: 'https://picsum.photos/seed/user-farhan/300/300',
  },
  {
    username: 'renter_shila',
    name: 'Shila Akter',
    email: 'user.shila@housely.dev',
    phoneNumber: '+8801810002003',
    avatar: 'https://picsum.photos/seed/user-shila/300/300',
  },
  {
    username: 'renter_imon',
    name: 'Imon Hasan',
    email: 'user.imon@housely.dev',
    phoneNumber: '+8801810002004',
    avatar: 'https://picsum.photos/seed/user-imon/300/300',
  },
  {
    username: 'renter_shujon',
    name: 'Shujon',
    email: 'skt104.shujon@gmail.com',
    clerkId: 'user_3Cog6S8oqFs4zBPOWgrbMX78c1x',
    phoneNumber: '+8801810002005',
    avatar: 'https://picsum.photos/seed/user-shujon/300/300',
  },
];

const RENT_COMMENTS = [
  'Very clean and comfortable stay. The location is excellent.',
  'Owner was responsive and the check-in process was smooth.',
  'Nice apartment with good amenities and secure neighborhood.',
  'Great value for money. I would definitely book again.',
  'Spacious rooms, fast Wi-Fi, and everything was as described.',
  'Loved the area and nearby facilities. Highly recommended.',
];

const PROPERTY_TYPE_CYCLE = [
  'APARTMENT',
  'VILLA',
  'CONDO',
  'TOWNHOUSE',
  'DUPLEX',
  'PENTHOUSE',
  'STUDIO',
  'HOTEL',
];

const LISTING_TYPE_CYCLE = ['RENT', 'RENT', 'SALE', 'RENT', 'SALE', 'RENT', 'RENT', 'SALE'];

function createHousePayload(owner, ownerIndex, propertyIndex) {
  const listingType = LISTING_TYPE_CYCLE[propertyIndex];
  const propertyType = PROPERTY_TYPE_CYCLE[propertyIndex];
  const propertyNumber = propertyIndex + 1;
  const seedKey = `${owner.username}-${propertyNumber}`;
  const bedrooms = [1, 2, 3, 3, 4, 2, 1, 5][propertyIndex];
  const bathrooms = [1, 1, 2, 2, 3, 2, 1, 4][propertyIndex];
  const sqft = [650, 980, 1600, 1900, 2600, 1300, 520, 3200][propertyIndex];
  const buildYear = 2016 + ((ownerIndex + propertyIndex) % 9);
  const baseRent = 18000 + ownerIndex * 4500 + propertyIndex * 2800;
  const baseSale = 7500000 + ownerIndex * 1800000 + propertyIndex * 950000;

  return {
    name: `${propertyType.charAt(0) + propertyType.slice(1).toLowerCase()} ${propertyNumber} in ${owner.area}`,
    description: `Premium ${propertyType.toLowerCase()} listing managed by ${owner.name}. Close to schools, markets, and transport.`,
    status: 'AVAILABLE',
    listingType,
    propertyType,
    rentPerMonth: listingType === 'RENT' ? baseRent : null,
    salePrice: listingType === 'SALE' ? baseSale : null,
    address: `${propertyNumber * 7} Road-${propertyNumber}, ${owner.area}`,
    city: owner.city,
    area: owner.area,
    latitude: 23.70 + ownerIndex * 0.31 + propertyIndex * 0.004,
    longitude: 90.36 + ownerIndex * 0.29 + propertyIndex * 0.005,
    bedrooms,
    bathrooms,
    sizeInSqft: sqft,
    buildYear,
    hasWifi: propertyIndex % 2 === 0,
    hasWater: true,
    images: {
      create: [
        { url: `https://picsum.photos/seed/${seedKey}-1/1200/800`, order: 0 },
        { url: `https://picsum.photos/seed/${seedKey}-2/1200/800`, order: 1 },
        { url: `https://picsum.photos/seed/${seedKey}-3/1200/800`, order: 2 },
      ],
    },
    publicFacilities: {
      create: {
        wifi: propertyIndex % 2 === 0,
        water: true,
        electricity: true,
        parking: propertyIndex % 3 !== 0,
        mosqueDistance: 120 + propertyIndex * 35,
        hospitalDistance: 450 + propertyIndex * 120,
        shoppingMallDistance: 700 + propertyIndex * 95,
        marketDistance: 180 + propertyIndex * 70,
      },
    },
    ...(propertyIndex % 4 === 0
      ? {
          video: {
            create: {
              url: `https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4?seed=${seedKey}`,
            },
          },
        }
      : {}),
  };
}

async function main() {
  console.log('🌱 Seeding database...');

  const password = await bcrypt.hash('password123', 10);

  // ─── Reset database tables (dev seed) ───
  await prisma.$transaction([
    prisma.reviewMedia.deleteMany(),
    prisma.review.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.houseView.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.deviceToken.deleteMany(),
    prisma.notificationSettings.deleteMany(),
    prisma.houseVideo.deleteMany(),
    prisma.publicFacility.deleteMany(),
    prisma.houseImage.deleteMany(),
    prisma.house.deleteMany(),
    prisma.savedLocation.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // ─── Create Admin User ───
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'mdjahidhasanjim277@gmail.com',
      clerkId: 'user_3CoWc25a6bn4MvIdmzJKpFiMacp',
      password: adminPassword,
      name: 'Admin',
      phoneNumber: '+8801700000000',
      avatar: 'https://picsum.photos/seed/admin/300/300',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  await prisma.notificationSettings.create({
    data: {
      userId: adminUser.id,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      bookingUpdates: true,
      promotions: false,
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // ─── Create house owners (agents) ───
  const owners = [];
  for (const owner of OWNER_DATA) {
    const created = await prisma.user.create({
      data: {
        username: owner.username,
        email: owner.email,
        clerkId: owner.clerkId ?? undefined,
        password,
        name: owner.name,
        phoneNumber: owner.phoneNumber,
        avatar: owner.avatar,
        role: 'AGENT',
        isVerified: true,
      },
    });
    owners.push({ ...owner, id: created.id });
    await prisma.notificationSettings.create({
      data: {
        userId: created.id,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        bookingUpdates: true,
        promotions: true,
      },
    });
  }

  // ─── Create renter/buyer users ───
  const renters = [];
  for (const renter of RENTER_DATA) {
    const created = await prisma.user.create({
      data: {
        username: renter.username,
        email: renter.email,
        clerkId: renter.clerkId ?? undefined,
        password,
        name: renter.name,
        phoneNumber: renter.phoneNumber,
        avatar: renter.avatar,
        role: 'USER',
        isVerified: true,
      },
    });
    renters.push({ ...renter, id: created.id });
    await prisma.notificationSettings.create({
      data: {
        userId: created.id,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        bookingUpdates: true,
        promotions: false,
      },
    });
  }

  // ─── Create 8 houses per owner (32 total) ───
  const houses = [];
  for (let ownerIndex = 0; ownerIndex < owners.length; ownerIndex += 1) {
    const owner = owners[ownerIndex];
    for (let propertyIndex = 0; propertyIndex < 8; propertyIndex += 1) {
      const payload = createHousePayload(owner, ownerIndex, propertyIndex);
      const createdHouse = await prisma.house.create({
        data: {
          ...payload,
          agentId: owner.id,
        },
      });
      houses.push(createdHouse);
    }
  }

  const rentHouses = houses.filter((h) => h.listingType === 'RENT');
  const saleHouses = houses.filter((h) => h.listingType === 'SALE');

  // ─── Create views and favorites for discovery screens ───
  for (let userIndex = 0; userIndex < renters.length; userIndex += 1) {
    const renter = renters[userIndex];

    for (let viewIndex = 0; viewIndex < 14; viewIndex += 1) {
      const house = houses[(userIndex * 5 + viewIndex) % houses.length];
      await prisma.houseView.create({
        data: {
          userId: renter.id,
          houseId: house.id,
          viewedAt: new Date(Date.now() - (viewIndex + 1) * 6 * 60 * 60 * 1000),
        },
      });
    }

    for (let favIndex = 0; favIndex < 6; favIndex += 1) {
      const house = houses[(userIndex * 7 + favIndex) % houses.length];
      await prisma.favorite.create({
        data: {
          userId: renter.id,
          houseId: house.id,
          createdAt: new Date(Date.now() - favIndex * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // ─── Create bookings (rent + sale) and payments ───
  const createdBookings = [];
  for (let userIndex = 0; userIndex < renters.length; userIndex += 1) {
    const renter = renters[userIndex];

    const userRentHouses = [
      rentHouses[(userIndex * 3) % rentHouses.length],
      rentHouses[(userIndex * 3 + 1) % rentHouses.length],
      rentHouses[(userIndex * 3 + 2) % rentHouses.length],
    ];
    const userSaleHouse = saleHouses[(userIndex * 2) % saleHouses.length];
    const bookingHouses = [...userRentHouses, userSaleHouse];

    for (let bookingIndex = 0; bookingIndex < bookingHouses.length; bookingIndex += 1) {
      const house = bookingHouses[bookingIndex];
      const isRent = house.listingType === 'RENT';
      const checkIn = new Date(Date.now() - (bookingIndex + 2) * 10 * 24 * 60 * 60 * 1000);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + (isRent ? 30 : 7));

      const statusCycle = ['COMPLETED', 'CONFIRMED', 'PENDING', 'COMPLETED'];
      const bookingStatus = statusCycle[bookingIndex % statusCycle.length];
      const paymentStatus = bookingStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING';

      const totalAmount = isRent
        ? Math.ceil((house.rentPerMonth || 20000) * (bookingIndex % 2 === 0 ? 1 : 2))
        : house.salePrice || 9000000;

      const booking = await prisma.booking.create({
        data: {
          userId: renter.id,
          houseId: house.id,
          agentId: house.agentId,
          checkIn,
          checkOut,
          totalAmount,
          status: bookingStatus,
          paymentStatus,
          notes: isRent
            ? 'Rental booking generated by seed data.'
            : 'Purchase intent generated by seed data.',
        },
      });
      createdBookings.push(booking);

      if (paymentStatus === 'COMPLETED' || bookingStatus === 'CONFIRMED') {
        await prisma.payment.create({
          data: {
            userId: renter.id,
            bookingId: booking.id,
            amount: totalAmount,
            method: bookingIndex % 2 === 0 ? 'card' : 'bank_transfer',
            transactionId: `TXN-${userIndex + 1}${bookingIndex + 1}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            gatewayResponse: JSON.stringify({ approved: true }),
            status: paymentStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            description: isRent ? 'Monthly rent payment' : 'Property purchase payment',
          },
        });
      }
    }
  }

  // ─── Create reviews for completed bookings ───
  const completedBookings = createdBookings.filter((b) => b.status === 'COMPLETED');
  for (let i = 0; i < completedBookings.length; i += 1) {
    const booking = completedBookings[i];
    const review = await prisma.review.create({
      data: {
        userId: booking.userId,
        houseId: booking.houseId,
        bookingId: booking.id,
        rating: 4 + (i % 2),
        comment: RENT_COMMENTS[i % RENT_COMMENTS.length],
      },
    });

    await prisma.reviewMedia.create({
      data: {
        reviewId: review.id,
        url: `https://picsum.photos/seed/review-${i + 1}/900/600`,
        type: 'image',
      },
    });
  }

  // ─── Create conversations and messages ───
  for (let userIndex = 0; userIndex < renters.length; userIndex += 1) {
    const renter = renters[userIndex];
    const owner = owners[userIndex % owners.length];
    const house = houses[(userIndex * 4) % houses.length];

    const conversation = await prisma.conversation.create({
      data: {
        userId: renter.id,
        agentId: owner.id,
        houseId: house.id,
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: renter.id,
          content: `Hi, is ${house.name} still available?`,
          type: 'text',
          isRead: true,
        },
        {
          conversationId: conversation.id,
          senderId: owner.id,
          content: 'Yes, it is available. Would you like to schedule a visit?',
          type: 'text',
          isRead: false,
        },
      ],
    });
  }

  // ─── Create notifications ───
  for (const renter of renters) {
    await prisma.notification.createMany({
      data: [
        {
          userId: renter.id,
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Update',
          message: 'One of your bookings has been confirmed by the owner.',
          isRead: false,
        },
        {
          userId: renter.id,
          type: 'GENERAL',
          title: 'Welcome to Housely',
          message: 'Explore verified homes and book with confidence.',
          isRead: true,
        },
      ],
    });
  }

  for (const owner of owners) {
    await prisma.notification.createMany({
      data: [
        {
          userId: owner.id,
          type: 'BOOKING_CONFIRMED',
          title: 'New Booking Request',
          message: 'A renter has requested one of your properties.',
          isRead: false,
        },
        {
          userId: owner.id,
          type: 'REVIEW_POSTED',
          title: 'New Review Received',
          message: 'One of your properties received a new review.',
          isRead: false,
        },
      ],
    });
  }

  console.log('  ✅ Owners created:', owners.length);
  console.log('  ✅ Renters created:', renters.length);
  console.log('  ✅ Houses created:', houses.length);
  console.log('  ✅ Bookings created:', createdBookings.length);
  console.log('  ✅ Reviews created:', completedBookings.length);

  console.log('\n🎉 Seed completed successfully!');
  console.log('  Default password for all seeded users: password123');
  console.log('  Admin email: mdjahidhasanjim277@gmail.com | password: admin123');
  console.log('  Owner emails:');
  OWNER_DATA.forEach((o) => console.log(`   - ${o.email}`));
  console.log('  User emails:');
  RENTER_DATA.forEach((u) => console.log(`   - ${u.email}`));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
