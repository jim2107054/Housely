import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Review, Pagination } from "@/types";
import { toast } from "sonner";

interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  page: number;
}

export function useReviews(filters: ReviewFilters) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      if (filters.maxRating) params.set("maxRating", String(filters.maxRating));
      params.set("page", String(filters.page));
      params.set("limit", "20");
      const res = await api.get(`/api/admin/reviews?${params}`);
      return res.data as { reviews: Review[]; pagination: Pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) =>
      api.delete(`/api/admin/reviews/${reviewId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });
}
