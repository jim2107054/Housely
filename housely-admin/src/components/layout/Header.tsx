"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SystemHealth } from "@/types";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  const { data: health } = useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const res = await api.get("/api/admin/health");
      return res.data as SystemHealth;
    },
    refetchInterval: 60000,
    staleTime: 60000,
  });

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const isSystemHealthy = health?.database === "connected";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
      <div>
        {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
      </div>

      <div className="flex items-center gap-6">
        {/* System Health Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
          <div className="relative">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isSystemHealthy ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {isSystemHealthy && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping opacity-75" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {isSystemHealthy ? "System Online" : "System Issue"}
          </span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-primary/20">
                <AvatarImage src={session?.user?.image || undefined} />
                <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                  {getInitials(
                    session?.user?.name || null,
                    session?.user?.email?.split("@")[0] || "A"
                  )}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-semibold text-gray-900">{session?.user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
