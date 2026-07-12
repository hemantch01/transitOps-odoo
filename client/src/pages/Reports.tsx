import { useReports } from "../hooks/useAnalytics";
import { formatCurrency } from "../lib/utils";
import { api } from "../lib/api";
import { downloadCSV } from "../lib/utils";
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const vehicles = data?.data?.vehicles || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Reports</h1>
        <button onClick={handleExport} className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
          <Download className="h-4 w-4" /> export CSV
        </button>
      </div>

      {/* fuel efficiency chart */}
      <div className="rounded-xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface">
        <h3 className="mb-4 font-semibold text-text-primary dark:text-dark-text-primary">Fuel Efficiency (km/l)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicles.filter((v: any) => v.fuelEfficiency)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="registrationNumber" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="fuelEfficiency" fill="#a855f7" radius={[6, 6, 0, 0]} name="km/l" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* cost breakdown chart */}
      <div className="rounded-xl border border-border bg-surface p-5 dark:border-dark-border dark:bg-dark-surface">
        <h3 className="mb-4 font-semibold text-text-primary dark:text-dark-text-primary">Operational Cost Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicles}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="registrationNumber" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Bar dataKey="totalFuelCost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fuel Cost" stackId="cost" />
            <Bar dataKey="totalMaintenanceCost" fill="#ef4444" radius={[4, 4, 0, 0]} name="Maintenance Cost" stackId="cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* vehicle ROI table */}
      <div className="rounded-xl border border-border bg-surface dark:border-dark-border dark:bg-dark-surface">
        <div className="border-b border-border px-5 py-3 dark:border-dark-border">
          <h3 className="font-semibold text-text-primary dark:text-dark-text-primary">Vehicle ROI</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-secondary dark:border-dark-border dark:bg-dark-surface-secondary">
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Trips</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Distance (km)</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Revenue</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Op. Cost</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Fuel Eff.</th>
                <th className="px-4 py-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">ROI %</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any, i: number) => (
                <tr key={v.vehicleId} className={`border-b border-border dark:border-dark-border ${i % 2 === 0 ? "" : "bg-surface-secondary/30 dark:bg-dark-surface-secondary/30"}`}>
                  <td className="px-4 py-3 font-medium text-text-primary dark:text-dark-text-primary">{v.registrationNumber}<br /><span className="text-xs text-text-muted dark:text-dark-text-muted">{v.name}</span></td>
                  <td className="px-4 py-3 text-text-primary dark:text-dark-text-primary">{v.totalTrips}</td>
                  <td className="px-4 py-3 text-text-primary dark:text-dark-text-primary">{v.totalDistance}</td>
                  <td className="px-4 py-3 text-success">{formatCurrency(v.totalRevenue)}</td>
                  <td className="px-4 py-3 text-danger">{formatCurrency(v.operationalCost)}</td>
                  <td className="px-4 py-3 text-text-primary dark:text-dark-text-primary">{v.fuelEfficiency ? `${v.fuelEfficiency} km/l` : "—"}</td>
                  <td className={`px-4 py-3 font-medium ${v.roi && v.roi > 0 ? "text-success" : "text-danger"}`}>
                    {v.roi !== null ? `${v.roi}%` : "—"}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-text-muted dark:text-dark-text-muted">no completed trips yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
