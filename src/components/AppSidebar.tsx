import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderKanban, Wrench, CreditCard,
  Package, UserCog, UserCircle, FileText, LogOut, Bug, Building2, Boxes, ChevronDown, Shield, CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import { useState } from "react";
import { logout } from "@/lib/auth";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Customers", icon: UserCircle, path: "/customers" },
  { label: "Employees", icon: UserCog, path: "/employees" },
  { label: "Enquiries", icon: Users, path: "/leads" },
  { label: "Service list", icon: Wrench, path: "/service-management" },
  { label: "Calendar", icon: CalendarDays, path: "/quant-calendar" },
  // { label: "Service Appointments", icon: Wrench, path: "/services" },
  
  { label: "Work Orders", icon: FolderKanban, path: "/projects" },
  { label: "Task Management", icon: FileText, path: "/task-management" },
  { label: "Payments", icon: CreditCard, path: "/payments" },
  // { label: "Role", icon: Shield, path: "/roles" },
  // { label: "Reports", icon: FileText, path: "/reports" },
];

const inventoryMenuItems = [
  { label: "Inventory", path: "/inventory" },
  { label: "Branches", path: "/branches" },
  { label: "Products", path: "/products" },
];

type AppSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  collapsed?: boolean;
};

export const AppSidebar: FC<AppSidebarProps> = ({ className, onNavigate, collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const isInventoryActive = ["/inventory", "/branches", "/products"].includes(location.pathname);

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} h-svh bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 ${className || ""}`}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(138.75deg, #942BF4 -42.53%, #1E2F96 94.59%)" }}>
          <Bug className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-primary">Easy Pest Control</h1>
            <p className="text-[10px] text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Inventory Manage Menu */}
        <div>
          <button
            onClick={() => setExpandedMenu(expandedMenu === "inventory" ? null : "inventory")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            title={collapsed ? "Inventory Manage" : undefined}
          >
            <Boxes className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Inventory Manage</span>}
            {!collapsed && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expandedMenu === "inventory" ? "-rotate-180" : ""}`}
              />
            )}
          </button>

          {!collapsed && expandedMenu === "inventory" && (
            <div className="mt-1 ml-3 space-y-1 border-l border-border pl-3">
              {inventoryMenuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">AK</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">Admin Kumar</p>
              <p className="text-[11px] text-muted-foreground">Branch Manager</p>
            </div>
          )}
          <button
            onClick={() => {
              logout();
              navigate("/");
              onNavigate?.();
            }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
