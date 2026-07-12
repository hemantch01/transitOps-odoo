import { useState } from "react";
import { useTrips, useCreateTrip, useDispatchTrip, useCompleteTrip, useCancelTrip } from "../hooks/useTrips";
import { useVehicles } from "../hooks/useVehicles";
import { useDrivers } from "../hooks/useDrivers";
import { DataTable } from "../components/shared/DataTable";
import { StatusBadge } from "../components/shared/StatusBadge";
import { Confirm } from "../components/shared/Confirm";
import { formatCurrency, formatDate } from "../lib/utils";
import { Plus, X, Play, CheckCircle, XCircle } from "lucide-react";

export function Trips() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showComplete, setShowComplete] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading } = useTrips({ status: statusFilter });
  const { data: vehicleData } = useVehicles({ status: "AVAILABLE" });
  const { data: driverData } = useDrivers({ status: "AVAILABLE" });
  const createMutation = useCreateTrip();
  const dispatchMutation = useDispatchTrip();
  const completeMutation = useCompleteTrip();
  const cancelMutation = useCancelTrip();

  const [form, setForm] = useState({
    source: "", destination: "", cargoWeight: "", plannedDistance: "",
    ratePerKm: "", vehicleId: "", driverId: "",
  });

  const [completeForm, setCompleteForm] = useState({
    endOdometer: "", fuelConsumed: "", actualDistance: "", revenue: "",
  });

  const resetForm = () => {
    setForm({ source: "", destination: "", cargoWeight: "", plannedDistance: "", ratePerKm: "", vehicleId: "", driverId: "" });
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...form,
      cargoWeight: Number(form.cargoWeight),
      plannedDistance: Number(form.plannedDistance),
      ratePerKm: form.ratePerKm ? Number(form.ratePerKm) : undefined,
    });
    resetForm();
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showComplete) return;
    await completeMutation.mutateAsync({
      id: showComplete,
      data: {
        endOdometer: Number(completeForm.endOdometer),
        fuelConsumed: Number(completeForm.fuelConsumed),
        actualDistance: Number(completeForm.actualDistance),
        revenue: completeForm.revenue ? Number(completeForm.revenue) : undefined,
      },
    });
    setShowComplete(null);
    setCompleteForm({ endOdometer: "", fuelConsumed: "", actualDistance: "", revenue: "" });
  };

  const columns = [
    { key: "source", header: "From" },
    { key: "destination", header: "To" },
    { key: "vehicle", header: "Vehicle", render: (r: any) => r.vehicle?.registrationNumber },
    { key: "driver", header: "Driver", render: (r: any) => r.driver?.name },
    { key: "cargoWeight", header: "Cargo (kg)" },
    { key: "plannedDistance", header: "Distance (km)" },
    { key: "revenue", header: "Revenue", render: (r: any) => r.revenue ? formatCurrency(r.revenue) : "—" },
    { key: "status", header: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      header: "",
      render: (r: any) => (
        <div className="flex gap-1.5">
          {r.status === "DRAFT" && (
            <button onClick={(e) => { e.stopPropagation(); dispatchMutation.mutate(r.id); }} className="flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-xs text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300">
              <Play className="h-3 w-3" /> dispatch
            </button>
          )}
          {r.status === "DISPATCHED" && (
            <button onClick={(e) => { e.stopPropagation(); setShowComplete(r.id); }} className="flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs text-success hover:bg-success/20">
              <CheckCircle className="h-3 w-3" /> complete
            </button>
          )}
          {(r.status === "DRAFT" || r.status === "DISPATCHED") && (
            <button onClick={(e) => { e.stopPropagation(); setCancelId(r.id); }} className="flex items-center gap-1 rounded-md bg-danger/10 px-2 py-1 text-xs text-danger hover:bg-danger/20">
              <XCircle className="h-3 w-3" /> cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Trips</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
            <option value="">all statuses</option>
            <option value="DRAFT">draft</option>
            <option value="DISPATCHED">dispatched</option>
            <option value="COMPLETED">completed</option>
            <option value="CANCELLED">cancelled</option>
          </select>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> new trip
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={data?.data || []} loading={isLoading} emptyMessage="no trips found" />

      {/* create trip */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-dark-text-primary">new trip</h3>
              <button onClick={resetForm}><X className="h-5 w-5 text-text-muted" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">from</label>
                  <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="Jaipur" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">to</label>
                  <input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">vehicle</label>
                  <select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    <option value="">select vehicle</option>
                    {(vehicleData?.data || []).map((v: any) => (
                      <option key={v.id} value={v.id}>{v.registrationNumber} — {v.name} ({v.maxLoadCapacity}kg)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">driver</label>
                  <select value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    <option value="">select driver</option>
                    {(driverData?.data || []).map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} — {d.licenseCategory}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">cargo weight (kg)</label>
                  <input type="number" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">planned distance (km)</label>
                  <input type="number" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">rate per km (₹, optional)</label>
                  <input type="number" value={form.ratePerKm} onChange={(e) => setForm({ ...form, ratePerKm: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="auto-computes revenue on completion" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">create trip</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* complete trip */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
            <h3 className="text-lg font-semibold mb-4 dark:text-dark-text-primary">complete trip</h3>
            <form onSubmit={handleComplete} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">end odometer</label>
                <input type="number" value={completeForm.endOdometer} onChange={(e) => setCompleteForm({ ...completeForm, endOdometer: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">actual distance (km)</label>
                <input type="number" value={completeForm.actualDistance} onChange={(e) => setCompleteForm({ ...completeForm, actualDistance: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">fuel consumed (liters)</label>
                <input type="number" value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">revenue override (₹, optional)</label>
                <input type="number" value={completeForm.revenue} onChange={(e) => setCompleteForm({ ...completeForm, revenue: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" placeholder="leave empty to auto-compute" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowComplete(null)} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                <button type="submit" disabled={completeMutation.isPending} className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white disabled:opacity-50">mark completed</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Confirm open={!!cancelId} title="cancel trip" message="vehicle and driver will be marked available." confirmLabel="cancel trip" variant="danger" onCancel={() => setCancelId(null)} onConfirm={async () => { if (cancelId) { await cancelMutation.mutateAsync(cancelId); setCancelId(null); } }} />
    </div>
  );
}
