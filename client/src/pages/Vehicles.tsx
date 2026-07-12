import { useState } from "react";
import { useVehicles, useCreateVehicle, useUpdateVehicle, useDeleteVehicle } from "../hooks/useVehicles";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Confirm } from "../components/shared/Confirm";
import { formatCurrency } from "../lib/utils";
import { VEHICLE_TYPES, RTO_REGIONS } from "../../../shared/schemas/vehicle";
import { Plus, X } from "lucide-react";

export function Vehicles() {
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useVehicles({ status: statusFilter, type: typeFilter });
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const deleteMutation = useDeleteVehicle();

  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    type: "TRUCK" as string,
    maxLoadCapacity: "",
    acquisitionCost: "",
    region: "",
  });

  const resetForm = () => {
    setForm({ registrationNumber: "", name: "", type: "TRUCK", maxLoadCapacity: "", acquisitionCost: "", region: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      acquisitionCost: Number(form.acquisitionCost),
      region: form.region || undefined,
    };

    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const openEdit = (v: any) => {
    setForm({
      registrationNumber: v.registrationNumber,
      name: v.name,
      type: v.type,
      maxLoadCapacity: String(v.maxLoadCapacity),
      acquisitionCost: String(v.acquisitionCost),
      region: v.region || "",
    });
    setEditing(v);
    setShowForm(true);
  };

  const columns = [
    { key: "registrationNumber", header: "Reg. No." },
    { key: "name", header: "Name" },
    { key: "type", header: "Type", render: (r: any) => r.type.toLowerCase() },
    { key: "maxLoadCapacity", header: "Capacity (kg)" },
    { key: "region", header: "Region" },
    { key: "acquisitionCost", header: "Cost", render: (r: any) => formatCurrency(r.acquisitionCost) },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r: any) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-xs text-primary-600 hover:underline dark:text-primary-400">edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="text-xs text-danger hover:underline">delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Vehicles</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
            <option value="">all statuses</option>
            <option value="AVAILABLE">available</option>
            <option value="ON_TRIP">on trip</option>
            <option value="IN_SHOP">in shop</option>
            <option value="RETIRED">retired</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
            <option value="">all types</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
          </select>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-1.5 text-sm font-medium text-white transition-all hover:opacity-90">
            <Plus className="h-4 w-4" /> add vehicle
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} emptyMessage="no vehicles found" />

      {/* form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
                {editing ? "edit vehicle" : "add vehicle"}
              </h3>
              <button onClick={resetForm} className="text-text-muted hover:text-text-primary dark:text-dark-text-muted"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">registration number</label>
                  <input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })} required disabled={!!editing} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary disabled:opacity-50" placeholder="RJ14TC1234" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="Tata Ace Gold" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">capacity (kg)</label>
                  <input type="number" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">acquisition cost</label>
                  <input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary dark:text-dark-text-primary">region</label>
                  <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    <option value="">auto-detect from reg no.</option>
                    {RTO_REGIONS.map((r) => <option key={r.code} value={r.code}>{r.code} — {r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {editing ? "update" : "create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Confirm open={!!deleteId} title="delete vehicle" message="are you sure? this action cannot be undone." confirmLabel="delete" variant="danger" onCancel={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
