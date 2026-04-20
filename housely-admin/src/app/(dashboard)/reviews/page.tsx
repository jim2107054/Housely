"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews, useDeleteReview } from "@/hooks/useReviews";
import { getInitials, formatRelative } from "@/lib/utils";
import { Star, Trash2, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { PaginationControls } from "@/components/shared/PaginationControls";

export default function ReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const minRating = searchParams.get("minRating");
  const maxRating = searchParams.get("maxRating");

  const filters = {
    minRating: minRating ? Number(minRating) : undefined,
    maxRating: maxRating ? Number(maxRating) : undefined,
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading } = useReviews(filters);
  const deleteReview = useDeleteReview();

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

  const setRatingFilter = (rating: number | null) => {
    if (rating === null) {
      setFilter("minRating", "");
      setFilter("maxRating", "");
    } else {
      setFilter("minRating", String(rating));
      setFilter("maxRating", String(rating));
    }
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Reviews Management"
        description="Manage all property reviews and ratings"
        actions={
          <Button variant="outline" size="sm" onClick={() => toast.info("Export coming soon")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={!filters.minRating && !filters.maxRating ? "default" : "outline"}
          size="sm"
          onClick={() => setRatingFilter(null)}
        >
          All Ratings
        </Button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <Button
            key={rating}
            variant={filters.minRating === rating ? "default" : "outline"}
            size="sm"
            onClick={() => setRatingFilter(rating)}
          >
            {rating}★
          </Button>
        ))}
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.reviews && data.reviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {data.reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={review.user.avatar || undefined} />
                        <AvatarFallback>
                          {getInitials(review.user.name, review.user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user.name || review.user.username}</p>
                        <p className="text-sm text-gray-500">
                          {formatRelative(review.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Link href={`/properties/${review.house.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                      View Property <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                  </div>

                  {/* Property Info */}
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-sm">{review.house.name}</p>
                    <p className="text-xs text-gray-500">{review.house.city}</p>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}

                  {/* Media */}
                  {review.media && review.media.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.media.map((mediaUrl, i) => (
                        <div
                          key={i}
                          className="w-20 h-20 rounded overflow-hidden bg-gray-100 relative"
                        >
                          <Image
                            src={mediaUrl}
                            alt={`Review media ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t pt-4">
                  {/* Agent Info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={review.house.agent.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(review.house.agent.name, review.house.agent.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs text-gray-500">Agent</p>
                      <p className="text-sm font-medium">
                        {review.house.agent.name || review.house.agent.username}
                      </p>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <ConfirmDialog
                    trigger={
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    }
                    title="Delete Review"
                    description="Are you sure you want to delete this review? This action cannot be undone."
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => deleteReview.mutate(review.id)}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && (
            <PaginationControls
              pagination={data.pagination}
              onPageChange={(page) => setFilter("page", String(page))}
            />
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
