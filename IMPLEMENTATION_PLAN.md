# TransitOps — Transport Operations Platform

Centralized platform to digitize vehicle, driver, dispatch, maintenance, and expense management with enforced business rules and operational insights.

## Decisions (Resolved)

### Revenue per trip
Both options available:
- Trip has `ratePerKm` field — auto-computes `revenue = ratePerKm × actualDistance` on completion
- Dispatcher can also manually override the revenue amount
- If manually entered, that takes priority over computed value

### Regions — RTO-based
Regions follow Indian RTO codes. Predefined dropdown:

| Code | Region |
|------|--------|
| DL | Delhi |
| RJ | Rajasthan |
| UP | Uttar Pradesh |
| MH | Maharashtra |
| GJ | Gujarat |
| KA | Karnataka |
| TN | Tamil Nadu |
| HR | Haryana |
| MP | Madhya Pradesh |
| PB | Punjab |

Vehicle registration numbers naturally follow RTO format (e.g. `RJ14TC1234`), so region auto-maps from the registration prefix. Admin can extend the list.

### Seed data — realistic Indian
Realistic RTO-compliant demo data:

**Vehicles:**
| Reg Number | Name | Type | Capacity | Region |
|-----------|------|------|----------|--------|
| RJ14TC1234 | Tata Ace Gold | VAN | 750 kg | RJ |
| MH04EQ5678 | Ashok Leyland Dost | TRUCK | 2500 kg | MH |
| DL01AB9012 | Mahindra Bolero Pickup | VAN | 1200 kg | DL |
| GJ05PQ3456 | Eicher Pro 2049 | TRUCK | 4900 kg | GJ |
| UP85CD7890 | Tata 407 | TRUCK | 3500 kg | UP |
| KA01MN2345 | Maruti Super Carry | VAN | 500 kg | KA |

**Drivers:**
| Name | License | Category | Expiry |
|------|---------|----------|--------|
| Rajesh Kumar | RJ14-2019-0045678 | HMV | 2027-03-15 |
| Amit Sharma | MH04-2020-0089012 | HMV | 2028-06-22 |
| Suresh Yadav | DL01-2018-0034567 | LMV | 2026-12-01 |
| Priya Singh | UP85-2021-0056789 | HMV | 2029-01-10 |

**Sample trips:** Jaipur → Mumbai, Delhi → Lucknow, Ahmedabad → Pune etc. with realistic distances and cargo weights.


---

## Architecture Principles

### 1. Three-layer backend separation

Every module follows the same pattern — no exceptions:

```
handler.ts  →  receives request, calls service, sends response
service.ts  →  business logic, validation, DB operations
schema.ts   →  Zod schemas (shared with client)
routes.ts   →  maps HTTP methods to handlers + middleware
```

**Example — trip dispatch flow:**

```ts
// handler.ts — thin, no logic
export async function dispatchTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = tripIdSchema.parse(req.params);
    const trip = await tripService.dispatch(id);
    res.json({ data: trip });
  } catch (err) {
    next(err);
  }
}

// service.ts — all business rules live here
export async function dispatch(tripId: string) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUniqueOrThrow({ where: { id: tripId }, include: { vehicle: true, driver: true } });

    if (trip.status !== "DRAFT") throw new AppError(400, "only draft trips can be dispatched");
    if (trip.vehicle.status !== "AVAILABLE") throw new AppError(409, "vehicle not available");
    if (trip.driver.status !== "AVAILABLE") throw new AppError(409, "driver not available");
    if (trip.driver.licenseExpiry < new Date()) throw new AppError(422, "driver license expired");
    if (trip.cargoWeight > trip.vehicle.maxLoadCapacity) throw new AppError(422, "cargo exceeds vehicle capacity");

    const [updated] = await Promise.all([
      tx.trip.update({ where: { id: tripId }, data: { status: "DISPATCHED", dispatchedAt: new Date() } }),
      tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "ON_TRIP" } }),
      tx.driver.update({ where: { id: trip.driverId }, data: { status: "ON_TRIP" } }),
    ]);

    return updated;
  });
}
```

> [!IMPORTANT]
> **Every status transition uses `prisma.$transaction()`** — vehicle + driver + trip status changes happen atomically. No partial updates if something fails mid-way.

