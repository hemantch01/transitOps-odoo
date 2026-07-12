// @ts-nocheck
import { prisma } from "../../lib/prisma.js";

export async function getDashboardKPIs(filters?: { type?: string; status?: string; region?: string }) {
  const vehicleWhere: any = {};
  if (filters?.type) vehicleWhere.type = filters.type;
  if (filters?.region) vehicleWhere.region = filters.region;

  const [vehicles, drivers, trips] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["status"],
      where: vehicleWhere,
      _count: true,
    }),
    prisma.driver.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.trip.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const vehicleCounts: Record<string, number> = {};
  let totalVehicles = 0;
  vehicles.forEach((v) => {
    vehicleCounts[v.status] = v._count;
    totalVehicles += v._count;
  });

  const driverCounts: Record<string, number> = {};
  drivers.forEach((d) => { driverCounts[d.status] = d._count; });

  const tripCounts: Record<string, number> = {};
  trips.forEach((t) => { tripCounts[t.status] = t._count; });

  const activeVehicles = totalVehicles - (vehicleCounts["RETIRED"] || 0);
  const utilization = activeVehicles > 0
    ? ((vehicleCounts["ON_TRIP"] || 0) / activeVehicles * 100).toFixed(1)
    : "0";

  return {
    vehicles: {
      total: totalVehicles,
      available: vehicleCounts["AVAILABLE"] || 0,
      onTrip: vehicleCounts["ON_TRIP"] || 0,
      inShop: vehicleCounts["IN_SHOP"] || 0,
      retired: vehicleCounts["RETIRED"] || 0,
    },
    drivers: {
      total: Object.values(driverCounts).reduce((a, b) => a + b, 0),
      available: driverCounts["AVAILABLE"] || 0,
      onDuty: driverCounts["ON_TRIP"] || 0,
      offDuty: driverCounts["OFF_DUTY"] || 0,
      suspended: driverCounts["SUSPENDED"] || 0,
    },
    trips: {
      active: tripCounts["DISPATCHED"] || 0,
      pending: tripCounts["DRAFT"] || 0,
      completed: tripCounts["COMPLETED"] || 0,
      cancelled: tripCounts["CANCELLED"] || 0,
    },
    fleetUtilization: Number(utilization),
  };
}

export async function getReportsData() {
  // fuel efficiency per vehicle
  const vehiclesWithTrips = await prisma.vehicle.findMany({
    where: { trips: { some: { status: "COMPLETED" } } },
    select: {
      id: true,
      registrationNumber: true,
      name: true,
      acquisitionCost: true,
      trips: {
        where: { status: "COMPLETED" },
        select: { actualDistance: true, fuelConsumed: true, revenue: true },
      },
      fuelLogs: { select: { cost: true } },
      maintenanceLogs: { select: { cost: true } },
    },
  });

  const vehicleReports = vehiclesWithTrips.map((v) => {
    const totalDistance = v.trips.reduce((sum, t) => sum + (t.actualDistance || 0), 0);
    const totalFuel = v.trips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
    const totalRevenue = v.trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalFuelCost = v.fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalMaintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const operationalCost = totalFuelCost + totalMaintenanceCost;
    const fuelEfficiency = totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : null;
    const roi = v.acquisitionCost > 0
      ? ((totalRevenue - operationalCost) / v.acquisitionCost * 100).toFixed(2)
      : null;

    return {
      vehicleId: v.id,
      registrationNumber: v.registrationNumber,
      name: v.name,
      totalTrips: v.trips.length,
      totalDistance,
      totalFuel,
      totalRevenue,
      totalFuelCost,
      totalMaintenanceCost,
      operationalCost,
      fuelEfficiency: fuelEfficiency ? Number(fuelEfficiency) : null, // km/l
      roi: roi ? Number(roi) : null, // %
    };
  });

  return { vehicles: vehicleReports };
}

export function generateCSV(data: any[]) {
  if (data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val);
      return str.includes(",") ? `"${str}"` : str;
    }).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
