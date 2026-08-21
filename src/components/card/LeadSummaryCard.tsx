import { LucideIcon } from "lucide-react";

interface LeadSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "warning" | "success" | "destructive";
}

const styles = {
  primary: {
    bg: "bg-primary/10",
    icon: "text-primary",
  },
  warning: {
    bg: "bg-warning/10",
    icon: "text-warning",
  },
  success: {
    bg: "bg-success/10",
    icon: "text-success",
  },
  destructive: {
    bg: "bg-destructive/10",
    icon: "text-destructive",
  },
};

export function LeadSummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: LeadSummaryCardProps) {
  const style = styles[color];

  return (
    <div className="bg-card rounded-xl p-5 card-shadow border border-border">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 ${style.bg} rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${style.icon}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            {title}
          </p>

          <p className="text-2xl font-bold text-card-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}