### 2. Zod as single source of truth

One schema definition, used everywhere:

```ts
// shared/schemas/vehicle.ts
export const createVehicleSchema = z.object({
  registrationNumber: z.string().min(1, "registration number required").max(20),
  name: z.string().min(1, "vehicle name required"),
  type: z.enum(["TRUCK", "VAN", "BUS", "CAR", "BIKE"]),
  maxLoadCapacity: z.number().positive("capacity must be positive"),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().optional(),
});

// server uses it in middleware:
router.post("/", validate(createVehicleSchema), handler.create);

// client uses it in forms:
const form = useForm<z.infer<typeof createVehicleSchema>>({
  resolver: zodResolver(createVehicleSchema),
});
```

Error messages are baked into the schema — the form shows exactly what went wrong per field.

### 3. Typed error handling

No string-based error matching. Structured error class:

```ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

// global error handler catches and formats:
// { error: { message: "cargo exceeds vehicle capacity", field: "cargoWeight", statusCode: 422 } }
```

### 4. TypeScript — practical, not pedantic

Standard tsconfig — use `any` when it makes sense. Avoid `@ts-ignore` — only as a last resort, not a habit. Prisma gives us typed DB queries automatically.

---

## Scalability

| Area | Approach |
|------|----------|
| **DB indexes** | Foreign keys (`vehicleId`, `driverId`), `status` columns, `registrationNumber`, `licenseNumber` — all indexed for fast filters |
| **Pagination** | Cursor-based on all list endpoints (`?cursor=xxx&limit=20`) — works at any scale |
| **Stateless backend** | Sessions in PostgreSQL (Better Auth), no server-side state — ready for horizontal scaling |
| **Docker** | Each service in its own container, shared network, volume for DB persistence |
| **Query optimization** | Prisma `select` to fetch only needed fields, `include` only when relations needed |
| **Connection pooling** | Prisma connection pool with configurable limits via `DATABASE_URL?connection_limit=10` |

**Pagination example:**
```ts
export async function list(cursor?: string, limit = 20, filters?: VehicleFilters) {
  const where = buildWhereClause(filters);
  const vehicles = await prisma.vehicle.findMany({
    where,
    take: limit + 1, // fetch one extra to check if more exist
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { createdAt: "desc" },
  });

  const hasMore = vehicles.length > limit;
  const data = hasMore ? vehicles.slice(0, -1) : vehicles;
  return { data, nextCursor: hasMore ? data[data.length - 1]?.id : null };
}
```

---

## Code Conventions

| Rule | Example |
|------|---------|
| **No abbreviations** | `maintenance` not `maint`, `vehicle` not `veh` |
| **camelCase** for variables/functions | `dispatchTrip`, `cargoWeight` |
| **PascalCase** for types/components | `VehicleStatus`, `DataTable` |
| **UPPER_SNAKE** for enums | `ON_TRIP`, `IN_SHOP` |
| **Consistent file names** | Every module has exactly `routes.ts`, `handler.ts`, `service.ts`, `schema.ts` |
| **Max ~200 lines per file** | Split if growing beyond — signals too many responsibilities |
| **Comments only when *why*, not *what*** | `// atomic: all three must change together` not `// update vehicle status` |
| **Comments lowercase, minimal** | `// kg`, `// only draft trips` |
| **Import order** | external libs → internal modules → relative imports, separated by blank line |
| **No default exports** | Named exports everywhere — easier to grep and refactor |

---

## Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React 18 + TypeScript + Vite | Fast, typed |
| UI | shadcn/ui + Radix + Tailwind v3 | Odoo-inspired palette, no blue |
| Forms | React Hook Form + Zod | Field-level errors |
| Server State | TanStack Query | Cache, refetch, mutations |
| Global State | Redux Toolkit | Theme, user prefs |
| Routing | React Router v6 | Protected routes |
| Charts | Recharts | Lightweight |
| CSV | Native Blob API | No deps |
| Backend | Express + TypeScript | Minimal |
| ORM | Prisma | Type-safe, migrations |
| Auth | Better Auth | Session mgmt, RBAC, CSRF, Prisma adapter |
| Validation | Zod (shared) | Client + server |
| Database | PostgreSQL 16 | Docker container |
| Containers | Docker + Docker Compose | Full stack networking |

---

