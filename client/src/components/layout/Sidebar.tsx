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
import logo from "../../assets/logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", color: "text-violet-600", activeBg: "bg-violet-50", activeBorder: "border-l-violet-500" },
  { to: "/vehicles", icon: Truck, label: "Vehicles", color: "text-blue-600", activeBg: "bg-blue-50", activeBorder: "border-l-blue-500" },
  { to: "/drivers", icon: Users, label: "Drivers", color: "text-emerald-600", activeBg: "bg-emerald-50", activeBorder: "border-l-emerald-500" },
  { to: "/trips", icon: Route, label: "Trips", color: "text-amber-600", activeBg: "bg-amber-50", activeBorder: "border-l-amber-500" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance", color: "text-rose-600", activeBg: "bg-rose-50", activeBorder: "border-l-rose-500" },
  { to: "/fuel-expenses", icon: Fuel, label: "Fuel & Expenses", color: "text-orange-600", activeBg: "bg-orange-50", activeBorder: "border-l-orange-500" },
  { to: "/reports", icon: BarChart3, label: "Reports", color: "text-indigo-600", activeBg: "bg-indigo-50", activeBorder: "border-l-indigo-500" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-white border-r border-slate-200 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden">
          <img src={logo} alt="TransitOps" className="h-9 w-9 object-contain" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-slate-800 animate-fade-in">
            TransitOps
          </span>
        )}
      </div>

      {/* nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? `${item.activeBg} ${item.color} border-l-4 ${item.activeBorder} shadow-sm`
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
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
        className="m-3 flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
