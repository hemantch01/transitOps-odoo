import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/vehicles", icon: Truck, label: "Vehicles" },
  { to: "/drivers", icon: Users, label: "Drivers" },
  { to: "/trips", icon: Route, label: "Trips" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/fuel-expenses", icon: Fuel, label: "Fuel & Expenses" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
        "dark:border-dark-border dark:bg-dark-surface",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4 dark:border-dark-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
          <Truck className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight animate-fade-in">
            TransitOps
          </span>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-primary-50 hover:text-primary-700",
                "dark:hover:bg-primary-900/20 dark:hover:text-primary-300",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                  : "text-text-secondary dark:text-dark-text-secondary",
                collapsed && "justify-center px-2"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-2 flex items-center justify-center rounded-lg border border-border p-2 text-text-secondary transition-colors hover:bg-surface-hover dark:border-dark-border dark:text-dark-text-secondary dark:hover:bg-dark-surface-hover"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
