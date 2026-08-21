interface DetailFieldProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

export function DetailField({
  label,
  value,
  valueClassName = "text-lg font-bold text-card-foreground",
}: DetailFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>

      <p className={valueClassName}>
        {value}
      </p>
    </div>
  );
}