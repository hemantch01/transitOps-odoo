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

  // ====== TRIPS, FUEL, MAINTENANCE, EXPENSES ======
  // Vehicle 0 — RJ14TC1234 (Tata Ace Gold)
  const trip1 = await prisma.trip.create({
    data: {
      source: "Jaipur", destination: "Mumbai", cargoWeight: 600,
      plannedDistance: 1150, actualDistance: 1180, ratePerKm: 18, revenue: 21240,
      status: "COMPLETED", vehicleId: vehicles[0].id, driverId: drivers[0].id,
      startOdometer: 45230, endOdometer: 46410, fuelConsumed: 145,
      dispatchedAt: new Date("2026-06-15T06:00:00Z"), completedAt: new Date("2026-06-16T22:00:00Z"),
    },
  });
  const trip1b = await prisma.trip.create({
    data: {
      source: "Mumbai", destination: "Jaipur", cargoWeight: 500,
      plannedDistance: 1150, actualDistance: 1200, ratePerKm: 18, revenue: 21600,
      status: "COMPLETED", vehicleId: vehicles[0].id, driverId: drivers[0].id,
      startOdometer: 46410, endOdometer: 47610, fuelConsumed: 150,
      dispatchedAt: new Date("2026-06-20T06:00:00Z"), completedAt: new Date("2026-06-21T20:00:00Z"),
    },
  });
  const trip1c = await prisma.trip.create({
    data: {
      source: "Jaipur", destination: "Delhi", cargoWeight: 700,
      plannedDistance: 280, actualDistance: 290, ratePerKm: 20, revenue: 5800,
      status: "COMPLETED", vehicleId: vehicles[0].id, driverId: drivers[2].id,
      startOdometer: 47610, endOdometer: 47900, fuelConsumed: 35,
      dispatchedAt: new Date("2026-07-01T05:00:00Z"), completedAt: new Date("2026-07-01T14:00:00Z"),
    },
  });

  // fuel logs for vehicle 0
  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[0].id, tripId: trip1.id, liters: 145, cost: 14790, date: new Date("2026-06-15T08:00:00Z") },
    { vehicleId: vehicles[0].id, tripId: trip1b.id, liters: 150, cost: 15300, date: new Date("2026-06-20T08:00:00Z") },
    { vehicleId: vehicles[0].id, tripId: trip1c.id, liters: 35, cost: 3570, date: new Date("2026-07-01T07:00:00Z") },
  ]});

  // expenses for vehicle 0
  await prisma.expense.createMany({ data: [
    { vehicleId: vehicles[0].id, tripId: trip1.id, type: "TOLL", description: "Jaipur-Mumbai tolls", amount: 2800, date: new Date("2026-06-15") },
    { vehicleId: vehicles[0].id, tripId: trip1b.id, type: "TOLL", description: "Mumbai-Jaipur tolls", amount: 2800, date: new Date("2026-06-20") },
    { vehicleId: vehicles[0].id, type: "OTHER", description: "Parking charges", amount: 500, date: new Date("2026-06-25") },
  ]});

  // maintenance for vehicle 0
  await prisma.maintenanceLog.create({ data: {
    vehicleId: vehicles[0].id, type: "Brake Pad Replacement",
    description: "Front brake pads replaced at 47000km", cost: 4500,
    status: "COMPLETED", startDate: new Date("2026-06-28"), endDate: new Date("2026-06-28"),
  }});

  // Vehicle 1 — MH04EQ5678 (Ashok Leyland Dost)
  const trip2 = await prisma.trip.create({
    data: {
      source: "Mumbai", destination: "Pune", cargoWeight: 1500,
      plannedDistance: 150, actualDistance: 160, ratePerKm: 25, revenue: 4000,
      status: "COMPLETED", vehicleId: vehicles[1].id, driverId: drivers[1].id,
      startOdometer: 89120, endOdometer: 89280, fuelConsumed: 20,
      dispatchedAt: new Date("2026-06-10T06:00:00Z"), completedAt: new Date("2026-06-10T12:00:00Z"),
    },
  });
  const trip2b = await prisma.trip.create({
    data: {
      source: "Pune", destination: "Nagpur", cargoWeight: 2000,
      plannedDistance: 720, actualDistance: 740, ratePerKm: 22, revenue: 16280,
      status: "COMPLETED", vehicleId: vehicles[1].id, driverId: drivers[1].id,
      startOdometer: 89280, endOdometer: 90020, fuelConsumed: 95,
      dispatchedAt: new Date("2026-06-18T04:00:00Z"), completedAt: new Date("2026-06-19T10:00:00Z"),
    },
  });
  const trip2c = await prisma.trip.create({
    data: {
      source: "Nagpur", destination: "Mumbai", cargoWeight: 1800,
      plannedDistance: 800, actualDistance: 830, ratePerKm: 22, revenue: 18260,
      status: "COMPLETED", vehicleId: vehicles[1].id, driverId: drivers[3].id,
      startOdometer: 90020, endOdometer: 90850, fuelConsumed: 105,
      dispatchedAt: new Date("2026-06-25T05:00:00Z"), completedAt: new Date("2026-06-26T14:00:00Z"),
    },
  });

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[1].id, tripId: trip2.id, liters: 20, cost: 1900, date: new Date("2026-06-10T08:00:00Z") },
    { vehicleId: vehicles[1].id, tripId: trip2b.id, liters: 95, cost: 9025, date: new Date("2026-06-18T06:00:00Z") },
    { vehicleId: vehicles[1].id, tripId: trip2c.id, liters: 105, cost: 9975, date: new Date("2026-06-25T07:00:00Z") },
  ]});

  await prisma.expense.createMany({ data: [
    { vehicleId: vehicles[1].id, tripId: trip2b.id, type: "TOLL", description: "Pune-Nagpur tolls", amount: 1800, date: new Date("2026-06-18") },
    { vehicleId: vehicles[1].id, tripId: trip2c.id, type: "TOLL", description: "Nagpur-Mumbai tolls", amount: 2200, date: new Date("2026-06-25") },
  ]});

  await prisma.maintenanceLog.createMany({ data: [
    { vehicleId: vehicles[1].id, type: "Oil Change", description: "Routine oil and filter change at 89000km", cost: 3500, status: "COMPLETED", startDate: new Date("2026-06-08"), endDate: new Date("2026-06-08") },
    { vehicleId: vehicles[1].id, type: "Air Filter", description: "Air filter replacement", cost: 1200, status: "COMPLETED", startDate: new Date("2026-07-01"), endDate: new Date("2026-07-01") },
  ]});

  // Vehicle 2 — DL01AB9012 (Mahindra Bolero Pickup)
  const trip3 = await prisma.trip.create({
    data: {
      source: "Delhi", destination: "Agra", cargoWeight: 800,
      plannedDistance: 230, actualDistance: 240, ratePerKm: 20, revenue: 4800,
      status: "COMPLETED", vehicleId: vehicles[2].id, driverId: drivers[2].id,
      startOdometer: 67800, endOdometer: 68040, fuelConsumed: 18,
      dispatchedAt: new Date("2026-06-12T07:00:00Z"), completedAt: new Date("2026-06-12T14:00:00Z"),
    },
  });
  const trip3b = await prisma.trip.create({
    data: {
      source: "Delhi", destination: "Chandigarh", cargoWeight: 1000,
      plannedDistance: 250, actualDistance: 265, ratePerKm: 22, revenue: 5830,
      status: "COMPLETED", vehicleId: vehicles[2].id, driverId: drivers[2].id,
      startOdometer: 68040, endOdometer: 68305, fuelConsumed: 22,
      dispatchedAt: new Date("2026-06-22T06:00:00Z"), completedAt: new Date("2026-06-22T13:00:00Z"),
    },
  });

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[2].id, tripId: trip3.id, liters: 18, cost: 1620, date: new Date("2026-06-12T10:00:00Z") },
    { vehicleId: vehicles[2].id, tripId: trip3b.id, liters: 22, cost: 1980, date: new Date("2026-06-22T09:00:00Z") },
  ]});

  await prisma.expense.create({ data: {
    vehicleId: vehicles[2].id, tripId: trip3.id, type: "TOLL", description: "Delhi-Agra expressway toll", amount: 1200, date: new Date("2026-06-12"),
  }});

  await prisma.maintenanceLog.createMany({ data: [
    { vehicleId: vehicles[2].id, type: "Tire Replacement", description: "Replaced 2 rear tires", cost: 8000, status: "COMPLETED", startDate: new Date("2026-06-05"), endDate: new Date("2026-06-06") },
    { vehicleId: vehicles[2].id, type: "Battery Replacement", description: "New Amaron battery installed", cost: 5500, status: "COMPLETED", startDate: new Date("2026-07-05"), endDate: new Date("2026-07-05") },
  ]});

  // Vehicle 3 — GJ05PQ3456 (Eicher Pro 2049)
  const trip4 = await prisma.trip.create({
    data: {
      source: "Ahmedabad", destination: "Surat", cargoWeight: 4500,
      plannedDistance: 260, actualDistance: 275, ratePerKm: 35, revenue: 9625,
      status: "COMPLETED", vehicleId: vehicles[3].id, driverId: drivers[3].id,
      startOdometer: 120450, endOdometer: 120725, fuelConsumed: 45,
      dispatchedAt: new Date("2026-06-14T05:00:00Z"), completedAt: new Date("2026-06-14T11:00:00Z"),
    },
  });
  const trip4b = await prisma.trip.create({
    data: {
      source: "Surat", destination: "Rajkot", cargoWeight: 4000,
      plannedDistance: 500, actualDistance: 520, ratePerKm: 30, revenue: 15600,
      status: "COMPLETED", vehicleId: vehicles[3].id, driverId: drivers[3].id,
      startOdometer: 120725, endOdometer: 121245, fuelConsumed: 78,
      dispatchedAt: new Date("2026-06-20T04:00:00Z"), completedAt: new Date("2026-06-20T16:00:00Z"),
    },
  });
  const trip4c = await prisma.trip.create({
    data: {
      source: "Rajkot", destination: "Ahmedabad", cargoWeight: 3800,
      plannedDistance: 220, actualDistance: 230, ratePerKm: 32, revenue: 7360,
      status: "COMPLETED", vehicleId: vehicles[3].id, driverId: drivers[3].id,
      startOdometer: 121245, endOdometer: 121475, fuelConsumed: 38,
      dispatchedAt: new Date("2026-07-02T05:00:00Z"), completedAt: new Date("2026-07-02T12:00:00Z"),
    },
  });

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[3].id, tripId: trip4.id, liters: 45, cost: 4200, date: new Date("2026-06-14T09:00:00Z") },
    { vehicleId: vehicles[3].id, tripId: trip4b.id, liters: 78, cost: 7254, date: new Date("2026-06-20T08:00:00Z") },
    { vehicleId: vehicles[3].id, tripId: trip4c.id, liters: 38, cost: 3534, date: new Date("2026-07-02T08:00:00Z") },
  ]});

  await prisma.expense.createMany({ data: [
    { vehicleId: vehicles[3].id, tripId: trip4.id, type: "TOLL", description: "Ahmedabad-Surat tolls", amount: 800, date: new Date("2026-06-14") },
    { vehicleId: vehicles[3].id, tripId: trip4b.id, type: "TOLL", description: "Surat-Rajkot tolls", amount: 1500, date: new Date("2026-06-20") },
    { vehicleId: vehicles[3].id, type: "OTHER", description: "Coolant leak repair", amount: 3200, date: new Date("2026-06-28") },
  ]});

  await prisma.maintenanceLog.create({ data: {
    vehicleId: vehicles[3].id, type: "Engine Tuning", description: "Full engine tune-up at 121000km",
    cost: 12000, status: "COMPLETED", startDate: new Date("2026-06-28"), endDate: new Date("2026-06-29"),
  }});

  // Vehicle 4 — UP85CD7890 (Tata 407)
  const trip5 = await prisma.trip.create({
    data: {
      source: "Lucknow", destination: "Kanpur", cargoWeight: 3000,
      plannedDistance: 80, actualDistance: 85, ratePerKm: 28, revenue: 2380,
      status: "COMPLETED", vehicleId: vehicles[4].id, driverId: drivers[0].id,
      startOdometer: 98300, endOdometer: 98385, fuelConsumed: 12,
      dispatchedAt: new Date("2026-06-16T07:00:00Z"), completedAt: new Date("2026-06-16T10:00:00Z"),
    },
  });
  const trip5b = await prisma.trip.create({
    data: {
      source: "Lucknow", destination: "Varanasi", cargoWeight: 2800,
      plannedDistance: 320, actualDistance: 340, ratePerKm: 24, revenue: 8160,
      status: "COMPLETED", vehicleId: vehicles[4].id, driverId: drivers[0].id,
      startOdometer: 98385, endOdometer: 98725, fuelConsumed: 48,
      dispatchedAt: new Date("2026-06-24T05:00:00Z"), completedAt: new Date("2026-06-24T16:00:00Z"),
    },
  });
  const trip5c = await prisma.trip.create({
    data: {
      source: "Varanasi", destination: "Patna", cargoWeight: 3200,
      plannedDistance: 300, actualDistance: 310, ratePerKm: 26, revenue: 8060,
      status: "COMPLETED", vehicleId: vehicles[4].id, driverId: drivers[1].id,
      startOdometer: 98725, endOdometer: 99035, fuelConsumed: 45,
      dispatchedAt: new Date("2026-07-03T04:00:00Z"), completedAt: new Date("2026-07-03T15:00:00Z"),
    },
  });

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[4].id, tripId: trip5.id, liters: 12, cost: 1140, date: new Date("2026-06-16T08:00:00Z") },
    { vehicleId: vehicles[4].id, tripId: trip5b.id, liters: 48, cost: 4560, date: new Date("2026-06-24T07:00:00Z") },
    { vehicleId: vehicles[4].id, tripId: trip5c.id, liters: 45, cost: 4275, date: new Date("2026-07-03T06:00:00Z") },
  ]});

  await prisma.expense.createMany({ data: [
    { vehicleId: vehicles[4].id, tripId: trip5b.id, type: "TOLL", description: "Lucknow-Varanasi tolls", amount: 900, date: new Date("2026-06-24") },
    { vehicleId: vehicles[4].id, tripId: trip5c.id, type: "TOLL", description: "Varanasi-Patna tolls", amount: 700, date: new Date("2026-07-03") },
    { vehicleId: vehicles[4].id, type: "OTHER", description: "Diesel price surcharge", amount: 1500, date: new Date("2026-07-05") },
  ]});

  await prisma.maintenanceLog.createMany({ data: [
    { vehicleId: vehicles[4].id, type: "Clutch Plate", description: "Clutch plate replaced at 98500km", cost: 7500, status: "COMPLETED", startDate: new Date("2026-06-20"), endDate: new Date("2026-06-21") },
    { vehicleId: vehicles[4].id, type: "Oil Change", description: "Engine oil change", cost: 2800, status: "COMPLETED", startDate: new Date("2026-07-08"), endDate: new Date("2026-07-08") },
  ]});

  // Vehicle 5 — KA01MN2345 (Maruti Super Carry)
  const trip6 = await prisma.trip.create({
    data: {
      source: "Bangalore", destination: "Mysore", cargoWeight: 400,
      plannedDistance: 150, actualDistance: 155, ratePerKm: 18, revenue: 2790,
      status: "COMPLETED", vehicleId: vehicles[5].id, driverId: drivers[2].id,
      startOdometer: 32100, endOdometer: 32255, fuelConsumed: 10,
      dispatchedAt: new Date("2026-06-13T08:00:00Z"), completedAt: new Date("2026-06-13T12:00:00Z"),
    },
  });
  const trip6b = await prisma.trip.create({
    data: {
      source: "Bangalore", destination: "Chennai", cargoWeight: 450,
      plannedDistance: 350, actualDistance: 360, ratePerKm: 20, revenue: 7200,
      status: "COMPLETED", vehicleId: vehicles[5].id, driverId: drivers[2].id,
      startOdometer: 32255, endOdometer: 32615, fuelConsumed: 25,
      dispatchedAt: new Date("2026-06-22T06:00:00Z"), completedAt: new Date("2026-06-22T16:00:00Z"),
    },
  });
  const trip6c = await prisma.trip.create({
    data: {
      source: "Chennai", destination: "Bangalore", cargoWeight: 480,
      plannedDistance: 350, actualDistance: 365, ratePerKm: 20, revenue: 7300,
      status: "COMPLETED", vehicleId: vehicles[5].id, driverId: drivers[3].id,
      startOdometer: 32615, endOdometer: 32980, fuelConsumed: 26,
      dispatchedAt: new Date("2026-07-01T07:00:00Z"), completedAt: new Date("2026-07-01T17:00:00Z"),
    },
  });

  await prisma.fuelLog.createMany({ data: [
    { vehicleId: vehicles[5].id, tripId: trip6.id, liters: 10, cost: 950, date: new Date("2026-06-13T09:00:00Z") },
    { vehicleId: vehicles[5].id, tripId: trip6b.id, liters: 25, cost: 2375, date: new Date("2026-06-22T08:00:00Z") },
    { vehicleId: vehicles[5].id, tripId: trip6c.id, liters: 26, cost: 2470, date: new Date("2026-07-01T09:00:00Z") },
  ]});

  await prisma.expense.createMany({ data: [
    { vehicleId: vehicles[5].id, tripId: trip6b.id, type: "TOLL", description: "Bangalore-Chennai tolls", amount: 600, date: new Date("2026-06-22") },
    { vehicleId: vehicles[5].id, tripId: trip6c.id, type: "TOLL", description: "Chennai-Bangalore tolls", amount: 600, date: new Date("2026-07-01") },
  ]});

  await prisma.maintenanceLog.create({ data: {
    vehicleId: vehicles[5].id, type: "AC Service", description: "AC gas refill and compressor check",
    cost: 3000, status: "COMPLETED", startDate: new Date("2026-06-30"), endDate: new Date("2026-06-30"),
  }});

  // Some PENDING / ACTIVE trips for dashboard variety
  await prisma.trip.create({
    data: {
      source: "Jaipur", destination: "Udaipur", cargoWeight: 650,
      plannedDistance: 400, ratePerKm: 18,
      status: "DISPATCHED", vehicleId: vehicles[0].id, driverId: drivers[0].id,
      startOdometer: 47900,
      dispatchedAt: new Date("2026-07-12T06:00:00Z"),
    },
  });
  await prisma.trip.create({
    data: {
      source: "Delhi", destination: "Jaipur", cargoWeight: 1100,
      plannedDistance: 280, ratePerKm: 20,
      status: "DRAFT", vehicleId: vehicles[2].id, driverId: drivers[2].id,
      startOdometer: 68305,
    },
  });

  // Pending maintenance
  await prisma.maintenanceLog.create({ data: {
    vehicleId: vehicles[1].id, type: "Transmission Service",
    description: "Scheduled transmission fluid change", cost: 6000,
    status: "ACTIVE", startDate: new Date("2026-07-15"),
  }});

  console.log("seed complete! 🚀");
}

seed()
  .catch((e) => {
    console.error("seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