## Project Structure

```
transitOps-odoo/
├── docker-compose.yml
├── .env.example
│
├── shared/                          # shared between client + server
│   └── schemas/                     # zod schemas — single source of truth
│       ├── vehicle.ts
│       ├── driver.ts
│       ├── trip.ts
│       ├── maintenance.ts
│       ├── fuel.ts
│       └── expense.ts
│
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── index.ts
│       ├── lib/
│       │   ├── auth.ts              # better-auth config
│       │   ├── prisma.ts            # prisma client singleton
│       │   └── env.ts               # env validation with zod
│       ├── middleware/
│       │   ├── rbac.ts              # role check
│       │   ├── validate.ts          # zod middleware
│       │   ├── limiter.ts
│       │   └── errors.ts            # AppError class + global handler
│       ├── modules/
│       │   ├── vehicles/
│       │   │   ├── routes.ts
│       │   │   ├── handler.ts
│       │   │   ├── service.ts
│       │   │   └── schema.ts        # re-exports from shared + server-only schemas
│       │   ├── drivers/
│       │   │   ├── routes.ts
│       │   │   ├── handler.ts
│       │   │   ├── service.ts
│       │   │   └── schema.ts
│       │   ├── trips/
│       │   │   ├── routes.ts
│       │   │   ├── handler.ts
│       │   │   ├── service.ts
│       │   │   └── schema.ts
│       │   ├── maintenance/
│       │   │   ├── routes.ts
│       │   │   ├── handler.ts
│       │   │   ├── service.ts
│       │   │   └── schema.ts
│       │   ├── fuel/
│       │   │   ├── routes.ts
│       │   │   ├── handler.ts
│       │   │   ├── service.ts
│       │   │   └── schema.ts
│       │   └── analytics/
│       │       ├── routes.ts
│       │       ├── handler.ts
│       │       └── service.ts
│       └── utils/
│           └── csv.ts
│
├── client/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── globals.css
│       ├── lib/
│       │   ├── auth-client.ts
│       │   ├── api.ts               # fetch wrapper with error handling
│       │   └── utils.ts
│       ├── store/
│       │   ├── index.ts
│       │   └── themeSlice.ts
│       ├── hooks/
│       │   ├── useVehicles.ts       # tanstack query hooks
│       │   ├── useDrivers.ts
│       │   ├── useTrips.ts
│       │   └── useAnalytics.ts
│       ├── components/
│       │   ├── ui/                   # shadcn
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Header.tsx
│       │   │   └── Shell.tsx
│       │   ├── dashboard/
│       │   │   ├── StatCard.tsx
│       │   │   └── Charts.tsx
│       │   └── shared/
│       │       ├── DataTable.tsx
│       │       ├── StatusBadge.tsx
│       │       └── Confirm.tsx
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Vehicles.tsx
│       │   ├── Drivers.tsx
│       │   ├── Trips.tsx
│       │   ├── Maintenance.tsx
│       │   ├── FuelExpenses.tsx
│       │   └── Reports.tsx
│       └── guards/
│           └── AuthGuard.tsx
│
└── nginx/
    ├── Dockerfile
    └── nginx.conf
```

---

## Database Schema

Better Auth auto-generates: `user`, `session`, `account`, `verification` tables.

Our models:

