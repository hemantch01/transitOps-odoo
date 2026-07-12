import { useDashboard } from "../hooks/useAnalytics";
import { Truck, Users, Route, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { RTO_REGIONS, VEHICLE_TYPES } from "../../../shared/schemas/vehicle";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  gradient: string;
  iconBg: string;
  subtitle?: string;
  borderColor: string;
}

function StatCard({ title, value, icon: Icon, gradient, iconBg, subtitle, borderColor }: StatCardProps) {
  return (
    <div className={cn("card p-5 animate-slide-up", borderColor)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl shadow-sm", iconBg)}>
          <Icon className={cn("h-6 w-6", gradient)} />
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
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
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Fleet overview & key metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input max-w-[160px]"
          >
            <option value="">all types</option>
            {VEHICLE_TYPES.map((t) => (
              <option key={t} value={t}>{t.toLowerCase()}</option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="input max-w-[200px]"
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
        <StatCard
          title="Total Vehicles"
          value={kpis.vehicles.total}
          icon={Truck}
          gradient="text-violet-600"
          iconBg="bg-violet-100"
          borderColor="card-purple"
          subtitle={`${kpis.vehicles.available} available`}
        />
        <StatCard
          title="Active Drivers"
          value={kpis.drivers.total}
          icon={Users}
          gradient="text-amber-600"
          iconBg="bg-amber-100"
          borderColor="card-amber"
          subtitle={`${kpis.drivers.onDuty} on duty`}
        />
        <StatCard
          title="Active Trips"
          value={kpis.trips.active}
          icon={Route}
          gradient="text-emerald-600"
          iconBg="bg-emerald-100"
          borderColor="card-green"
          subtitle={`${kpis.trips.pending} pending`}
        />
        <StatCard
          title="Fleet Utilization"
          value={`${kpis.fleetUtilization}%`}
          icon={TrendingUp}
          gradient="text-indigo-600"
          iconBg="bg-indigo-100"
          borderColor="card-indigo"
        />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* fleet status pie */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-700">Fleet Status</h3>
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
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {vehicleChart.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* trip status bar */}
        <div className="card p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-700">Trip Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tripChart}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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
