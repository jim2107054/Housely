"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { BookingStatusChart } from "@/components/dashboard/BookingStatusChart";
import { TopAgentsTable } from "@/components/dashboard/TopAgentsTable";
import { TopPropertiesTable } from "@/components/dashboard/TopPropertiesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminStats,
  useSystemHealth,
  useRevenue,
  useTopAgents,
  useTopProperties,
} from "@/hooks/useAdminStats";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { Users, Home, Calendar, DollarSign, RefreshCw, Database, Activity } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: revenueData, isLoading: revenueLoading } = useRevenue("monthly");
  const { data: topAgents, isLoading: agentsLoading } = useTopAgents(5);
  const { data: topProperties, isLoading: propertiesLoading } = useTopProperties(5);

  const handleRefresh = async () => {
    await refetchStats();
    setLastRefresh(new Date());
  };

  if (statsLoading || !stats) {
    return (
      <div className="p-8">
        <PageHeader title="Dashboard Overview" description="Loading your data..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard Overview"
        description={`Last updated: ${formatRelative(lastRefresh.toISOString())}`}
        actions={
          <Button variant="outline" size="default" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        }
      />

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend={`+${health?.newUsersThisWeek || 0} this week`}
          trendUp
        />
        <StatCard
          title="Total Properties"
          value={stats.totalHouses.toLocaleString()}
          icon={Home}
          trend={`${stats.availableHouses} available`}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={Calendar}
          trend={`${stats.pendingBookings} pending`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          trend={`${formatCurrency(stats.thisMonthRevenue)} this month`}
        />
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Agents" value={stats.totalAgents.toLocaleString()} icon={Users} />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toLocaleString()}
          icon={Activity}
          trend={`avg ${stats.avgRating.toFixed(1)}★`}
        />
        <StatCard
          title="Messages"
          value={stats.totalMessages.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          title="Conversations"
          value={stats.totalConversations.toLocaleString()}
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {revenueLoading || !revenueData ? (
          <Card className="col-span-2 border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <RevenueChart data={revenueData} />
        )}

        {statsLoading ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <BookingStatusChart stats={stats} />
        )}
      </div>

      {/* Top Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {agentsLoading || !topAgents ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ) : (
          <TopAgentsTable agents={topAgents} />
        )}

        {propertiesLoading || !topProperties ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ) : (
          <TopPropertiesTable properties={topProperties} />
        )}
      </div>

      {/* System Health Card */}
      {health && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Database className="w-5 h-5 text-primary" />
              System Health & Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">Database</span>
                <Badge
                  variant={health.database === "connected" ? "default" : "destructive"}
                  className="mt-1 w-fit shadow-sm"
                >
                  {health.database === "connected" ? "Connected" : "Error"}
                </Badge>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">New Users/Week</span>
                <span className="text-2xl font-bold text-gray-900">{health.newUsersThisWeek}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">New Properties/Week</span>
                <span className="text-2xl font-bold text-gray-900">{health.newHousesThisWeek}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">New Bookings/Week</span>
                <span className="text-2xl font-bold text-gray-900">{health.newBookingsThisWeek}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600 mb-2">Pending Bookings</span>
                <span className="text-2xl font-bold text-gray-900">{health.pendingBookings}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">Unread Notifications</span>
                <span className="text-lg font-semibold mt-1">{health.unreadNotifications}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
