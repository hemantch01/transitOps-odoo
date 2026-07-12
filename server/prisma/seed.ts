import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("seeding database...");

  // vehicles — realistic Indian RTO data
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { registrationNumber: "RJ14TC1234" },
      update: {},
      create: {
        registrationNumber: "RJ14TC1234",
        name: "Tata Ace Gold",
        type: "VAN",
        maxLoadCapacity: 750,
        currentOdometer: 45230,
        acquisitionCost: 650000,
        status: "AVAILABLE",
        region: "RJ",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "MH04EQ5678" },
      update: {},
      create: {
        registrationNumber: "MH04EQ5678",
        name: "Ashok Leyland Dost",
        type: "TRUCK",
        maxLoadCapacity: 2500,
        currentOdometer: 89120,
        acquisitionCost: 890000,
        status: "AVAILABLE",
        region: "MH",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "DL01AB9012" },
      update: {},
      create: {
        registrationNumber: "DL01AB9012",
        name: "Mahindra Bolero Pickup",
        type: "VAN",
        maxLoadCapacity: 1200,
        currentOdometer: 67800,
        acquisitionCost: 780000,
        status: "AVAILABLE",
        region: "DL",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "GJ05PQ3456" },
      update: {},
      create: {
        registrationNumber: "GJ05PQ3456",
        name: "Eicher Pro 2049",
        type: "TRUCK",
        maxLoadCapacity: 4900,
        currentOdometer: 120450,
        acquisitionCost: 1450000,
        status: "AVAILABLE",
        region: "GJ",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "UP85CD7890" },
      update: {},
      create: {
        registrationNumber: "UP85CD7890",
        name: "Tata 407",
        type: "TRUCK",
        maxLoadCapacity: 3500,
        currentOdometer: 98300,
        acquisitionCost: 1100000,
        status: "AVAILABLE",
        region: "UP",
      },
    }),
    prisma.vehicle.upsert({
      where: { registrationNumber: "KA01MN2345" },
      update: {},
      create: {
        registrationNumber: "KA01MN2345",
        name: "Maruti Super Carry",
        type: "VAN",
        maxLoadCapacity: 500,
        currentOdometer: 32100,
        acquisitionCost: 520000,
        status: "AVAILABLE",
        region: "KA",
      },
    }),
  ]);

  console.log(`seeded ${vehicles.length} vehicles`);

  // drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { licenseNumber: "RJ14-2019-0045678" },
      update: {},
      create: {
        name: "Rajesh Kumar",
        licenseNumber: "RJ14-2019-0045678",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2027-03-15"),
        contactNumber: "9876543210",
        safetyScore: 92,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "MH04-2020-0089012" },
      update: {},
      create: {
        name: "Amit Sharma",
        licenseNumber: "MH04-2020-0089012",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2028-06-22"),
        contactNumber: "9123456789",
        safetyScore: 88,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "DL01-2018-0034567" },
      update: {},
      create: {
        name: "Suresh Yadav",
        licenseNumber: "DL01-2018-0034567",
        licenseCategory: "LMV",
        licenseExpiry: new Date("2026-12-01"),
        contactNumber: "9988776655",
        safetyScore: 95,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.upsert({
      where: { licenseNumber: "UP85-2021-0056789" },
      update: {},
      create: {
        name: "Priya Singh",
        licenseNumber: "UP85-2021-0056789",
        licenseCategory: "HMV",
        licenseExpiry: new Date("2029-01-10"),
        contactNumber: "9012345678",
        safetyScore: 97,
        status: "AVAILABLE",
      },
    }),
  ]);

  console.log(`seeded ${drivers.length} drivers`);

  // sample completed trip for reports
  const trip = await prisma.trip.create({
    data: {
      source: "Jaipur",
      destination: "Mumbai",
      cargoWeight: 600,
      plannedDistance: 1150,
      actualDistance: 1180,
      ratePerKm: 18,
      revenue: 21240,
      status: "COMPLETED",
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
      startOdometer: 45230,
      endOdometer: 46410,
      fuelConsumed: 145,
      dispatchedAt: new Date("2026-07-01T06:00:00Z"),
      completedAt: new Date("2026-07-02T22:00:00Z"),
    },
  });

  // fuel log for the trip
  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[0].id,
      tripId: trip.id,
      liters: 145,
      cost: 14790,
      date: new Date("2026-07-01T08:00:00Z"),
    },
  });

  // maintenance record
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[1].id,
      type: "Oil Change",
      description: "routine oil and filter change at 89000km",
      cost: 3500,
      status: "COMPLETED",
      startDate: new Date("2026-06-25"),
      endDate: new Date("2026-06-25"),
    },
  });

  // expense
  await prisma.expense.create({
    data: {
      vehicleId: vehicles[0].id,
      tripId: trip.id,
      type: "TOLL",
      description: "Jaipur-Mumbai highway tolls",
      amount: 2800,
      date: new Date("2026-07-01"),
    },
  });

  // additional trip 1 for vehicle 1 (MH04EQ5678)
  const trip2 = await prisma.trip.create({
    data: {
      source: "Mumbai",
      destination: "Pune",
      cargoWeight: 1500,
      plannedDistance: 150,
      actualDistance: 160,
      ratePerKm: 25,
      revenue: 4000,
      status: "COMPLETED",
      vehicleId: vehicles[1].id,
      driverId: drivers[1].id,
      startOdometer: 89120,
      endOdometer: 89280,
      fuelConsumed: 20,
      dispatchedAt: new Date("2026-07-05T06:00:00Z"),
      completedAt: new Date("2026-07-05T12:00:00Z"),
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[1].id,
      tripId: trip2.id,
      liters: 20,
      cost: 1900,
      date: new Date("2026-07-05T08:00:00Z"),
    },
  });

  // additional trip 2 for vehicle 2 (DL01AB9012)
  const trip3 = await prisma.trip.create({
    data: {
      source: "Delhi",
      destination: "Agra",
      cargoWeight: 800,
      plannedDistance: 230,
      actualDistance: 240,
      ratePerKm: 20,
      revenue: 4800,
      status: "COMPLETED",
      vehicleId: vehicles[2].id,
      driverId: drivers[2].id,
      startOdometer: 67800,
      endOdometer: 68040,
      fuelConsumed: 18,
      dispatchedAt: new Date("2026-07-08T07:00:00Z"),
      completedAt: new Date("2026-07-08T14:00:00Z"),
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[2].id,
      tripId: trip3.id,
      liters: 18,
      cost: 1620,
      date: new Date("2026-07-08T10:00:00Z"),
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicles[2].id,
      type: "Tire Replacement",
      description: "Replaced 2 rear tires",
      cost: 8000,
      status: "COMPLETED",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-02"),
    },
  });

  // additional trip 3 for vehicle 3 (GJ05PQ3456)
  const trip4 = await prisma.trip.create({
    data: {
      source: "Ahmedabad",
      destination: "Surat",
      cargoWeight: 4500,
      plannedDistance: 260,
      actualDistance: 275,
      ratePerKm: 35,
      revenue: 9625,
      status: "COMPLETED",
      vehicleId: vehicles[3].id,
      driverId: drivers[3].id,
      startOdometer: 120450,
      endOdometer: 120725,
      fuelConsumed: 45,
      dispatchedAt: new Date("2026-07-10T05:00:00Z"),
      completedAt: new Date("2026-07-10T11:00:00Z"),
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: vehicles[3].id,
      tripId: trip4.id,
      liters: 45,
      cost: 4200,
      date: new Date("2026-07-10T09:00:00Z"),
    },
  });

  console.log("seed complete!");
}

seed()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
