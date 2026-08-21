import { LucideIcon } from "lucide-react";

interface ActionItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive";
  dividerBefore?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export function ActionDropdown({ actions }: ActionDropdownProps) {
  return (
    <div className="absolute right-0 top-12 z-20 w-56 bg-card border border-border rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-2 duration-150">
      {actions.map((action, index) => (
        <div key={action.label}>
          {action.dividerBefore && (
            <div className="h-px bg-border mx-2 my-1" />
          )}

          <button
            type="button"
            onClick={action.onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
              action.variant === "destructive"
                ? "text-destructive hover:bg-destructive/10"
                : "text-card-foreground hover:bg-secondary"
            }`}
          >
            <action.icon
              className={`w-4 h-4 ${
                action.variant === "destructive"
                  ? ""
                  : "text-muted-foreground"
              }`}
            />

            {action.label}
          </button>
        </div>
      ))}
    </div>
  );
}