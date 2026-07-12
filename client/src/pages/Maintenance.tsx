import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useVehicles } from "../hooks/useVehicles";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { formatCurrency, formatDate } from "../lib/utils";
import { Plus, X } from "lucide-react";

function useMaintenance(filters?: { vehicleId?: string; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.vehicleId) params.set("vehicleId", filters.vehicleId);
  if (filters?.status) params.set("status", filters.status);
  const qs = params.toString();
  return useQuery({
    queryKey: ["maintenance", filters],
    queryFn: () => api.get(`/maintenance${qs ? `?${qs}` : ""}`),
  });
}

export function Maintenance() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useMaintenance({ status: statusFilter });
  const { data: vehicleData } = useVehicles();

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/maintenance", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/maintenance/${id}/close`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["maintenance"] }); qc.invalidateQueries({ queryKey: ["vehicles"] }); },
  });

  const [form, setForm] = useState({ vehicleId: "", type: "", description: "", cost: "" });

  const resetForm = () => { setForm({ vehicleId: "", type: "", description: "", cost: "" }); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({ ...form, cost: Number(form.cost) });
    resetForm();
  };

  const columns = [
    { key: "vehicle", header: "Vehicle", render: (r: any) => `${r.vehicle?.registrationNumber} — ${r.vehicle?.name}` },
    { key: "type", header: "Type" },
    { key: "description", header: "Description", render: (r: any) => r.description || "—" },
    { key: "cost", header: "Cost", render: (r: any) => formatCurrency(r.cost) },
    { key: "startDate", header: "Start", render: (r: any) => formatDate(r.startDate) },
    { key: "endDate", header: "End", render: (r: any) => r.endDate ? formatDate(r.endDate) : "—" },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "actions", header: "",
      render: (r: any) => r.status === "ACTIVE" ? (
        <button onClick={(e) => { e.stopPropagation(); closeMutation.mutate(r.id); }} className="rounded-md bg-success/10 px-2 py-1 text-xs text-success hover:bg-success/20">
          close
        </button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Maintenance</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
            <option value="">all</option>
            <option value="ACTIVE">active</option>
            <option value="COMPLETED">completed</option>
          </select>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> add record
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} emptyMessage="no maintenance records" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-dark-text-primary">new maintenance record</h3>
              <button onClick={resetForm}><X className="h-5 w-5 text-text-muted" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">vehicle</label>
                <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                  <option value="">select vehicle</option>
                  {(vehicleData?.data || []).filter((v: any) => v.status !== "ON_TRIP").map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">type</label>
                <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="Oil Change, Tire Replacement..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">cost (₹)</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
