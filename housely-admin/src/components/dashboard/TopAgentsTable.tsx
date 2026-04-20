import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, getInitials } from "@/lib/utils";
import { TopAgent } from "@/types";
import { Star } from "lucide-react";

interface TopAgentsTableProps {
  agents: TopAgent[];
}

export function TopAgentsTable({ agents }: TopAgentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={agent.avatar || undefined} />
                  <AvatarFallback>{getInitials(agent.name, agent.username)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{agent.name || agent.username}</p>
                  <p className="text-xs text-gray-500">{agent.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(agent.totalRevenue)}</p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span>{agent.housesCount} properties</span>
                  <span>•</span>
                  <span>{agent.bookingsCount} bookings</span>
                  {agent.avgRating > 0 && (
                    <>
                      <span>•</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline" />
                      <span>{agent.avgRating.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
