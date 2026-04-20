import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusType = "booking" | "payment" | "house" | "role";

interface StatusBadgeProps {
  type: StatusType;
  value: string;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === "booking" || type === "payment") {
      switch (value) {
        case "PENDING":
          return "bg-amber-100 text-amber-800 hover:bg-amber-100";
        case "CONFIRMED":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "COMPLETED":
          return "bg-green-100 text-green-800 hover:bg-green-100";
        case "CANCELLED":
        case "FAILED":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        case "REFUNDED":
          return "bg-gray-100 text-gray-800 hover:bg-gray-100";
        default:
          return "";
      }
    }

    if (type === "house") {
      switch (value) {
        case "AVAILABLE":
          return "bg-green-100 text-green-800 hover:bg-green-100";
        case "UNAVAILABLE":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        default:
          return "";
      }
    }

    if (type === "role") {
      switch (value) {
        case "USER":
          return "bg-purple-100 text-purple-800 hover:bg-purple-100";
        case "AGENT":
          return "bg-orange-100 text-orange-800 hover:bg-orange-100";
        case "ADMIN":
          return "bg-red-100 text-red-800 hover:bg-red-100";
        default:
          return "";
      }
    }

    return "";
  };

  return (
    <Badge variant="secondary" className={cn(getVariant(), className)}>
      {value}
    </Badge>
  );
}
