import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useVehicles(filters?: { status?: string; type?: string; region?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.region) params.set("region", filters.region);
  const qs = params.toString();

  return useQuery({
    queryKey: ["vehicles", filters],
    queryFn: () => api.get(`/vehicles${qs ? `?${qs}` : ""}`),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post("/vehicles", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/vehicles/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}
