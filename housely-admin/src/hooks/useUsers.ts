import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, Pagination } from "@/types";
import { toast } from "sonner";

interface UserFilters {
  role?: string;
  isVerified?: string;
  search?: string;
  page: number;
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.role) params.set("role", filters.role);
      if (filters.isVerified) params.set("isVerified", filters.isVerified);
      if (filters.search) params.set("search", filters.search);
      params.set("page", String(filters.page));
      params.set("limit", "20");
      const res = await api.get(`/api/admin/users?${params}`);
      return res.data as { users: User[]; pagination: Pagination };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => {
      const res = await api.get(`/api/admin/users/${id}`);
      return res.data.user as User;
    },
    enabled: !!id,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/api/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
      toast.success("Role updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update role");
    },
  });
}

export function useVerifyUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.patch(`/api/admin/users/${userId}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user"] });
      toast.success("Verification status updated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update verification");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });
}
