import { useReports } from "../hooks/useAnalytics";
import { formatCurrency } from "../lib/utils";
import { api } from "../lib/api";
import { downloadCSV } from "../lib/utils";
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";

export function Reports() {
  const { data, isLoading } = useReports();

  const handleExport = async () => {
    const blob = await api.get("/analytics/export/csv");
    downloadCSV(blob as Blob, "transitops-report.csv");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const vehicles = data?.data?.vehicles || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-400 mt-0.5">Analytics & vehicle performance</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-1.5">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* fuel efficiency chart */}
        <div className="card card-green p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-700">Fuel Efficiency (km/l)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicles.filter((v: any) => v.fuelEfficiency)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="registrationNumber" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="fuelEfficiency" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="km/l" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* cost breakdown chart */}
        <div className="card card-amber p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-700">Operational Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicles}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="registrationNumber" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="totalFuelCost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fuel Cost" stackId="cost" />
              <Bar dataKey="totalMaintenanceCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Maintenance Cost" stackId="cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* financial overview chart (side-by-side bars) */}
        <div className="card card-blue p-5 lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-slate-700">Financial Overview (Revenue vs Cost)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={vehicles}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="registrationNumber" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="operationalCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Total Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* vehicle ROI table */}
      <div className="card card-purple overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-700">Vehicle ROI</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Trips</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Distance (km)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Op. Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Fuel Eff.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">ROI %</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any, i: number) => (
                <tr key={v.vehicleId} className={`border-b border-slate-50 transition-colors hover:bg-violet-50/40 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                  <td className="px-4 py-3 font-medium text-slate-700">{v.registrationNumber}<br /><span className="text-xs text-slate-400">{v.name}</span></td>
                  <td className="px-4 py-3 text-slate-600">{v.totalTrips}</td>
                  <td className="px-4 py-3 text-slate-600">{v.totalDistance}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{formatCurrency(v.totalRevenue)}</td>
                  <td className="px-4 py-3 font-medium text-rose-500">{formatCurrency(v.operationalCost)}</td>
                  <td className="px-4 py-3 text-slate-600">{v.fuelEfficiency ? `${v.fuelEfficiency} km/l` : "—"}</td>
                  <td className={`px-4 py-3 font-semibold ${v.roi && v.roi > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {v.roi !== null ? `${v.roi}%` : "—"}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">no completed trips yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
