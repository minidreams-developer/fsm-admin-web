import { Bell, Calendar, Menu } from "lucide-react";
import type { FC } from "react";

type AppHeaderProps = {
  onMenuClick?: () => void;
  onSidebarToggle?: () => void;
};

export const AppHeader: FC<AppHeaderProps> = ({ onMenuClick, onSidebarToggle }) => {
  return (
    <header className="bg-card border-b border-border shrink-0 px-4 sm:px-6 py-3 sm:py-0">
      <div className="min-h-10 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden md:flex p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-medium">Today, Mar 7</span>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </button>
        </div>
      </div>
    </header>
  );
};
