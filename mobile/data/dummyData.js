/**
 * ============================================================
 * HOUSELY - Comprehensive Dummy Data
 * ============================================================
 * 
 * This file contains ALL dummy data structured EXACTLY like
 * the backend API responses. When connecting the real backend,
 * simply uncomment the API calls in each store/screen and
 * comment out the local data imports — no data format changes needed.
 * 
 * Data format matches: Prisma schema + API response wrappers
 * ============================================================
 */

// ─── USERS ──────────────────────────────────────────────

export const dummyUsers = {
  user: {
    id: "cluser001",
    username: "testuser",
    email: "user@test.com",
    name: "Test User",
    phoneNumber: "+8801700000001",
    avatar: null,
    role: "USER",
    authProvider: "LOCAL",
    isVerified: true,
    dateOfBirth: null,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-03-01T12:00:00.000Z",
  },
  agent: {
    id: "clagent001",
    username: "testagent",
    email: "agent@test.com",
    name: "Esther Howard",
    phoneNumber: "+8801700000002",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    role: "AGENT",
    authProvider: "LOCAL",
    isVerified: true,
    dateOfBirth: null,
    createdAt: "2025-01-10T08:00:00.000Z",
    updatedAt: "2025-02-20T09:00:00.000Z",
  },
  agent2: {
    id: "clagent002",
    username: "johnsmith",
    email: "john@test.com",
    name: "John Smith",
    phoneNumber: "+8801700000003",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    role: "AGENT",
    authProvider: "LOCAL",
    isVerified: true,
    dateOfBirth: null,
    createdAt: "2025-01-12T08:00:00.000Z",
    updatedAt: "2025-02-22T09:00:00.000Z",
  },
  agent3: {
    id: "clagent003",
    username: "madekomang",
    email: "komang@test.com",
    name: "Made Komang",
    phoneNumber: "+6281234567890",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    role: "AGENT",
    authProvider: "LOCAL",
    isVerified: true,
    dateOfBirth: null,
    createdAt: "2025-01-08T08:00:00.000Z",
    updatedAt: "2025-02-18T09:00:00.000Z",
  },
  owner: {
    id: "clowner001",
    username: "houseowner",
    email: "owner@test.com",
    name: "House Owner",
    phoneNumber: "+8801700000004",
    avatar: null,
    role: "AGENT",
    authProvider: "LOCAL",
    isVerified: true,
    dateOfBirth: null,
    createdAt: "2025-01-05T08:00:00.000Z",
    updatedAt: "2025-03-10T09:00:00.000Z",
  },
};

// ─── AUTH RESPONSES ─────────────────────────────────────

export const dummyAuthResponses = {
  loginUser: {
    success: true,
    message: "Login successful",
    user: dummyUsers.user,
    token: "dummy-jwt-token-user-12345",
    refreshToken: "dummy-refresh-token-user-12345",
  },
  loginOwner: {
    success: true,
    message: "Login successful",
    user: dummyUsers.owner,
    token: "dummy-jwt-token-owner-12345",
    refreshToken: "dummy-refresh-token-owner-12345",
  },
  registerUser: {
    success: true,
    message: "Registration successful. Please verify your email.",
    user: dummyUsers.user,
    token: "dummy-jwt-token-user-12345",
  },
  registerOwner: {
    success: true,
    message: "Registration successful. Please verify your email.",
    user: dummyUsers.owner,
    token: "dummy-jwt-token-owner-12345",
  },
};

// ─── HOUSES ─────────────────────────────────────────────

