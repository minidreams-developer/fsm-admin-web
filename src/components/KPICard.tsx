import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendType: "up" | "down" | "warning" | "neutral";
  icon: LucideIcon;
}

export function KPICard({ title, value, trend, trendType, icon: Icon }: KPICardProps) {
  const trendColor = {
    up: "text-success",
    down: "text-destructive",
    warning: "text-warning",
    neutral: "text-muted-foreground",
  }[trendType];

  return (
    <div className="h-full bg-card rounded-xl p-5 card-shadow hover:card-shadow-hover transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
  <Icon className="w-5 h-5 text-primary" />
</div>
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className={`text-xs font-medium mt-1 ${trendColor}`}>{trend}</p>
    </div>
  );
}
