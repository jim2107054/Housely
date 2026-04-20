import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Payment, Pagination } from "@/types";

interface PaymentFilters {
  status?: string;
  page: number;
}

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: ["admin-payments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      params.set("page", String(filters.page));
      params.set("limit", "20");
      const res = await api.get(`/api/admin/payments?${params}`);
      return res.data as { payments: Payment[]; pagination: Pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
