import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  navigateTo?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = "neutral",
  navigateTo
}: DashboardCardProps) {

  const navigate = useNavigate();
  const handleNavigate = () => {
    // Implement navigation logic here, e.g., using react-router's useNavigate
    navigate(navigateTo);
  }
  return (
    <Card className={`shadow-card hover:shadow-card-hover transition-shadow duration-200 animate-fade-in ${navigateTo ? "cursor-pointer" : ""}`} onClick={handleNavigate}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium",
                  changeType === "positive" && "text-green-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
