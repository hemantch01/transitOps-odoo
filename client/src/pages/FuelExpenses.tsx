import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useVehicles } from "../hooks/useVehicles";
import { DataTable } from "../components/shared/DataTable";
import { formatCurrency, formatDate } from "../lib/utils";
import { EXPENSE_TYPES } from "../../../shared/schemas/expense";
import { Plus, X } from "lucide-react";

export function FuelExpenses() {
  const [tab, setTab] = useState<"fuel" | "expenses">("fuel");
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const { data: vehicleData } = useVehicles();

  // fuel
  const { data: fuelData, isLoading: fuelLoading } = useQuery({
    queryKey: ["fuel"],
    queryFn: () => api.get("/fuel"),
  });

  const createFuelMutation = useMutation({
    mutationFn: (d: any) => api.post("/fuel", d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fuel"] }),
  });

  // expenses
  const { data: expenseData, isLoading: expenseLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => api.get("/expenses"),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (d: any) => api.post("/expenses", d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });

  const [fuelForm, setFuelForm] = useState({ vehicleId: "", liters: "", cost: "", date: "" });
  const [expenseForm, setExpenseForm] = useState({ vehicleId: "", type: "FUEL" as string, description: "", amount: "", date: "" });

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFuelMutation.mutateAsync({
      ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost),
    });
    setFuelForm({ vehicleId: "", liters: "", cost: "", date: "" });
    setShowForm(false);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExpenseMutation.mutateAsync({
      ...expenseForm, amount: Number(expenseForm.amount),
    });
    setExpenseForm({ vehicleId: "", type: "FUEL", description: "", amount: "", date: "" });
    setShowForm(false);
  };

  const fuelColumns = [
    { key: "vehicle", header: "Vehicle", render: (r: any) => `${r.vehicle?.registrationNumber} — ${r.vehicle?.name}` },
    { key: "liters", header: "Liters" },
    { key: "cost", header: "Cost", render: (r: any) => formatCurrency(r.cost) },
    { key: "date", header: "Date", render: (r: any) => formatDate(r.date) },
  ];

  const expenseColumns = [
    { key: "vehicle", header: "Vehicle", render: (r: any) => `${r.vehicle?.registrationNumber} — ${r.vehicle?.name}` },
    { key: "type", header: "Type", render: (r: any) => r.type.toLowerCase() },
    { key: "description", header: "Description", render: (r: any) => r.description || "—" },
    { key: "amount", header: "Amount", render: (r: any) => formatCurrency(r.amount) },
    { key: "date", header: "Date", render: (r: any) => formatDate(r.date) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">Fuel & Expenses</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 rounded-lg gradient-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> add {tab === "fuel" ? "fuel log" : "expense"}
        </button>
      </div>

      {/* tabs */}
      <div className="flex gap-1 rounded-lg bg-surface-secondary p-1 dark:bg-dark-surface-secondary">
        <button onClick={() => setTab("fuel")} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === "fuel" ? "bg-surface text-text-primary shadow-sm dark:bg-dark-surface dark:text-dark-text-primary" : "text-text-secondary dark:text-dark-text-secondary"}`}>
          Fuel Logs
        </button>
        <button onClick={() => setTab("expenses")} className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${tab === "expenses" ? "bg-surface text-text-primary shadow-sm dark:bg-dark-surface dark:text-dark-text-primary" : "text-text-secondary dark:text-dark-text-secondary"}`}>
          Expenses
        </button>
      </div>

      {tab === "fuel" && <DataTable columns={fuelColumns} data={fuelData?.data || []} loading={fuelLoading} emptyMessage="no fuel logs" />}
      {tab === "expenses" && <DataTable columns={expenseColumns} data={expenseData?.data || []} loading={expenseLoading} emptyMessage="no expenses" />}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-xl dark:border-dark-border dark:bg-dark-surface animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold dark:text-dark-text-primary">{tab === "fuel" ? "add fuel log" : "add expense"}</h3>
              <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-text-muted" /></button>
            </div>

            {tab === "fuel" ? (
              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">vehicle</label>
                  <select value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    <option value="">select</option>
                    {(vehicleData?.data || []).map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">liters</label>
                    <input type="number" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">cost (₹)</label>
                    <input type="number" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">date</label>
                  <input type="date" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                  <button type="submit" disabled={createFuelMutation.isPending} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">add</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">vehicle</label>
                  <select value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    <option value="">select</option>
                    {(vehicleData?.data || []).map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">type</label>
                  <select value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary">
                    {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t.toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">description</label>
                  <input value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">amount (₹)</label>
                    <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium dark:text-dark-text-primary">date</label>
                    <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary-500 dark:border-dark-border dark:bg-dark-surface-secondary dark:text-dark-text-primary" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm dark:border-dark-border dark:text-dark-text-secondary">cancel</button>
                  <button type="submit" disabled={createExpenseMutation.isPending} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">add</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
