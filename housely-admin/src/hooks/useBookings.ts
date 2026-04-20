import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Booking, Pagination } from "@/types";
import { toast } from "sonner";

interface BookingFilters {
  status?: string;
  page: number;
}

export function useBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: ["admin-bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      params.set("page", String(filters.page));
      params.set("limit", "20");
      const res = await api.get(`/api/admin/bookings?${params}`);
      return res.data as { bookings: Booking[]; pagination: Pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      api.patch(`/api/admin/bookings/${bookingId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("Booking status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
}
