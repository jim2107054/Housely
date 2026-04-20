"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  CreditCard,
  Star,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users },
  { title: "Properties", href: "/properties", icon: Home },
  { title: "Bookings", href: "/bookings", icon: Calendar },
  { title: "Payments", href: "/payments", icon: CreditCard },
  { title: "Reviews", href: "/reviews", icon: Star },
  { title: "Revenue", href: "/revenue", icon: TrendingUp },
  { title: "Notifications", href: "/notifications", icon: Bell },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-700 rounded-lg flex items-center justify-center shadow-md">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Housely</h1>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary-100 text-primary-700 border-0">
              Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold text-sm">
              {getInitials(session?.user?.name || null, session?.user?.email?.split("@")[0] || "A")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name || "Admin User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
