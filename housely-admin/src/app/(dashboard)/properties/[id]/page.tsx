"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useUpdatePropertyStatus, useDeleteProperty } from "@/hooks/useProperties";
import api from "@/lib/api";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  CheckCircle,
  Eye,
  Heart,
  Calendar,
  Star,
  Trash2,
} from "lucide-react";
import { House } from "@/types";
import Image from "next/image";

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const updateStatus = useUpdatePropertyStatus();
  const deleteProperty = useDeleteProperty();

  const { data: house, isLoading } = useQuery({
    queryKey: ["house", params.id],
    queryFn: async () => {
      const response = await api.get<House>(`/api/houses/${params.id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Property Details" description="Loading..." />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!house) {
    return (
      <div>
        <PageHeader title="Property Not Found" />
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Property not found or has been deleted.</p>
            <Button className="mt-4" onClick={() => router.push("/properties")}>
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteProperty.mutateAsync(house.id);
    router.push("/properties");
  };

  return (
    <div>
      <PageHeader
        title="Property Details"
        description={house.name}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/properties")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 gap-2 p-4">
                {house.images?.slice(0, 4).map((image, i) => (
                  <div
                    key={i}
                    className={`relative ${i === 0 ? "col-span-2 h-64" : "h-32"} rounded-lg overflow-hidden bg-gray-100`}
                  >
                    <Image
                      src={image.url}
                      alt={`${house.name} ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{house.name}</CardTitle>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {house.area && `${house.area}, `}{house.city}
                    </span>
                  </div>
                </div>
                <StatusBadge type="house" value={house.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{house.propertyType}</Badge>
                <Badge
                  variant="secondary"
                  className={
                    house.listingType === "RENT"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }
                >
                  {house.listingType}
                </Badge>
              </div>

              <div className="text-3xl font-bold">
                {house.listingType === "RENT"
                  ? `${formatCurrency(house.rentPerMonth || 0)}/mo`
                  : formatCurrency(house.salePrice || 0)}
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span>{house.bedrooms} Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span>{house.bathrooms} Baths</span>
                </div>
                {house.sizeInSqft && (
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5 text-gray-600" />
                    <span>{house.sizeInSqft} sqft</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed">{house.description}</p>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Statistics</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs">Views</span>
                    </div>
                    <p className="text-xl font-bold">{house._count.views}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Bookings</span>
                    </div>
                    <p className="text-xl font-bold">{house._count.bookings}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">Favorites</span>
                    </div>
                    <p className="text-xl font-bold">{house._count.favorites}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <Star className="w-4 h-4" />
                      <span className="text-xs">Reviews</span>
                    </div>
                    <p className="text-xl font-bold">{house._count.reviews}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          {house.facilities && house.facilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Facilities & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {house.facilities.map((facility, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {facility}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Card */}
          <Card>
            <CardHeader>
              <CardTitle>Property Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={house.agent.avatar || undefined} />
                  <AvatarFallback>
                    {getInitials(house.agent.name, house.agent.username)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{house.agent.name || house.agent.username}</p>
                  <p className="text-sm text-gray-500">{house.agent.email}</p>
                </div>
              </div>
              {house.agent.phoneNumber && (
                <div className="text-sm">
                  <span className="text-gray-600">Phone: </span>
                  <span className="font-medium">{house.agent.phoneNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  updateStatus.mutate({
                    houseId: house.id,
                    status: house.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
                  })
                }
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending
                  ? "Updating..."
                  : house.status === "AVAILABLE"
                  ? "Mark Unavailable"
                  : "Mark Available"}
              </Button>

              <Separator />

              <div className="pt-2">
                <p className="text-sm font-medium text-red-600 mb-2">Danger Zone</p>
                <ConfirmDialog
                  trigger={
                    <Button variant="destructive" size="sm" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Property
                    </Button>
                  }
                  title="Delete Property"
                  description={`This will permanently delete ${house.name}, all bookings, and reviews. This action cannot be undone.`}
                  confirmLabel="Delete"
                  variant="destructive"
                  onConfirm={handleDelete}
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Listed on</p>
                <p className="font-medium">{formatDate(house.createdAt)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Last updated</p>
                <p className="font-medium">{formatDate(house.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
