export interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  role: "USER" | "AGENT" | "ADMIN";
  avatar: string | null;
  isVerified: boolean;
  phoneNumber: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  _count?: { houses: number; bookings: number; reviews: number };
}

export interface House {
  id: string;
  name: string;
  city: string;
  area: string | null;
  address: string;
  status: "AVAILABLE" | "UNAVAILABLE";
  listingType: "RENT" | "SALE";
  propertyType: "APARTMENT" | "PENTHOUSE" | "HOTEL" | "VILLA" | "STUDIO" | "DUPLEX" | "TOWNHOUSE" | "CONDO";
  rentPerMonth: number | null;
  salePrice: number | null;
  bedrooms: number;
  bathrooms: number;
  sizeInSqft: number | null;
  buildYear: number | null;
  hasWifi: boolean;
  hasWater: boolean;
  createdAt: string;
  agent: { id: string; username: string; name: string | null; avatar: string | null };
  images: { url: string; order: number }[];
  _count: { bookings: number; reviews: number; views: number; favorites: number };
}

export interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  notes: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null; email: string; phoneNumber: string | null };
  agent: { id: string; username: string; name: string | null; avatar: string | null; email: string };
  house: { id: string; name: string; city: string; images: { url: string }[]; agent: { id: string; username: string; name: string | null; avatar: string | null; email: string } };
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string | null;
  transactionId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  description: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; email: string };
  booking: { id: string; house: { id: string; name: string } } | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { id: string; username: string; name: string | null; avatar: string | null };
  house: { id: string; name: string; city: string; agent: { id: string; username: string; name: string | null } };
  media: { id: string; url: string; type: string }[];
}

export interface PlatformStats {
  totalUsers: number;
  totalAgents: number;
  totalHouses: number;
  availableHouses: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  totalReviews: number;
  avgRating: number;
  totalMessages: number;
  totalConversations: number;
}

export interface SystemHealth {
  database: "connected" | "error";
  newUsersThisWeek: number;
  newHousesThisWeek: number;
  newBookingsThisWeek: number;
  pendingBookings: number;
  unreadNotifications: number;
}

export interface RevenuePoint { 
  date: string; 
  revenue: number; 
}

export interface TopAgent {
  id: string; 
  username: string; 
  name: string | null; 
  avatar: string | null; 
  email: string;
  housesCount: number; 
  bookingsCount: number; 
  totalRevenue: number; 
  avgRating: number;
}

export interface TopProperty {
  id: string; 
  name: string; 
  city: string; 
  listingType: string; 
  propertyType: string;
  rentPerMonth: number | null; 
  salePrice: number | null; 
  status: string;
  agent: { id: string; username: string; name: string | null };
  viewCount: number; 
  bookingCount: number; 
  favoriteCount: number; 
  avgRating: number;
}

export interface Pagination {
  page: number; 
  limit: number; 
  total: number; 
  totalPages: number;
}

export type Role = "USER" | "AGENT" | "ADMIN";
export type HouseStatus = "AVAILABLE" | "UNAVAILABLE";
export type ListingType = "RENT" | "SALE";
export type PropertyType = "APARTMENT" | "PENTHOUSE" | "HOTEL" | "VILLA" | "STUDIO" | "DUPLEX" | "TOWNHOUSE" | "CONDO";
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type NotificationType = "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "PAYMENT_SUCCESS" | "NEW_MESSAGE" | "REVIEW_POSTED" | "GENERAL";
