import { useState } from "react";
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "../hooks/useDrivers";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Confirm } from "../components/shared/Confirm";
import { formatDate } from "../lib/utils";
import { LICENSE_CATEGORIES } from "../../../shared/schemas/driver";
import { Plus, X, AlertTriangle } from "lucide-react";

export function Drivers() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useDrivers({ status: statusFilter });
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const deleteMutation = useDeleteDriver();

  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    licenseCategory: "HMV" as string,
    licenseExpiry: "",
    contactNumber: "",
  });

  const resetForm = () => {
    setForm({ name: "", licenseNumber: "", licenseCategory: "HMV", licenseExpiry: "", contactNumber: "" });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    resetForm();
  };

  const openEdit = (d: any) => {
    setForm({
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiry: d.licenseExpiry?.split("T")[0] || "",
      contactNumber: d.contactNumber,
    });
    setEditing(d);
    setShowForm(true);
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const isExpiringSoon = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // 30 days
  };

  const columns = [
    { key: "name", header: "Name" },
    { key: "licenseNumber", header: "License No." },
    { key: "licenseCategory", header: "Category" },
    {
      key: "licenseExpiry",
      header: "License Expiry",
      render: (r: any) => (
        <div className="flex items-center gap-1.5">
          <span>{formatDate(r.licenseExpiry)}</span>
          {isExpired(r.licenseExpiry) && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
          {isExpiringSoon(r.licenseExpiry) && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
        </div>
      ),
    },
    { key: "contactNumber", header: "Contact" },
    { key: "safetyScore", header: "Safety Score", render: (r: any) => `${r.safetyScore}/100` },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r: any) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-xs text-primary-600 hover:underline">edit</button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(r.id); }} className="text-xs text-danger hover:underline">delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Drivers</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm">
            <option value="">all statuses</option>
            <option value="AVAILABLE">available</option>
            <option value="ON_TRIP">on trip</option>
            <option value="OFF_DUTY">off duty</option>
            <option value="SUSPENDED">suspended</option>
          </select>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> add driver
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} emptyMessage="no drivers found" />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{editing ? "edit driver" : "add driver"}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="Rajesh Kumar" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">license number</label>
                  <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required disabled={!!editing} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:opacity-50" placeholder="RJ14-2019-0045678" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">category</label>
                  <select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100">
                    {LICENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">license expiry</label>
                  <input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium">contact number</label>
                  <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" placeholder="9876543210" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                  {editing ? "update" : "create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Confirm open={!!deleteId} title="delete driver" message="are you sure?" confirmLabel="delete" variant="danger" onCancel={() => setDeleteId(null)} onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }} />
    </div>
  );
}
