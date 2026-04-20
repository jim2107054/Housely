import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { House, Pagination } from "@/types";
import { toast } from "sonner";

interface PropertyFilters {
  status?: string;
  listingType?: string;
  city?: string;
  page: number;
}

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ["admin-properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.listingType) params.set("listingType", filters.listingType);
      if (filters.city) params.set("city", filters.city);
      params.set("page", String(filters.page));
      params.set("limit", "20");
      const res = await api.get(`/api/admin/houses?${params}`);
      return res.data as { houses: House[]; pagination: Pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useUpdatePropertyStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ houseId, status }: { houseId: string; status: string }) =>
      api.patch(`/api/admin/houses/${houseId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (houseId: string) =>
      api.delete(`/api/admin/houses/${houseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast.success("Property deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete property");
    },
  });
}
