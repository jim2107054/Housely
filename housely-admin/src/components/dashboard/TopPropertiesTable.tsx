import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TopProperty } from "@/types";
import { Eye, Heart, Calendar, Star } from "lucide-react";

interface TopPropertiesTableProps {
  properties: TopProperty[];
}

export function TopPropertiesTable({ properties }: TopPropertiesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Properties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="flex items-start justify-between border-b pb-3 last:border-0">
              <div className="flex-1">
                <p className="font-medium">{property.name}</p>
                <p className="text-xs text-gray-500 mb-1">{property.city}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {property.propertyType}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      property.listingType === "RENT"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {property.listingType}
                  </Badge>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-semibold text-sm mb-1">
                  {property.listingType === "RENT"
                    ? formatCurrency(property.rentPerMonth || 0) + "/mo"
                    : formatCurrency(property.salePrice || 0)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {property.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {property.bookingCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {property.favoriteCount}
                  </span>
                  {property.avgRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {property.avgRating.toFixed(1)}
                    </span>
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
