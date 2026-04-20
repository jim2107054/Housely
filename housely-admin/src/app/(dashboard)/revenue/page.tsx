"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRevenue, useAdminStats } from "@/hooks/useAdminStats";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Star } from "lucide-react";

type Period = "daily" | "monthly" | "yearly";

export default function RevenuePage() {
  const [period, setPeriod] = useState<Period>("monthly");
  const { data: revenueData, isLoading } = useRevenue(period);
  const { data: stats } = useAdminStats();

  return (
    <div className="p-8">
      <PageHeader
        title="Revenue Analytics"
        description="Track revenue trends and performance"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600">Total Revenue</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats ? formatCurrency(stats.totalRevenue) : "—"}
            </div>
            <p className="text-sm text-gray-600 mt-1 font-medium">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.thisMonthRevenue) : "—"}
            </div>
            <p className="text-xs text-green-600 mt-1">Current month revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.avgRating.toFixed(2) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Platform average</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            <TabsContent value={period}>
              {isLoading || !revenueData ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7F56D9" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7F56D9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#7F56D9"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Revenue Table */}
      {revenueData && revenueData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Period</th>
                    <th className="text-right py-3 px-4 font-medium">Revenue</th>
                    <th className="text-right py-3 px-4 font-medium">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.map((item, index) => {
                    const totalRevenue = revenueData.reduce((sum, i) => sum + i.revenue, 0);
                    const percentage = ((item.revenue / totalRevenue) * 100).toFixed(1);
                    return (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 px-4">{item.date}</td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