export const dummyHouses = [
  {
    id: "clhouse001",
    name: "House of Mormon",
    description:
      "A beautiful modern house with panoramic views. Fully furnished with premium finishes. The property features spacious rooms, a modern kitchen, and a lovely garden area perfect for relaxation.",
    status: "AVAILABLE",
    rentPerMonth: 310,
    salePrice: null,
    listingType: "RENT",
    propertyType: "VILLA",
    address: "Jl. Raya Kuta No. 10",
    city: "Denpasar",
    area: "Bali",
    latitude: -8.4095,
    longitude: 115.1889,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 1880,
    buildYear: 2020,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-01-20T10:00:00.000Z",
    updatedAt: "2025-03-01T12:00:00.000Z",
    agent: {
      id: "clagent001",
      username: "testagent",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
      role: "AGENT",
    },
    images: [
      { id: "img001", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", order: 0 },
      { id: "img002", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 1 },
      { id: "img003", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", order: 2 },
      { id: "img004", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac001",
      mosqueDistance: 500,
      hospitalDistance: 1200,
      shoppingMallDistance: 800,
      marketDistance: 300,
    },
    _count: { views: 245, favorites: 32, reviews: 152 },
    isFavorite: true,
    rating: 4.5,
  },
  {
    id: "clhouse002",
    name: "Ayana Homestay",
    description:
      "Beautiful homestay with modern amenities and stunning views. Perfect for families looking for a comfortable stay with all the facilities needed. Located in the heart of Yogyakarta.",
    status: "AVAILABLE",
    rentPerMonth: 310,
    salePrice: null,
    listingType: "RENT",
    propertyType: "APARTMENT",
    address: "Jl. Imogiri Barat KM 5",
    city: "Yogyakarta",
    area: "Imogiri",
    latitude: -7.9361,
    longitude: 110.3634,
    bedrooms: 4,
    bathrooms: 3,
    sizeInSqft: 2200,
    buildYear: 2019,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent002",
    createdAt: "2025-01-22T10:00:00.000Z",
    updatedAt: "2025-03-02T12:00:00.000Z",
    agent: {
      id: "clagent002",
      username: "johnsmith",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      phoneNumber: "+8801700000003",
      role: "AGENT",
    },
    images: [
      { id: "img005", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", order: 0 },
      { id: "img006", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
      { id: "img007", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", order: 2 },
      { id: "img008", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac002",
      mosqueDistance: 300,
      hospitalDistance: 2000,
      shoppingMallDistance: 1500,
      marketDistance: 200,
    },
    _count: { views: 189, favorites: 24, reviews: 89 },
    isFavorite: false,
    rating: 4.8,
  },
  {
    id: "clhouse003",
    name: "Bali Komang Guest",
    description:
      "Cozy guest house in the heart of Nusa Penida with easy access to famous beaches and attractions. The perfect getaway for nature lovers.",
    status: "AVAILABLE",
    rentPerMonth: 280,
    salePrice: null,
    listingType: "RENT",
    propertyType: "HOTEL",
    address: "Jl. Nusa Penida No. 15",
    city: "Bali",
    area: "Nusa Penida",
    latitude: -8.7275,
    longitude: 115.5444,
    bedrooms: 2,
    bathrooms: 2,
    sizeInSqft: 1500,
    buildYear: 2021,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent003",
    createdAt: "2025-01-25T10:00:00.000Z",
    updatedAt: "2025-03-05T12:00:00.000Z",
    agent: {
      id: "clagent003",
      username: "madekomang",
      name: "Made Komang",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      phoneNumber: "+6281234567890",
      role: "AGENT",
    },
    images: [
      { id: "img009", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", order: 0 },
      { id: "img010", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
      { id: "img011", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 2 },
      { id: "img012", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac003",
      mosqueDistance: 800,
      hospitalDistance: 3000,
      shoppingMallDistance: 2000,
      marketDistance: 500,
    },
    _count: { views: 312, favorites: 45, reviews: 124 },
    isFavorite: false,
    rating: 4.7,
  },
  {
    id: "clhouse004",
    name: "Villa Paradise",
    description:
      "Luxurious villa with infinity pool and breathtaking ocean views. This exclusive property features a private garden, outdoor dining area, and world-class amenities.",
    status: "AVAILABLE",
    rentPerMonth: 450,
    salePrice: null,
    listingType: "RENT",
    propertyType: "VILLA",
    address: "Jl. Sunset Road No. 88",
    city: "Bali",
    area: "Seminyak",
    latitude: -8.6905,
    longitude: 115.1684,
    bedrooms: 5,
    bathrooms: 4,
    sizeInSqft: 3500,
    buildYear: 2022,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-02-01T10:00:00.000Z",
    updatedAt: "2025-03-08T12:00:00.000Z",
    agent: {
      id: "clagent001",
      username: "testagent",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
      role: "AGENT",
    },
    images: [
      { id: "img013", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", order: 0 },
      { id: "img014", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400", order: 1 },
      { id: "img015", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400", order: 2 },
      { id: "img016", url: "https://images.unsplash.com/photo-1600573472550-8090733a21e0?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac004",
      mosqueDistance: 1200,
      hospitalDistance: 2500,
      shoppingMallDistance: 600,
      marketDistance: 400,
    },
    _count: { views: 520, favorites: 67, reviews: 203 },
    isFavorite: false,
    rating: 4.9,
  },
  {
    id: "clhouse005",
    name: "Maharani Villa",
    description:
      "Elegant villa in a prime Jakarta location with modern interiors and lush tropical gardens. Close to shopping centers and business districts.",
    status: "AVAILABLE",
    rentPerMonth: 320,
    salePrice: null,
    listingType: "RENT",
    propertyType: "VILLA",
    address: "Jl. Benhil Raya No. 22",
    city: "Jakarta",
    area: "Benhil",
    latitude: -6.2088,
    longitude: 106.8456,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 1600,
    buildYear: 2018,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent002",
    createdAt: "2025-02-05T10:00:00.000Z",
    updatedAt: "2025-03-10T12:00:00.000Z",
    agent: {
      id: "clagent002",
      username: "johnsmith",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      phoneNumber: "+8801700000003",
      role: "AGENT",
    },
    images: [
      { id: "img017", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", order: 0 },
      { id: "img018", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 1 },
      { id: "img019", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", order: 2 },
      { id: "img020", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac005",
      mosqueDistance: 200,
      hospitalDistance: 1000,
      shoppingMallDistance: 500,
      marketDistance: 150,
    },
    _count: { views: 156, favorites: 19, reviews: 67 },
    isFavorite: false,
    rating: 4.5,
  },
  {
    id: "clhouse006",
    name: "Sunset Apartment",
    description:
      "Modern apartment with sunset views in the heart of Kemang. Features include a rooftop pool, gym, and 24-hour security.",
    status: "AVAILABLE",
    rentPerMonth: 280,
    salePrice: null,
    listingType: "RENT",
    propertyType: "APARTMENT",
    address: "Jl. Kemang Raya No. 45",
    city: "Jakarta",
    area: "Kemang",
    latitude: -6.2615,
    longitude: 106.8106,
    bedrooms: 2,
    bathrooms: 1,
    sizeInSqft: 900,
    buildYear: 2020,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-02-08T10:00:00.000Z",
    updatedAt: "2025-03-11T12:00:00.000Z",
    agent: {
      id: "clagent001",
      username: "testagent",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
      role: "AGENT",
    },
    images: [
      { id: "img021", url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800", order: 0 },
      { id: "img022", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
      { id: "img023", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 2 },
      { id: "img024", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac006",
      mosqueDistance: 400,
      hospitalDistance: 1500,
      shoppingMallDistance: 300,
      marketDistance: 250,
    },
    _count: { views: 178, favorites: 22, reviews: 45 },
    isFavorite: false,
    rating: 4.7,
  },
  {
    id: "clhouse007",
    name: "Green Valley",
    description:
      "Spacious property surrounded by lush greenery in Sudirman. Ideal for families who love nature while staying close to city amenities.",
    status: "AVAILABLE",
    rentPerMonth: 350,
    salePrice: null,
    listingType: "RENT",
    propertyType: "TOWNHOUSE",
    address: "Jl. Sudirman No. 100",
    city: "Jakarta",
    area: "Sudirman",
    latitude: -6.2250,
    longitude: 106.8098,
    bedrooms: 4,
    bathrooms: 3,
    sizeInSqft: 2400,
    buildYear: 2019,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent002",
    createdAt: "2025-02-10T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: {
      id: "clagent002",
      username: "johnsmith",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      phoneNumber: "+8801700000003",
      role: "AGENT",
    },
    images: [
      { id: "img025", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", order: 0 },
      { id: "img026", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 1 },
      { id: "img027", url: "https://images.unsplash.com/photo-1612637968894-660373e23b03?w=400", order: 2 },
      { id: "img028", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac007",
      mosqueDistance: 350,
      hospitalDistance: 800,
      shoppingMallDistance: 400,
      marketDistance: 200,
    },
    _count: { views: 134, favorites: 15, reviews: 38 },
    isFavorite: false,
    rating: 4.8,
  },
  {
    id: "clhouse008",
    name: "City View Condo",
    description:
      "Premium condo with panoramic city views. High-floor unit with floor-to-ceiling windows, premium fixtures, and access to exclusive amenities.",
    status: "AVAILABLE",
    rentPerMonth: 420,
    salePrice: null,
    listingType: "RENT",
    propertyType: "CONDO",
    address: "Jl. Menteng Raya No. 55",
    city: "Jakarta",
    area: "Menteng",
    latitude: -6.1876,
    longitude: 106.8391,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 1800,
    buildYear: 2021,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent003",
    createdAt: "2025-02-12T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: {
      id: "clagent003",
      username: "madekomang",
      name: "Made Komang",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      phoneNumber: "+6281234567890",
      role: "AGENT",
    },
    images: [
      { id: "img029", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", order: 0 },
      { id: "img030", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", order: 1 },
      { id: "img031", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 2 },
      { id: "img032", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac008",
      mosqueDistance: 600,
      hospitalDistance: 900,
      shoppingMallDistance: 200,
      marketDistance: 350,
    },
    _count: { views: 267, favorites: 38, reviews: 92 },
    isFavorite: false,
    rating: 4.6,
  },
  {
    id: "clhouse009",
    name: "Sky Residence",
    description:
      "Ultra-luxury penthouse in the SCBD area. This exclusive property features a private rooftop terrace, jacuzzi, and breathtaking views of the Jakarta skyline.",
    status: "AVAILABLE",
    rentPerMonth: 550,
    salePrice: null,
    listingType: "RENT",
    propertyType: "PENTHOUSE",
    address: "SCBD Lot 5, Jakarta",
    city: "Jakarta",
    area: "SCBD",
    latitude: -6.2275,
    longitude: 106.8080,
    bedrooms: 4,
    bathrooms: 3,
    sizeInSqft: 3200,
    buildYear: 2023,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-02-15T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: {
      id: "clagent001",
      username: "testagent",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
      role: "AGENT",
    },
    images: [
      { id: "img033", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", order: 0 },
      { id: "img034", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
      { id: "img035", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 2 },
      { id: "img036", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac009",
      mosqueDistance: 700,
      hospitalDistance: 1100,
      shoppingMallDistance: 100,
      marketDistance: 500,
    },
    _count: { views: 412, favorites: 56, reviews: 178 },
    isFavorite: false,
    rating: 4.9,
  },
  {
    id: "clhouse010",
    name: "Takatea Homestay",
    description:
      "Charming homestay with traditional architecture and modern comforts. Enjoy authentic local living with all the conveniences of a modern home.",
    status: "AVAILABLE",
    rentPerMonth: null,
    salePrice: null,
    listingType: "RENT",
    propertyType: "HOTEL",
    address: "Jl. Tentara Pelajar No.47",
    city: "Yogyakarta",
    area: "Gondomanan",
    latitude: -7.7956,
    longitude: 110.3695,
    bedrooms: 2,
    bathrooms: 1,
    sizeInSqft: 800,
    buildYear: 2017,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent003",
    createdAt: "2025-02-18T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: {
      id: "clagent003",
      username: "madekomang",
      name: "Made Komang",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      phoneNumber: "+6281234567890",
      role: "AGENT",
    },
    images: [
      { id: "img037", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", order: 0 },
      { id: "img038", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400", order: 1 },
      { id: "img039", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 2 },
      { id: "img040", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", order: 3 },
    ],
    publicFacilities: {
      id: "fac010",
      mosqueDistance: 150,
      hospitalDistance: 2500,
      shoppingMallDistance: 1000,
      marketDistance: 100,
    },
    _count: { views: 89, favorites: 11, reviews: 28 },
    isFavorite: false,
    rating: 4.5,
    pricePerNight: 120,
  },
  {
    id: "clhouse011",
    name: "Palm Garden",
    description:
      "Beautiful residence with extensive palm gardens and swimming pool. A tropical paradise in the heart of Pondok Indah.",
    status: "AVAILABLE",
    rentPerMonth: 380,
    salePrice: null,
    listingType: "RENT",
    propertyType: "VILLA",
    address: "Jl. Metro Pondok Indah",
    city: "Jakarta",
    area: "Pondok Indah",
    latitude: -6.2750,
    longitude: 106.7847,
    bedrooms: 4,
    bathrooms: 3,
    sizeInSqft: 2800,
    buildYear: 2018,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-02-20T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: dummyUsers.agent,
    images: [
      { id: "img041", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800", order: 0 },
      { id: "img042", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
    ],
    publicFacilities: {
      id: "fac011",
      mosqueDistance: 450,
      hospitalDistance: 1200,
      shoppingMallDistance: 300,
      marketDistance: 600,
    },
    _count: { views: 145, favorites: 18, reviews: 52 },
    isFavorite: false,
    rating: 4.6,
  },
  {
    id: "clhouse012",
    name: "Urban Loft",
    description:
      "Stylish urban loft in Kelapa Gading with industrial-chic design. Open-plan living with exposed brick and high ceilings.",
    status: "AVAILABLE",
    rentPerMonth: 290,
    salePrice: null,
    listingType: "RENT",
    propertyType: "STUDIO",
    address: "Jl. Boulevard Raya, Kelapa Gading",
    city: "Jakarta",
    area: "Kelapa Gading",
    latitude: -6.1590,
    longitude: 106.9072,
    bedrooms: 1,
    bathrooms: 1,
    sizeInSqft: 650,
    buildYear: 2020,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent002",
    createdAt: "2025-02-22T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: dummyUsers.agent2,
    images: [
      { id: "img043", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", order: 0 },
      { id: "img044", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 1 },
    ],
    publicFacilities: {
      id: "fac012",
      mosqueDistance: 300,
      hospitalDistance: 800,
      shoppingMallDistance: 200,
      marketDistance: 150,
    },
    _count: { views: 98, favorites: 8, reviews: 22 },
    isFavorite: false,
    rating: 4.4,
  },
  {
    id: "clhouse013",
    name: "River View",
    description:
      "Charming riverside property with serene views. Modern amenities with a traditional touch. Perfect for those seeking tranquility.",
    status: "AVAILABLE",
    rentPerMonth: 310,
    salePrice: null,
    listingType: "RENT",
    propertyType: "APARTMENT",
    address: "Jl. Pluit Karang Ayu",
    city: "Jakarta",
    area: "Pluit",
    latitude: -6.1275,
    longitude: 106.7942,
    bedrooms: 2,
    bathrooms: 2,
    sizeInSqft: 1100,
    buildYear: 2019,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent003",
    createdAt: "2025-02-24T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: dummyUsers.agent3,
    images: [
      { id: "img045", url: "https://images.unsplash.com/photo-1600573472550-8090733a21e0?w=800", order: 0 },
      { id: "img046", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
    ],
    publicFacilities: {
      id: "fac013",
      mosqueDistance: 250,
      hospitalDistance: 1500,
      shoppingMallDistance: 700,
      marketDistance: 300,
    },
    _count: { views: 112, favorites: 14, reviews: 35 },
    isFavorite: false,
    rating: 4.5,
  },
  {
    id: "clhouse014",
    name: "Modern Suite",
    description:
      "Contemporary suite in the prestigious Senayan area. State-of-the-art facilities with direct access to shopping and entertainment centers.",
    status: "AVAILABLE",
    rentPerMonth: 450,
    salePrice: null,
    listingType: "RENT",
    propertyType: "APARTMENT",
    address: "Jl. Asia Afrika, Senayan",
    city: "Jakarta",
    area: "Senayan",
    latitude: -6.2222,
    longitude: 106.8005,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 1400,
    buildYear: 2022,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent001",
    createdAt: "2025-02-26T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: dummyUsers.agent,
    images: [
      { id: "img047", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800", order: 0 },
      { id: "img048", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", order: 1 },
    ],
    publicFacilities: {
      id: "fac014",
      mosqueDistance: 500,
      hospitalDistance: 700,
      shoppingMallDistance: 50,
      marketDistance: 400,
    },
    _count: { views: 198, favorites: 25, reviews: 68 },
    isFavorite: false,
    rating: 4.8,
  },
  {
    id: "clhouse015",
    name: "Heritage House",
    description:
      "Beautifully restored heritage house in the historical Kota Tua area. A blend of colonial architecture and modern comfort.",
    status: "AVAILABLE",
    rentPerMonth: 270,
    salePrice: null,
    listingType: "RENT",
    propertyType: "TOWNHOUSE",
    address: "Jl. Pintu Besar Utara, Kota Tua",
    city: "Jakarta",
    area: "Kota Tua",
    latitude: -6.1352,
    longitude: 106.8133,
    bedrooms: 3,
    bathrooms: 2,
    sizeInSqft: 1200,
    buildYear: 2016,
    hasWifi: true,
    hasWater: true,
    agentId: "clagent002",
    createdAt: "2025-02-28T10:00:00.000Z",
    updatedAt: "2025-03-12T12:00:00.000Z",
    agent: dummyUsers.agent2,
    images: [
      { id: "img049", url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800", order: 0 },
      { id: "img050", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", order: 1 },
    ],
    publicFacilities: {
      id: "fac015",
      mosqueDistance: 200,
      hospitalDistance: 2000,
      shoppingMallDistance: 900,
      marketDistance: 100,
    },
    _count: { views: 76, favorites: 7, reviews: 19 },
    isFavorite: false,
    rating: 4.3,
  },
];

// ─── HELPER: Transform house to simple property card format ──

const houseToCard = (house) => ({
  id: house.id,
  name: house.name,
  location: `${house.area}, ${house.city}`,
  price: house.rentPerMonth || house.pricePerNight || house.salePrice || 0,
  priceType: house.pricePerNight ? "night" : house.listingType === "SALE" ? "total" : "month",
  rating: house.rating,
  image: house.images[0]?.url || "",
  isFavorite: house.isFavorite || false,
  propertyType: house.propertyType,
  listingType: house.listingType,
  bedrooms: house.bedrooms,
  bathrooms: house.bathrooms,
  area: house.sizeInSqft,
});

// ─── PRE-BUILT LISTS (same format currently used in screens) ──

export const recommendedProperties = dummyHouses.slice(0, 3).map(houseToCard);

export const nearbyPropertiesRow1 = dummyHouses.slice(4, 9).map(houseToCard);

export const nearbyPropertiesRow2 = dummyHouses.slice(10, 15).map(houseToCard);

export const popularProperties = [
  houseToCard(dummyHouses[9]),  // Takatea
  houseToCard(dummyHouses[4]),  // Maharani
  houseToCard(dummyHouses[2]),  // Bali Komang
];

export const allProperties = dummyHouses.map(houseToCard);

export const topLocations = [
  {
    id: "loc1",
    name: "Malang",
    image: require("../assets/images/home-icons/Rectangle 14.png"),
    houseCount: 24,
  },
  {
    id: "loc2",
    name: "Bali",
    image: require("../assets/images/home-icons/Rectangle 15.png"),
    isActive: true,
    houseCount: 156,
  },
  {
    id: "loc3",
    name: "Yogyakarta",
    image: require("../assets/images/home-icons/Rectangle 16.png"),
    houseCount: 89,
  },
  {
    id: "loc4",
    name: "Jakarta",
    image: require("../assets/images/home-icons/Rectangle 14.png"),
    houseCount: 312,
  },
];

// ─── PROPERTY DETAILS MAP (keyed by ID for quick lookup) ──

export const propertiesDetailMap = {};
dummyHouses.forEach((house) => {
  propertiesDetailMap[house.id] = {
    id: house.id,
    name: house.name,
    location: `${house.area}, ${house.city}`,
    price: house.rentPerMonth || house.pricePerNight || house.salePrice || 0,
    priceType: house.pricePerNight ? "night" : house.listingType === "SALE" ? "total" : "month",
    rating: house.rating,
    images: house.images.map((img) => img.url),
    bedrooms: house.bedrooms,
    bathrooms: house.bathrooms,
    area: house.sizeInSqft,
    buildYear: house.buildYear,
    parking: house.bedrooms >= 3 ? `${Math.ceil(house.bedrooms / 3)} Indoor` : "1 Outdoor",
    status: house.listingType === "RENT" ? "For Rent" : "For Sale",
    description: house.description,
    agent: {
      name: house.agent?.name || "Unknown Agent",
      role: house.agent?.role === "AGENT" ? "Real Estate Agent" : "Property Owner",
      image: house.agent?.avatar || "https://randomuser.me/api/portraits/men/1.jpg",
      phone: house.agent?.phoneNumber || "+000000000",
    },
    facilities: [],
    coordinates: {
      latitude: house.latitude || -8.4095,
      longitude: house.longitude || 115.1889,
    },
    reviews: [],
    totalReviews: house._count?.reviews || 0,
    propertyType: house.propertyType,
    listingType: house.listingType,
    sizeInSqft: house.sizeInSqft,
    hasWifi: house.hasWifi,
    hasWater: house.hasWater,
  };

  // Build facilities list from publicFacilities
  const fac = house.publicFacilities;
  if (fac) {
    if (fac.hospitalDistance) propertiesDetailMap[house.id].facilities.push("Hospital");
    if (fac.shoppingMallDistance) propertiesDetailMap[house.id].facilities.push("Mall");
    if (fac.mosqueDistance) propertiesDetailMap[house.id].facilities.push("Mosque");
    if (fac.marketDistance) propertiesDetailMap[house.id].facilities.push("Market");
  }
  // Add WiFi if available
  if (house.hasWifi) propertiesDetailMap[house.id].facilities.push("WiFi");
});

// Add reviews to specific properties
propertiesDetailMap["clhouse001"].reviews = [
  {
    id: "rev001",
    name: "Theresa Webb",
    rating: 4,
    comment: "Great property with excellent amenities. The location is perfect and the agent was very helpful throughout the process.",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    id: "rev002",
    name: "Alex Johnson",
    rating: 5,
    comment: "Amazing property with great amenities. Highly recommended!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
];

propertiesDetailMap["clhouse002"].reviews = [
  {
    id: "rev003",
    name: "Sarah Williams",
    rating: 5,
    comment: "Excellent property! Very clean and well maintained. The views are absolutely stunning.",
    image: "https://randomuser.me/api/portraits/women/22.jpg",
  },
];

propertiesDetailMap["clhouse003"].reviews = [
  {
    id: "rev004",
    name: "Michael Brown",
    rating: 4,
    comment: "Great location and friendly host! The beach is just minutes away. Will come back again.",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

propertiesDetailMap["clhouse004"].reviews = [
  {
    id: "rev005",
    name: "Emily Davis",
    rating: 5,
    comment: "Absolutely stunning villa! The infinity pool is amazing and the views are breathtaking.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: "rev006",
    name: "Robert Wilson",
    rating: 5,
    comment: "Best vacation rental we've ever stayed in. Everything was perfect from start to finish.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

// ─── BOOKINGS ───────────────────────────────────────────

export const dummyBookings = [
  {
    id: "clbook001",
    userId: "cluser001",
    houseId: "clhouse001",
    agentId: "clagent001",
    checkIn: "2026-04-01T14:00:00.000Z",
    checkOut: "2026-04-08T11:00:00.000Z",
    totalAmount: 310,
    status: "PENDING",
    paymentStatus: "PENDING",
    notes: "First time visitor",
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    house: {
      id: "clhouse001",
      name: "House of Mormon",
      address: "Jl. Raya Kuta No. 10",
      city: "Denpasar",
      area: "Bali",
      images: [{ url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800" }],
    },
    agent: {
      id: "clagent001",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
    },
  },
  {
    id: "clbook002",
    userId: "cluser001",
    houseId: "clhouse002",
    agentId: "clagent002",
    checkIn: "2026-04-15T14:00:00.000Z",
    checkOut: "2026-04-22T11:00:00.000Z",
    totalAmount: 310,
    status: "CONFIRMED",
    paymentStatus: "COMPLETED",
    notes: null,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-06T10:00:00.000Z",
    house: {
      id: "clhouse002",
      name: "Ayana Homestay",
      address: "Jl. Imogiri Barat KM 5",
      city: "Yogyakarta",
      area: "Imogiri",
      images: [{ url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800" }],
    },
    agent: {
      id: "clagent002",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      phoneNumber: "+8801700000003",
    },
  },
  {
    id: "clbook003",
    userId: "cluser001",
    houseId: "clhouse003",
    agentId: "clagent003",
    checkIn: "2026-01-10T14:00:00.000Z",
    checkOut: "2026-01-17T11:00:00.000Z",
    totalAmount: 280,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    notes: "Great stay!",
    createdAt: "2025-12-20T10:00:00.000Z",
    updatedAt: "2026-01-17T10:00:00.000Z",
    house: {
      id: "clhouse003",
      name: "Bali Komang Guest",
      address: "Jl. Nusa Penida No. 15",
      city: "Bali",
      area: "Nusa Penida",
      images: [{ url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800" }],
    },
    agent: {
      id: "clagent003",
      name: "Made Komang",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      phoneNumber: "+6281234567890",
    },
  },
  {
    id: "clbook004",
    userId: "cluser001",
    houseId: "clhouse004",
    agentId: "clagent001",
    checkIn: "2025-12-01T14:00:00.000Z",
    checkOut: "2025-12-08T11:00:00.000Z",
    totalAmount: 450,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    notes: "Had to cancel due to emergency",
    createdAt: "2025-11-15T10:00:00.000Z",
    updatedAt: "2025-11-20T10:00:00.000Z",
    house: {
      id: "clhouse004",
      name: "Villa Paradise",
      address: "Jl. Sunset Road No. 88",
      city: "Bali",
      area: "Seminyak",
      images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" }],
    },
    agent: {
      id: "clagent001",
      name: "Esther Howard",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      phoneNumber: "+8801700000002",
    },
  },
  {
    id: "clbook005",
    userId: "cluser001",
    houseId: "clhouse005",
    agentId: "clagent002",
    checkIn: "2025-11-01T14:00:00.000Z",
    checkOut: "2025-11-10T11:00:00.000Z",
    totalAmount: 320,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    notes: null,
    createdAt: "2025-10-15T10:00:00.000Z",
    updatedAt: "2025-11-10T10:00:00.000Z",
    house: {
      id: "clhouse005",
      name: "Maharani Villa",
      address: "Jl. Benhil Raya No. 22",
      city: "Jakarta",
      area: "Benhil",
      images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" }],
    },
    agent: {
      id: "clagent002",
      name: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      phoneNumber: "+8801700000003",
    },
  },
];

// ─── CONVERSATIONS & MESSAGES ───────────────────────────

export const dummyConversations = [
  {
    id: "clconv001",
    userId: "cluser001",
    agentId: "clagent001",
    houseId: "clhouse001",
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-12T10:30:00.000Z",
    agent: {
      id: "clagent001",
      name: "Esther Howard",
      username: "testagent",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "AGENT",
    },
    lastMessage: {
      content: "Sure! I can show you the property tomorrow at 2 PM",
      createdAt: "2026-03-12T10:30:00.000Z",
    },
    unreadCount: 2,
    online: true,
  },
  {
    id: "clconv002",
    userId: "cluser001",
    agentId: "clagent002",
    houseId: "clhouse002",
    createdAt: "2026-03-08T10:00:00.000Z",
    updatedAt: "2026-03-11T16:30:00.000Z",
    agent: {
      id: "clagent002",
      name: "John Smith",
      username: "johnsmith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      role: "AGENT",
    },
    lastMessage: {
      content: "The documents are ready for signing",
      createdAt: "2026-03-11T16:30:00.000Z",
    },
    unreadCount: 0,
    online: false,
  },
  {
    id: "clconv003",
    userId: "cluser001",
    agentId: "clagent003",
    houseId: "clhouse003",
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-11T09:30:00.000Z",
    agent: {
      id: "clagent003",
      name: "Made Komang",
      username: "madekomang",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      role: "AGENT",
    },
    lastMessage: {
      content: "Welcome to Bali! Let me know when you arrive",
      createdAt: "2026-03-11T09:30:00.000Z",
    },
    unreadCount: 1,
    online: true,
  },
  {
    id: "clconv004",
    userId: "cluser001",
    agentId: "clagent001",
    houseId: "clhouse004",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-09T14:00:00.000Z",
    agent: {
      id: "clagent001",
      name: "Sarah Williams",
      username: "sarahw",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      role: "AGENT",
    },
    lastMessage: {
      content: "Thank you for your interest in my property",
      createdAt: "2026-03-09T14:00:00.000Z",
    },
    unreadCount: 0,
    online: false,
  },
  {
    id: "clconv005",
    userId: "cluser001",
    agentId: "clagent002",
    houseId: "clhouse005",
    createdAt: "2026-02-25T10:00:00.000Z",
    updatedAt: "2026-03-07T11:00:00.000Z",
    agent: {
      id: "clagent002",
      name: "David Chen",
      username: "davidchen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      role: "AGENT",
    },
    lastMessage: {
      content: "I have some great options for you",
      createdAt: "2026-03-07T11:00:00.000Z",
    },
    unreadCount: 0,
    online: true,
  },
];

export const dummyMessages = {
  clconv001: [
    {
      id: "clmsg001",
      conversationId: "clconv001",
      senderId: "cluser001",
      content: "Hi! I'm interested in the House of Mormon property",
      type: "text",
      isRead: true,
      createdAt: "2026-03-12T10:00:00.000Z",
    },
    {
      id: "clmsg002",
      conversationId: "clconv001",
      senderId: "clagent001",
      content: "Hello! Thank you for your interest. It's a beautiful property with 3 bedrooms and 2 bathrooms.",
      type: "text",
      isRead: true,
      createdAt: "2026-03-12T10:05:00.000Z",
    },
    {
      id: "clmsg003",
      conversationId: "clconv001",
      senderId: "cluser001",
      content: "Can I schedule a visit?",
      type: "text",
      isRead: true,
      createdAt: "2026-03-12T10:15:00.000Z",
    },
    {
      id: "clmsg004",
      conversationId: "clconv001",
      senderId: "clagent001",
      content: "Of course! When would be convenient for you?",
      type: "text",
      isRead: true,
      createdAt: "2026-03-12T10:20:00.000Z",
    },
    {
      id: "clmsg005",
      conversationId: "clconv001",
      senderId: "cluser001",
      content: "How about tomorrow afternoon?",
      type: "text",
      isRead: true,
      createdAt: "2026-03-12T10:25:00.000Z",
    },
    {
      id: "clmsg006",
      conversationId: "clconv001",
      senderId: "clagent001",
      content: "Sure! I can show you the property tomorrow at 2 PM",
      type: "text",
      isRead: false,
      createdAt: "2026-03-12T10:30:00.000Z",
    },
  ],
  clconv002: [
    {
      id: "clmsg007",
      conversationId: "clconv002",
      senderId: "cluser001",
      content: "Hello, I need some documents for the rental agreement",
      type: "text",
      isRead: true,
      createdAt: "2026-03-11T14:00:00.000Z",
    },
    {
      id: "clmsg008",
      conversationId: "clconv002",
      senderId: "clagent002",
      content: "Sure, I'll prepare them right away",
      type: "text",
      isRead: true,
      createdAt: "2026-03-11T14:15:00.000Z",
    },
    {
      id: "clmsg009",
      conversationId: "clconv002",
      senderId: "clagent002",
      content: "The documents are ready for signing",
      type: "text",
      isRead: true,
      createdAt: "2026-03-11T16:30:00.000Z",
    },
  ],
  clconv003: [
    {
      id: "clmsg010",
      conversationId: "clconv003",
      senderId: "cluser001",
      content: "Hi, I just booked the Bali Komang Guest house",
      type: "text",
      isRead: true,
      createdAt: "2026-03-11T09:00:00.000Z",
    },
    {
      id: "clmsg011",
      conversationId: "clconv003",
      senderId: "clagent003",
      content: "Welcome to Bali! Let me know when you arrive",
      type: "text",
      isRead: false,
      createdAt: "2026-03-11T09:30:00.000Z",
    },
  ],
};

// ─── NOTIFICATIONS ──────────────────────────────────────

export const dummyNotifications = [
  {
    id: "clnotif001",
    userId: "cluser001",
    type: "BOOKING_CONFIRMED",
    title: "Booking Confirmed",
    message: "Your booking for House of Mormon has been confirmed. Check-in: April 1, 2026",
    data: { bookingId: "clbook001", houseId: "clhouse001" },
    isRead: false,
    createdAt: "2026-03-12T08:00:00.000Z",
  },
  {
    id: "clnotif002",
    userId: "cluser001",
    type: "PAYMENT_SUCCESS",
    title: "Payment Successful",
    message: "Payment of $310 for Ayana Homestay has been processed successfully",
    data: { bookingId: "clbook002", amount: 310 },
    isRead: false,
    createdAt: "2026-03-11T15:00:00.000Z",
  },
  {
    id: "clnotif003",
    userId: "cluser001",
    type: "NEW_MESSAGE",
    title: "New Message",
    message: "Esther Howard sent you a message about House of Mormon",
    data: { conversationId: "clconv001", senderId: "clagent001" },
    isRead: true,
    createdAt: "2026-03-12T10:30:00.000Z",
  },
  {
    id: "clnotif004",
    userId: "cluser001",
    type: "GENERAL",
    title: "Weekend Special! 🎉",
    message: "Get 20% cashback on all bookings this weekend. Use code WEEKEND20",
    data: { promoCode: "WEEKEND20" },
    isRead: true,
    createdAt: "2026-03-10T09:00:00.000Z",
  },
  {
    id: "clnotif005",
    userId: "cluser001",
    type: "GENERAL",
    title: "Don't Forget!",
    message: "Your check-in for House of Mormon is in 3 days. Make sure everything is ready!",
    data: { bookingId: "clbook001" },
    isRead: false,
    createdAt: "2026-03-09T10:00:00.000Z",
  },
  {
    id: "clnotif006",
    userId: "cluser001",
    type: "REVIEW_POSTED",
    title: "Review Posted",
    message: "Your review for Bali Komang Guest has been posted successfully",
    data: { reviewId: "rev004", houseId: "clhouse003" },
    isRead: true,
    createdAt: "2026-03-08T14:00:00.000Z",
  },
  {
    id: "clnotif007",
    userId: "cluser001",
    type: "GENERAL",
    title: "Price Drop Alert",
    message: "Villa Paradise price dropped by 15%! Now at $382/month",
    data: { houseId: "clhouse004", newPrice: 382 },
    isRead: true,
    createdAt: "2026-03-07T11:00:00.000Z",
  },
];

// ─── PAYMENTS ───────────────────────────────────────────

export const dummyPayments = [
  {
    id: "clpay001",
    userId: "cluser001",
    bookingId: "clbook002",
    amount: 310,
    currency: "USD",
    method: "Credit Card",
    transactionId: "TXN-2026-001",
    status: "COMPLETED",
    description: "Booking payment for Ayana Homestay",
    createdAt: "2026-03-05T10:30:00.000Z",
    booking: {
      house: { name: "Ayana Homestay", city: "Yogyakarta" },
    },
  },
  {
    id: "clpay002",
    userId: "cluser001",
    bookingId: "clbook003",
    amount: 280,
    currency: "USD",
    method: "Bank Transfer",
    transactionId: "TXN-2025-012",
    status: "COMPLETED",
    description: "Booking payment for Bali Komang Guest",
    createdAt: "2025-12-20T11:00:00.000Z",
    booking: {
      house: { name: "Bali Komang Guest", city: "Bali" },
    },
  },
  {
    id: "clpay003",
    userId: "cluser001",
    bookingId: "clbook004",
    amount: 450,
    currency: "USD",
    method: "Credit Card",
    transactionId: "TXN-2025-010",
    status: "REFUNDED",
    description: "Refund for Villa Paradise booking",
    createdAt: "2025-11-20T09:00:00.000Z",
    booking: {
      house: { name: "Villa Paradise", city: "Bali" },
    },
  },
  {
    id: "clpay004",
    userId: "cluser001",
    bookingId: "clbook001",
    amount: 310,
    currency: "USD",
    method: "Credit Card",
    transactionId: "TXN-2026-003",
    status: "PENDING",
    description: "Booking payment for House of Mormon",
    createdAt: "2026-03-10T10:00:00.000Z",
    booking: {
      house: { name: "House of Mormon", city: "Denpasar" },
    },
  },
  {
    id: "clpay005",
    userId: "cluser001",
    bookingId: "clbook005",
    amount: 320,
    currency: "USD",
    method: "Bank Transfer",
    transactionId: "TXN-2025-008",
    status: "COMPLETED",
    description: "Booking payment for Maharani Villa",
    createdAt: "2025-10-15T10:30:00.000Z",
    booking: {
      house: { name: "Maharani Villa", city: "Jakarta" },
    },
  },
];

// ─── REVIEWS ────────────────────────────────────────────

export const dummyReviews = [
  {
    id: "clrev001",
    userId: "cluser001",
    houseId: "clhouse003",
    bookingId: "clbook003",
    rating: 5,
    comment: "Amazing experience! The property was exactly as described and the host was incredibly welcoming.",
    createdAt: "2026-01-18T10:00:00.000Z",
    updatedAt: "2026-01-18T10:00:00.000Z",
    house: { name: "Bali Komang Guest", city: "Bali" },
    media: [],
  },
  {
    id: "clrev002",
    userId: "cluser001",
    houseId: "clhouse005",
    bookingId: "clbook005",
    rating: 4,
    comment: "Great villa with lovely gardens. The location is perfect for exploring Jakarta.",
    createdAt: "2025-11-12T10:00:00.000Z",
    updatedAt: "2025-11-12T10:00:00.000Z",
    house: { name: "Maharani Villa", city: "Jakarta" },
    media: [],
  },
];

// ─── RECENTLY VIEWED ────────────────────────────────────

export const dummyRecentlyViewed = [
  {
    id: "clview001",
    userId: "cluser001",
    houseId: "clhouse001",
    viewedAt: "2026-03-12T09:00:00.000Z",
    house: houseToCard(dummyHouses[0]),
  },
  {
    id: "clview002",
    userId: "cluser001",
    houseId: "clhouse004",
    viewedAt: "2026-03-12T08:30:00.000Z",
    house: houseToCard(dummyHouses[3]),
  },
  {
    id: "clview003",
    userId: "cluser001",
    houseId: "clhouse003",
    viewedAt: "2026-03-11T15:00:00.000Z",
    house: houseToCard(dummyHouses[2]),
  },
  {
    id: "clview004",
    userId: "cluser001",
    houseId: "clhouse006",
    viewedAt: "2026-03-10T12:00:00.000Z",
    house: houseToCard(dummyHouses[5]),
  },
  {
    id: "clview005",
    userId: "cluser001",
    houseId: "clhouse009",
    viewedAt: "2026-03-09T10:00:00.000Z",
    house: houseToCard(dummyHouses[8]),
  },
  {
    id: "clview006",
    userId: "cluser001",
    houseId: "clhouse002",
    viewedAt: "2026-03-08T14:00:00.000Z",
    house: houseToCard(dummyHouses[1]),
  },
];

// ─── FAVORITES ──────────────────────────────────────────

export const dummyFavorites = [
  {
    id: "clfav001",
    userId: "cluser001",
    houseId: "clhouse001",
    createdAt: "2026-03-01T10:00:00.000Z",
    house: dummyHouses[0],
  },
  {
    id: "clfav002",
    userId: "cluser001",
    houseId: "clhouse004",
    createdAt: "2026-02-25T10:00:00.000Z",
    house: dummyHouses[3],
  },
];

// ─── OWNER-SPECIFIC DATA ────────────────────────────────

// Houses owned by the owner (for owner dashboard)
export const ownerHouses = dummyHouses.filter(h => h.agentId === "clagent001").map(house => ({
  ...house,
  agent: dummyUsers.owner,
}));

// Bookings received by the owner for their properties
export const ownerBookings = [
  {
    ...dummyBookings[0],
    user: dummyUsers.user,
  },
  {
    id: "clbook006",
    userId: "cluser001",
    houseId: "clhouse004",
    agentId: "clowner001",
    checkIn: "2026-05-01T14:00:00.000Z",
    checkOut: "2026-05-10T11:00:00.000Z",
    totalAmount: 450,
    status: "PENDING",
    paymentStatus: "PENDING",
    notes: "Family vacation",
    createdAt: "2026-03-12T08:00:00.000Z",
    updatedAt: "2026-03-12T08:00:00.000Z",
    house: {
      id: "clhouse004",
      name: "Villa Paradise",
      address: "Jl. Sunset Road No. 88",
      city: "Bali",
      area: "Seminyak",
      images: [{ url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800" }],
    },
    user: dummyUsers.user,
  },
  {
    id: "clbook007",
    userId: "cluser001",
    houseId: "clhouse009",
    agentId: "clowner001",
    checkIn: "2026-02-15T14:00:00.000Z",
    checkOut: "2026-02-22T11:00:00.000Z",
    totalAmount: 550,
    status: "COMPLETED",
    paymentStatus: "COMPLETED",
    notes: null,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-22T10:00:00.000Z",
    house: {
      id: "clhouse009",
      name: "Sky Residence",
      address: "SCBD Lot 5, Jakarta",
      city: "Jakarta",
      area: "SCBD",
      images: [{ url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800" }],
    },
    user: dummyUsers.user,
  },
];

// Owner reviews (reviews on owner's properties)
export const ownerReviews = [
  {
    id: "clrev003",
    userId: "cluser001",
    houseId: "clhouse001",
    bookingId: "clbook001",
    rating: 5,
    comment: "Wonderful experience. The property exceeded our expectations!",
    createdAt: "2026-02-15T10:00:00.000Z",
    user: { name: "Test User", avatar: null, username: "testuser" },
    house: { name: "House of Mormon", city: "Denpasar" },
  },
  {
    id: "clrev004",
    userId: "cluser001",
    houseId: "clhouse004",
    bookingId: "clbook002",
    rating: 4,
    comment: "Great villa with amazing views. Would recommend!",
    createdAt: "2026-01-20T10:00:00.000Z",
    user: { name: "Test User", avatar: null, username: "testuser" },
    house: { name: "Villa Paradise", city: "Bali" },
  },
  {
    id: "clrev005",
    userId: "cluser001",
    houseId: "clhouse009",
    bookingId: "clbook007",
    rating: 5,
    comment: "Absolutely stunning! Best stay ever.",
    createdAt: "2026-02-23T10:00:00.000Z",
    user: { name: "Test User", avatar: null, username: "testuser" },
    house: { name: "Sky Residence", city: "Jakarta" },
  },
];

// Owner earnings summary
export const ownerEarnings = {
  totalEarnings: 4520,
  thisMonth: 760,
  lastMonth: 1230,
  pendingPayouts: 450,
  completedPayouts: 4070,
  transactions: [
    {
      id: "clearn001",
      amount: 310,
      status: "COMPLETED",
      description: "Booking - House of Mormon",
      createdAt: "2026-03-10T10:00:00.000Z",
    },
    {
      id: "clearn002",
      amount: 450,
      status: "PENDING",
      description: "Booking - Villa Paradise",
      createdAt: "2026-03-12T08:00:00.000Z",
    },
    {
      id: "clearn003",
      amount: 550,
      status: "COMPLETED",
      description: "Booking - Sky Residence",
      createdAt: "2026-02-22T10:00:00.000Z",
    },
    {
      id: "clearn004",
      amount: 310,
      status: "COMPLETED",
      description: "Booking - Sunset Apartment",
      createdAt: "2026-02-05T10:00:00.000Z",
    },
  ],
};

// Owner conversation: messages from tenants about their properties
export const ownerConversations = dummyConversations.map(conv => ({
  ...conv,
  // In owner context, the "agent" is the owner, and the other party is the user/tenant
  tenant: dummyUsers.user,
}));

// ═══════════════════════════════════════════════════════════
// SCREEN-READY DATA (transformed from backend format above)
// When connecting backend, API responses will be in the same
// format as the exports above — just apply the SAME transforms.
// ═══════════════════════════════════════════════════════════

// ─── Chat screen format ─────────────────────────────────

const formatTimestamp = (isoString) => {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const chatConversations = dummyConversations.map((conv) => ({
  id: conv.id,
  name: conv.agent.name,
  role: conv.agent.role === "AGENT" ? "Real Estate Agent" : "Property Owner",
  avatar: conv.agent.avatar,
  lastMessage: conv.lastMessage?.content || "",
  timestamp: formatTimestamp(conv.lastMessage?.createdAt || conv.updatedAt),
  unread: conv.unreadCount,
  online: conv.online,
}));

export const chatMessages = {};
Object.keys(dummyMessages).forEach((convId) => {
  chatMessages[convId] = dummyMessages[convId].map((msg) => ({
    id: msg.id,
    senderId: msg.senderId,
    text: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isMe: msg.senderId === "cluser001",
  }));
});

// ─── Notifications screen format ────────────────────────

const notifTypeMap = {
  BOOKING_CONFIRMED: { icon: "checkmark-circle", iconColor: "#4CAF50", filterType: "booking" },
  PAYMENT_SUCCESS: { icon: "card", iconColor: "#7B61FF", filterType: "payment" },
  NEW_MESSAGE: { icon: "chatbubble-ellipses", iconColor: "#2196F3", filterType: "message" },
  GENERAL: { icon: "notifications", iconColor: "#FF9800", filterType: "promo" },
  REVIEW_POSTED: { icon: "star", iconColor: "#FFC42D", filterType: "review" },
};

export const notificationsScreenData = dummyNotifications.map((n) => {
  const typeInfo = notifTypeMap[n.type] || { icon: "notifications", iconColor: "#9E9E9E", filterType: "promo" };
  return {
    id: n.id,
    type: typeInfo.filterType,
    title: n.title,
    message: n.message,
    timestamp: n.createdAt,
    isRead: n.isRead,
    icon: typeInfo.icon,
    iconColor: typeInfo.iconColor,
    propertyImage: n.data?.houseId
      ? (propertiesDetailMap[n.data.houseId]?.images?.[0] || undefined)
      : undefined,
  };
});

// ─── Payment History screen format ──────────────────────

export const paymentHistoryScreenData = dummyPayments.map((p) => ({
  id: p.id,
  propertyName: p.booking?.house?.name || p.description,
  propertyImage:
    propertiesDetailMap[
      dummyBookings.find((b) => b.id === p.bookingId)?.houseId
    ]?.images?.[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
  amount: p.amount,
  date: new Date(p.createdAt).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }),
  status: p.status.toLowerCase(),
  paymentMethod: p.method,
  transactionId: p.transactionId,
}));

// ─── Recently Viewed screen format ──────────────────────

export const recentlyViewedScreenData = dummyRecentlyViewed.map((rv) => ({
  id: rv.house.id,
  name: rv.house.name,
  location: rv.house.location,
  price: rv.house.price,
  rating: rv.house.rating,
  image: rv.house.image,
  viewedAt: rv.viewedAt,
  type: rv.house.propertyType
    ? rv.house.propertyType.charAt(0).toUpperCase() + rv.house.propertyType.slice(1).toLowerCase()
    : "House",
}));

// ─── My Booking screen format ───────────────────────────

const formatBookingDateRange = (checkIn, checkOut) => {
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  const opts = { day: "2-digit", month: "short" };
  return `${ci.toLocaleDateString("en-US", opts)} - ${co.toLocaleDateString("en-US", opts)}`;
};

const mapBookingStatus = (status, paymentStatus) => {
  if (status === "CANCELLED") return "cancelled";
  if (status === "COMPLETED") return "completed";
  if (paymentStatus === "PENDING") return "waiting_payment";
  if (status === "CONFIRMED") return "checkin";
  return "waiting_payment";
};

export const upcomingBookings = dummyBookings
  .filter((b) => b.status === "PENDING" || b.status === "CONFIRMED")
  .map((b) => ({
    id: b.id,
    name: b.house?.name || "Property",
    location: `${b.house?.city || ""}`,
    dateRange: formatBookingDateRange(b.checkIn, b.checkOut),
    status: mapBookingStatus(b.status, b.paymentStatus),
    image: b.house?.images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    agent: b.agent,
    totalAmount: b.totalAmount,
    houseId: b.houseId,
  }));

export const completedBookings = dummyBookings
  .filter((b) => b.status === "COMPLETED")
  .map((b) => ({
    id: b.id,
    name: b.house?.name || "Property",
    location: `${b.house?.city || ""}`,
    dateRange: formatBookingDateRange(b.checkIn, b.checkOut),
    status: "completed",
    image: b.house?.images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    agent: b.agent,
    totalAmount: b.totalAmount,
    houseId: b.houseId,
  }));

export const cancelledBookings = dummyBookings
  .filter((b) => b.status === "CANCELLED")
  .map((b) => ({
    id: b.id,
    name: b.house?.name || "Property",
    location: `${b.house?.city || ""}`,
    dateRange: formatBookingDateRange(b.checkIn, b.checkOut),
    status: "cancelled",
    image: b.house?.images?.[0]?.url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    agent: b.agent,
    totalAmount: b.totalAmount,
    houseId: b.houseId,
  }));

// ─── Search screen format ───────────────────────────────

export const searchResults = allProperties.slice(0, 5).map((p) => ({
  id: p.id,
  name: p.name,
  location: p.location,
}));

// ─── Popular / Recommended / Nearby screen-ready format ─

export const popularPropertiesScreen = dummyHouses.slice(0, 6).map((house) => ({
  id: house.id,
  name: house.name,
  location: `${house.area}, ${house.city}`,
  price: house.rentPerMonth || house.pricePerNight || 0,
  priceType: house.pricePerNight ? "night" : "month",
  rating: house.rating,
  image: house.images[0]?.url || "",
  isFavorite: house.isFavorite || false,
}));

export const recommendedPropertiesScreen = dummyHouses.slice(0, 5).map((house) => ({
  id: house.id,
  name: house.name,
  location: `${house.area}, ${house.city}`,
  price: house.rentPerMonth || house.pricePerNight || 0,
  rating: house.rating,
  image: house.images[0]?.url || "",
  isFavorite: house.isFavorite || false,
}));

export const nearbyPropertiesScreen = dummyHouses.slice(4, 10).map((house) => ({
  id: house.id,
  name: house.name,
  location: `${house.area}, ${house.city}`,
  price: house.rentPerMonth || house.pricePerNight || 0,
  rating: house.rating,
  image: house.images[0]?.url || "",
  isFavorite: house.isFavorite || false,
}));

// ─── Top Locations screen-ready format ──────────────────

export const topLocationsScreen = topLocations;
