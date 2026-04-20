"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProperties, useUpdatePropertyStatus, useDeleteProperty } from "@/hooks/useProperties";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Search, MoreHorizontal, Download, Eye, Heart, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { House } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function PropertiesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = {
    status: searchParams.get("status") || "",
    listingType: searchParams.get("listingType") || "",
    city: searchParams.get("city") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading } = useProperties(filters);
  const updateStatus = useUpdatePropertyStatus();
  const deleteProperty = useDeleteProperty();

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

  const columns: ColumnDef<House>[] = [
    {
      accessorKey: "property",
      header: "Property",
      cell: ({ row }) => {
        const house = row.original;
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
              <p className="text-sm text-gray-500 truncate">
                {house.city}
                {house.area && `, ${house.area}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "agent",
      header: "Agent",
      cell: ({ row }) => {
        const agent = row.original.agent;
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
      accessorKey: "propertyType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.propertyType}
        </Badge>
      ),
    },
    {
      accessorKey: "listingType",
      header: "Listing",
      cell: ({ row }) => {
        const type = row.original.listingType;
        return (
          <Badge
            variant="secondary"
            className={`text-xs ${
              type === "RENT" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
            }`}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const house = row.original;
        if (house.listingType === "RENT") {
          return (
            <span className="text-sm">
              {formatCurrency(house.rentPerMonth || 0)}
              <span className="text-gray-500">/mo</span>
            </span>
          );
        }
        return <span className="text-sm">{formatCurrency(house.salePrice || 0)}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge type="house" value={row.original.status} />,
    },
    {
      accessorKey: "stats",
      header: "Stats",
      cell: ({ row }) => {
        const house = row.original;
        return (
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {house._count.views}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {house._count.bookings}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {house._count.favorites}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const house = row.original;
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
                <Link href={`/properties/${house.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  updateStatus.mutate({
                    houseId: house.id,
                    status: house.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
                  })
                }
              >
                {house.status === "AVAILABLE" ? "Mark Unavailable" : "Mark Available"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={
                  <button className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-accent hover:text-red-700">
                    Delete Property
                  </button>
                }
                title="Delete Property"
                description={`Are you sure you want to delete ${house.name}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => deleteProperty.mutate(house.id)}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Properties Management"
        description="Manage all properties and listings"
        actions={
          <Button variant="outline" size="default" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export Properties
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by city..."
          value={filters.city}
          onChange={(e) => setFilter("city", e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button
            variant={!filters.status ? "default" : "outline"}
            size="default"
            onClick={() => setFilter("status", "")}
          >
            All
          </Button>
          <Button
            variant={filters.status === "AVAILABLE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("status", "AVAILABLE")}
          >
            Available
          </Button>
          <Button
            variant={filters.status === "UNAVAILABLE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("status", "UNAVAILABLE")}
          >
            Unavailable
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={!filters.listingType ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("listingType", "")}
          >
            All Types
          </Button>
          <Button
            variant={filters.listingType === "RENT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("listingType", "RENT")}
          >
            Rent
          </Button>
          <Button
            variant={filters.listingType === "SALE" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("listingType", "SALE")}
          >
            Sale
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data?.houses || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilter("page", String(page))}
      />
    </div>
  );
}
