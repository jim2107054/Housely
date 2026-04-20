"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookings, useUpdateBookingStatus } from "@/hooks/useBookings";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { MoreHorizontal, Download } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Booking } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function BookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = {
    status: searchParams.get("status") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading } = useBookings(filters);
  const updateStatus = useUpdateBookingStatus();

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      if (key !== "page") params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );

  const handleStatusUpdate = (bookingId: string, status: string) => {
    updateStatus.mutate({ bookingId, status });
  };

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "house",
      header: "House",
      cell: ({ row }) => {
        const house = row.original.house;
        const mainImage = house.images?.[0]?.url;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={house.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{house.name}</p>
              <p className="text-sm text-gray-500 truncate">{house.city}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name, user.username)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{user.name || user.username}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "agent",
      header: "Agent",
      cell: ({ row }) => {
        const agent = row.original.house.agent;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={agent.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(agent.name, agent.username)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{agent.name || agent.username}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "dates",
      header: "Dates",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="text-sm">
            <div>{formatDate(booking.checkIn)}</div>
            <div className="text-gray-500">{formatDate(booking.checkOut)}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const start = new Date(row.original.checkIn);
        const end = new Date(row.original.checkOut);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return <span className="text-sm">{days} days</span>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => <span className="font-medium">{formatCurrency(row.original.totalAmount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="booking" value={row.original.status} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => {
        const payment = row.original.payments?.[0];
        return payment ? (
          <StatusBadge type="payment" value={payment.status} />
        ) : (
          <Badge variant="secondary" className="text-xs">No Payment</Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/bookings/${booking.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Force Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "PENDING")}>
                    PENDING
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}>
                    CONFIRMED
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}>
                    COMPLETED
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}>
                    CANCELLED
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate summary stats
  const summary = data?.bookings.reduce(
    (acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Bookings Management"
        description="Manage all property bookings"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Summary Stats */}
      {summary && (
        <div className="mb-6 flex gap-4">
          <Badge variant="outline" className="px-4 py-2">
            Pending: {summary.PENDING || 0}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Confirmed: {summary.CONFIRMED || 0}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Completed: {summary.COMPLETED || 0}
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            Cancelled: {summary.CANCELLED || 0}
          </Badge>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={!filters.status ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "")}
        >
          All
        </Button>
        <Button
          variant={filters.status === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "PENDING")}
        >
          Pending
        </Button>
        <Button
          variant={filters.status === "CONFIRMED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "CONFIRMED")}
        >
          Confirmed
        </Button>
        <Button
          variant={filters.status === "COMPLETED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "COMPLETED")}
        >
          Completed
        </Button>
        <Button
          variant={filters.status === "CANCELLED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("status", "CANCELLED")}
        >
          Cancelled
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.bookings || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilter("page", String(page))}
      />
    </div>
  );
}
