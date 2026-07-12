import { useDashboard } from "../hooks/useAnalytics";
import { Truck, Users, Route, Wrench, TrendingUp, Fuel } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { useState } from "react";
import { RTO_REGIONS, VEHICLE_TYPES } from "../../../shared/schemas/vehicle";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#a855f7", "#f59e0b", "#22c55e", "#ef4444", "#6b7280"];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:shadow-md dark:border-dark-border dark:bg-dark-surface animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{title}</p>
          <p className="mt-1 text-2xl font-bold text-text-primary dark:text-dark-text-primary">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-text-muted dark:text-dark-text-muted">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [typeFilter, setTypeFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const { data, isLoading } = useDashboard({ type: typeFilter, region: regionFilter });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const kpis = data?.data;
  if (!kpis) return null;

  const vehicleChart = [
    { name: "Available", value: kpis.vehicles.available },
    { name: "On Trip", value: kpis.vehicles.onTrip },
    { name: "In Shop", value: kpis.vehicles.inShop },
    { name: "Retired", value: kpis.vehicles.retired },
  ].filter((d) => d.value > 0);

  const tripChart = [
    { name: "Pending", value: kpis.trips.pending },
    { name: "Active", value: kpis.trips.active },
    { name: "Completed", value: kpis.trips.completed },
    { name: "Cancelled", value: kpis.trips.cancelled },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary"
          >
            <option value="">all types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{t.toLowerCase()}</option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary"
          >
            <option value="">all regions</option>
            {RTO_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>{r.code} — {r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* kpi cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Vehicles" value={kpis.vehicles.total} icon={Truck} color="gradient-primary" subtitle={`${kpis.vehicles.available} available`} />
        <StatCard title="Active Drivers" value={kpis.drivers.total} icon={Users} color="bg-accent-500" subtitle={`${kpis.drivers.onDuty} on duty`} />
        <StatCard title="Active Trips" value={kpis.trips.active} icon={Route} color="bg-success" subtitle={`${kpis.trips.pending} pending`} />
        <StatCard title="Fleet Utilization" value={`${kpis.fleetUtilization}%`} icon={TrendingUp} color="bg-info" />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* fleet status pie */}
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 font-semibold text-text-primary dark:text-dark-text-primary">Fleet Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={vehicleChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={4}>
                {vehicleChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {vehicleChart.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-dark-text-secondary">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* trip status bar */}
        <div className="rounded-xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface">
          <h3 className="mb-4 font-semibold text-text-primary dark:text-dark-text-primary">Trip Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tripChart}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {tripChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
