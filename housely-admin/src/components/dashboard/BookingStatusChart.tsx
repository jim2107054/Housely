"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PlatformStats } from "@/types";

interface BookingStatusChartProps {
  stats: PlatformStats;
}

const COLORS = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  COMPLETED: "#10B981",
  CANCELLED: "#EF4444",
};

export function BookingStatusChart({ stats }: BookingStatusChartProps) {
  const data = [
    { name: "Pending", value: stats.pendingBookings },
    { name: "Confirmed", value: stats.confirmedBookings },
    { name: "Completed", value: stats.completedBookings },
    { name: "Cancelled", value: stats.cancelledBookings },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
