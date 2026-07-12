import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useDashboard(filters?: { type?: string; region?: string }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.region) params.set("region", filters.region);
  const qs = params.toString();

  return useQuery({
    queryKey: ["analytics", "dashboard", filters],
    queryFn: () => api.get(`/analytics/dashboard${qs ? `?${qs}` : ""}`),
    refetchInterval: 30000, // refresh every 30s
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["analytics", "reports"],
    queryFn: () => api.get("/analytics/reports"),
  });
}

export function useExportCSV() {
  return async () => {
    const blob = await api.get("/analytics/export/csv");
    return blob as Blob;
  };
}
