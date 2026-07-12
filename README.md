# TransitOps

**Smart Transport Operations Platform** — a centralized system to digitize vehicle, driver, dispatch, maintenance, and expense management with enforced business rules and operational insights.

---

### Login
![Login Page](screenshots/1.png)

### Reports & Analytics
![Reports — Fuel Efficiency & Cost Breakdown](screenshots/1_1.png)

![Reports — Revenue vs Cost & Vehicle ROI](screenshots/1_2.png)

### Dashboard
![Dashboard — Fleet overview & key metrics](screenshots/2.png)

### Trips
![Trips — Dispatch & tracking](screenshots/3.png)

### Vehicles
![Vehicles](screenshots/4.png)

### Drivers
![Drivers](screenshots/5.png)

### Maintenance
![Maintenance](screenshots/6.png)

### Fuel & Expenses
![Fuel & Expenses](screenshots/7.png)

---

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker Compose)

### Setup

```bash

git clone https://github.com/hemantch01/transitOps-odoo.git
cd transitOps-odoo

cp .env.example .env

npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

cd server
npx prisma migrate dev
npm run db:seed
cd ..

cd server && npm run dev
```

### Docker

```bash
docker-compose up
```

---
