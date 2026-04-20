import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PlatformStats, SystemHealth, RevenuePoint, TopAgent, TopProperty } from "@/types";
import { toast } from "sonner";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/api/admin/stats");
      return res.data as PlatformStats;
    },
    staleTime: 30_000,
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await api.get("/api/admin/health");
      return res.data as SystemHealth;
    },
    refetchInterval: 60_000,
    staleTime: 60_000,
  });
}

export function useRevenue(period: "daily" | "monthly" | "yearly") {
  return useQuery({
    queryKey: ["admin-revenue", period],
    queryFn: async () => {
      const res = await api.get(`/api/admin/revenue?period=${period}`);
      return res.data.data as RevenuePoint[];
    },
    staleTime: 30_000,
  });
}

export function useTopAgents(limit = 5) {
  return useQuery({
    queryKey: ["top-agents", limit],
    queryFn: async () => {
      const res = await api.get(`/api/admin/top-agents?limit=${limit}`);
      return res.data.agents as TopAgent[];
    },
    staleTime: 30_000,
  });
}

export function useTopProperties(limit = 5) {
  return useQuery({
    queryKey: ["top-properties", limit],
    queryFn: async () => {
      const res = await api.get(`/api/admin/top-properties?limit=${limit}`);
      return res.data.properties as TopProperty[];
    },
    staleTime: 30_000,
  });
}