```prisma
model Vehicle {
  id                 String        @id @default(uuid())
  registrationNumber String        @unique
  name               String
  type               VehicleType
  maxLoadCapacity    Float         // kg
  currentOdometer    Float         @default(0)
  acquisitionCost    Float
  status             VehicleStatus @default(AVAILABLE)
  region             String?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  trips           Trip[]
  maintenanceLogs MaintenanceLog[]
  fuelLogs        FuelLog[]
  expenses        Expense[]

  @@index([status])
  @@index([type])
  @@index([region])
}

enum VehicleType { TRUCK, VAN, BUS, CAR, BIKE }
enum VehicleStatus { AVAILABLE, ON_TRIP, IN_SHOP, RETIRED }

model Driver {
  id              String       @id @default(uuid())
  name            String
  licenseNumber   String       @unique
  licenseCategory String
  licenseExpiry   DateTime
  contactNumber   String
  safetyScore     Float        @default(100)
  status          DriverStatus @default(AVAILABLE)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  trips Trip[]

  @@index([status])
  @@index([licenseExpiry])
}

enum DriverStatus { AVAILABLE, ON_TRIP, OFF_DUTY, SUSPENDED }

model Trip {
  id             String     @id @default(uuid())
  source         String
  destination    String
  cargoWeight    Float      // kg
  plannedDistance Float     // km
  actualDistance  Float?
  ratePerKm      Float?     // auto-compute: revenue = ratePerKm × actualDistance
  revenue        Float?     // manual override takes priority over computed
  status         TripStatus @default(DRAFT)

  vehicleId String
  vehicle   Vehicle @relation(fields: [vehicleId], references: [id])
  driverId  String
  driver    Driver  @relation(fields: [driverId], references: [id])

  startOdometer Float?
  endOdometer   Float?
  fuelConsumed  Float?

  dispatchedAt DateTime?
  completedAt  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([status])
  @@index([vehicleId])
  @@index([driverId])
}

enum TripStatus { DRAFT, DISPATCHED, COMPLETED, CANCELLED }

model MaintenanceLog {
  id          String            @id @default(uuid())
  vehicleId   String
  vehicle     Vehicle           @relation(fields: [vehicleId], references: [id])
  type        String
  description String?
  cost        Float
  status      MaintenanceStatus @default(ACTIVE)
  startDate   DateTime          @default(now())
  endDate     DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([vehicleId])
  @@index([status])
}

enum MaintenanceStatus { ACTIVE, COMPLETED }

model FuelLog {
  id        String   @id @default(uuid())
  vehicleId String
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id])
  tripId    String?
  liters    Float
  cost      Float
  date      DateTime
  createdAt DateTime @default(now())

  @@index([vehicleId])
  @@index([date])
}

model Expense {
  id          String      @id @default(uuid())
  vehicleId   String
  vehicle     Vehicle     @relation(fields: [vehicleId], references: [id])
  tripId      String?
  type        ExpenseType
  description String?
  amount      Float
  date        DateTime
  createdAt   DateTime    @default(now())

  @@index([vehicleId])
  @@index([type])
}

enum ExpenseType { FUEL, MAINTENANCE, TOLL, INSURANCE, OTHER }
```

