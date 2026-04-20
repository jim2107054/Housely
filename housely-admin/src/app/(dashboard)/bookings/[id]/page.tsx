"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useUpdateBookingStatus } from "@/hooks/useBookings";
import api from "@/lib/api";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { ArrowLeft, MapPin, Calendar, DollarSign, CreditCard } from "lucide-react";
import { Booking } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const updateStatus = useUpdateBookingStatus();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", params.id],
    queryFn: async () => {
      const response = await api.get<Booking>(`/api/admin/bookings/${params.id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Booking Details" description="Loading..." />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader title="Booking Not Found" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Booking not found or has been deleted.</p>
            <Button className="mt-4" onClick={() => router.push("/bookings")}>
              Back to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusUpdate = (status: string) => {
    updateStatus.mutate({ bookingId: booking.id, status });
  };

  const startDate = new Date(booking.checkIn);
  const endDate = new Date(booking.checkOut);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div>
      <PageHeader
        title="Booking Details"
        description={`Booking #${booking.id.substring(0, 8)}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/bookings")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookings
          </Button>
        }
      />

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* User Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={booking.user.avatar || undefined} />
                <AvatarFallback>
                  {getInitials(booking.user.name, booking.user.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{booking.user.name || booking.user.username}</p>
                <p className="text-sm text-gray-500">@{booking.user.username}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">{booking.user.email}</p>
              {booking.user.phoneNumber && (
                <p className="text-gray-600">{booking.user.phoneNumber}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* House Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                {booking.house.images?.[0]?.url ? (
                  <Image
                    src={booking.house.images[0].url}
                    alt={booking.house.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <Link
                  href={`/properties/${booking.house.id}`}
                  className="font-medium hover:underline"
                >
                  {booking.house.name}
                </Link>
                <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{booking.house.city}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={booking.house.agent.avatar || undefined} />
                <AvatarFallback>
                  {getInitials(booking.house.agent.name, booking.house.agent.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {booking.house.agent.name || booking.house.agent.username}
                </p>
                <p className="text-sm text-gray-500">@{booking.house.agent.username}</p>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">{booking.house.agent.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Check-in</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{formatDate(booking.checkIn)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Check-out</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">{formatDate(booking.checkOut)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="font-medium">{duration} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-lg">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                  <StatusBadge type="booking" value={booking.status} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  {booking.payments && booking.payments.length > 0 ? (
                    <StatusBadge type="payment" value={booking.payments[0].status} />
                  ) : (
                    <span className="text-sm text-gray-500">No payment</span>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-500 mb-1">Booked on</p>
                <p className="font-medium">{formatDate(booking.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payments History */}
          {booking.payments && booking.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">{payment.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge type="payment" value={payment.status} />
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Admin Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("PENDING")}
                  disabled={updateStatus.isPending || booking.status === "PENDING"}
                  className="bg-amber-50 hover:bg-amber-100 border-amber-200"
                >
                  Set Pending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("CONFIRMED")}
                  disabled={updateStatus.isPending || booking.status === "CONFIRMED"}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("COMPLETED")}
                  disabled={updateStatus.isPending || booking.status === "COMPLETED"}
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  disabled={updateStatus.isPending || booking.status === "CANCELLED"}
                  className="bg-red-50 hover:bg-red-100 border-red-200"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Force update the booking status. This will override the current status.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
