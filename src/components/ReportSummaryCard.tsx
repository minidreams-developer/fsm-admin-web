import { LucideIcon } from "lucide-react";

interface ReportSummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "destructive";
}

const colorStyles = {
  primary: {
    icon: "text-primary",
    bg: "bg-primary/10",
    value: "text-card-foreground",
  },
  success: {
    icon: "text-success",
    bg: "bg-success/10",
    value: "text-success",
  },
  warning: {
    icon: "text-warning",
    bg: "bg-warning/10",
    value: "text-warning",
  },
  destructive: {
    icon: "text-destructive",
    bg: "bg-destructive/10",
    value: "text-destructive",
  },
};

export function ReportSummaryCard({
  title,
  value,
  icon: Icon,
  color,
}: ReportSummaryCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-card rounded-xl p-4 card-shadow border border-border h-full">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.bg}`}
        >
          <Icon className={`w-4 h-4 ${styles.icon}`} />
        </div>

        <p className="text-xs text-muted-foreground">
          {title}
        </p>
      </div>

      <p className={`text-2xl font-bold ${styles.value}`}>
        {value}
      </p>
    </div>
  );
}