**ER Diagram:**

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string name
        string role
    }
    VEHICLE {
        uuid id PK
        string registrationNumber UK
        string name
        enum type
        float maxLoadCapacity
        float currentOdometer
        float acquisitionCost
        enum status
    }
    DRIVER {
        uuid id PK
        string name
        string licenseNumber UK
        date licenseExpiry
        float safetyScore
        enum status
    }
    TRIP {
        uuid id PK
        string source
        string destination
        float cargoWeight
        float plannedDistance
        enum status
        uuid vehicleId FK
        uuid driverId FK
    }
    MAINTENANCE_LOG {
        uuid id PK
        uuid vehicleId FK
        string type
        float cost
        enum status
    }
    FUEL_LOG {
        uuid id PK
        uuid vehicleId FK
        float liters
        float cost
    }
    EXPENSE {
        uuid id PK
        uuid vehicleId FK
        enum type
        float amount
    }

    VEHICLE ||--o{ TRIP : "assigned to"
    DRIVER ||--o{ TRIP : "drives"
    VEHICLE ||--o{ MAINTENANCE_LOG : "has"
    VEHICLE ||--o{ FUEL_LOG : "consumes"
    VEHICLE ||--o{ EXPENSE : "incurs"
```

---

## API Routes

| Method | Route | What | Access |
|--------|-------|------|--------|
| ALL | `/api/auth/*` | Better Auth handles | public/auth |
| GET | `/api/vehicles` | list (cursor paginated, filterable) | auth |
| POST | `/api/vehicles` | create | manager+ |
| PUT | `/api/vehicles/:id` | update | manager+ |
| DELETE | `/api/vehicles/:id` | delete | admin |
| GET | `/api/drivers` | list (cursor paginated, filterable) | auth |
| POST | `/api/drivers` | create | manager+ |
| PUT | `/api/drivers/:id` | update | manager+ |
| DELETE | `/api/drivers/:id` | delete | admin |
| GET | `/api/trips` | list | auth |
| POST | `/api/trips` | create (draft) | dispatcher+ |
| PUT | `/api/trips/:id/dispatch` | dispatch | dispatcher+ |
| PUT | `/api/trips/:id/complete` | complete | dispatcher+ |
| PUT | `/api/trips/:id/cancel` | cancel | dispatcher+ |
| GET | `/api/maintenance` | list | auth |
| POST | `/api/maintenance` | create → vehicle "In Shop" | manager+ |
| PUT | `/api/maintenance/:id/close` | close → vehicle "Available" | manager+ |
| GET | `/api/fuel` | list fuel logs | auth |
| POST | `/api/fuel` | record | dispatcher+ |
| GET | `/api/expenses` | list expenses | auth |
| POST | `/api/expenses` | record | dispatcher+ |
| GET | `/api/analytics/dashboard` | KPIs | auth |
| GET | `/api/analytics/reports` | charts data | auth |
| GET | `/api/analytics/export/csv` | csv download | auth |

---

## Business Rules (server-side, in transactions)

1. Vehicle `registrationNumber` must be unique
2. Only `AVAILABLE` vehicles in dispatch selection
3. Only `AVAILABLE` drivers with valid license in dispatch
4. `cargoWeight` ≤ vehicle `maxLoadCapacity`
5. Dispatch → vehicle + driver → `ON_TRIP` (atomic)
6. Complete → both → `AVAILABLE` + record odometer/fuel (atomic)
7. Cancel → both → `AVAILABLE` (atomic)
8. Create maintenance → vehicle → `IN_SHOP` (atomic)
9. Close maintenance → vehicle → `AVAILABLE` unless `RETIRED` (atomic)

---

## Security

| Concern | Solution |
|---------|----------|
| Auth | Better Auth (session cookies, scrypt) |
| CSRF | Better Auth built-in |
| RBAC | Admin plugin + custom middleware |
| Input | Zod on all endpoints |
| SQL | Prisma parameterized |
| XSS | React JSX escaping |
| Rate limit | express-rate-limit |
| Headers | Helmet (CSP, X-Frame, nosniff) |
| CORS | Frontend origin only |
| Secrets | Env vars, never hardcoded |
| TODO(security) | OAuth, MFA, leaked password check |

---

## Docker

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: transitops
      POSTGRES_USER: transitops_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U transitops_user"]

  server:
    build: ./server
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://transitops_user:${DB_PASSWORD}@postgres:5432/transitops
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      BETTER_AUTH_URL: http://localhost:3000
    networks:
      - app-net

  client:
    build: ./client
    depends_on:
      - server
    networks:
      - app-net

  nginx:
    build: ./nginx
    ports:
      - "80:80"
    depends_on:
      - client
      - server
    networks:
      - app-net

volumes:
  pgdata:

networks:
  app-net:
    driver: bridge
```

---

## Implementation Phases

| # | What | Key Files |
|---|------|-----------|
| 1 | Project init, Docker configs, env files, shared schemas | root, `shared/` |
| 2 | Prisma schema + Better Auth, migrations, seed | `prisma/`, `lib/auth.ts` |
| 3 | CRUD routes + business rules with transactions | `server/src/modules/*` |
| 4 | RBAC middleware, rate limiting, security headers | `middleware/*` |
| 5 | Frontend shell: sidebar, header, routing, Redux, auth-client | `layout/`, `store/` |
| 6 | Vehicle, Driver, Maintenance, Fuel pages with forms | `pages/*` |
| 7 | Trip workflow — dispatch/complete/cancel | `Trips.tsx` |
| 8 | Dashboard KPIs + charts | `Dashboard.tsx` |
| 9 | Reports + CSV export | `Reports.tsx` |
| 10 | Dark mode, responsive, animations | throughout |

---

## Verification

### Scenario walkthrough
1. Register Van-05 (500kg, Available)
2. Register driver Alex (valid license)
3. Create trip 450kg → validates ≤ 500kg → dispatch
4. Vehicle + driver auto → ON_TRIP
5. Complete trip (enter odometer + fuel)
6. Both auto → AVAILABLE
7. Create maintenance → vehicle auto → IN_SHOP
8. Reports update cost + fuel efficiency

### Security checks
- Session in HttpOnly cookie
- CSRF built-in
- Rate limiting active
- Zod field-level errors
- No SQL injection
- No XSS
- Env-only secrets
