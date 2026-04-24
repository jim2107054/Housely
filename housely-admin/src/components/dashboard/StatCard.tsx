import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center shadow-md shadow-primary/30">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {trend && (
          <p className={cn(
            "text-sm font-medium flex items-center gap-1",
            trendUp ? "text-green-600" : "text-gray-600"
          )}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
